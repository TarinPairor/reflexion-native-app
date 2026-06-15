import type { RequestHandler } from 'expo-router/server';
import { MongoClient, ObjectId } from 'mongodb';

declare const process: {
  env: Record<string, string | undefined>;
};

const DB_NAME = 'ref';
const CONVERSATION_COLLECTION = 'Conversation';
const CONVERSATION_MAP_COLLECTION = 'ConversationIdToPatientIdMap';
const NURSE_CONFIG_COLLECTION = 'NursePatientConfig';

type ConversationLog = {
  sentence?: string;
  role?: string;
  words?: number;
  duration?: number;
  wordsPerSecond?: number;
};

type Conversation = {
  _id?: ObjectId;
  conversationId?: ObjectId;
  duration?: number;
  words?: number;
  exchanges?: number;
  avgLatency?: number;
  logs?: ConversationLog[];
  createdAt?: Date;
  updatedAt?: Date;
};

type ConversationMap = {
  conversationId?: ObjectId;
  patientId?: ObjectId;
  nurseId?: ObjectId;
};

type StoredPatient = {
  _id?: ObjectId;
  name?: string;
};

export const GET: RequestHandler = async (request) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: 'Valid conversation id is required' }, { status: 400 });
  }

  const conversationId = new ObjectId(id);
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const conversation = await db
      .collection(CONVERSATION_COLLECTION)
      .findOne({
        $or: [{ _id: conversationId }, { conversationId }],
      }) as Conversation | null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const map = await db
      .collection(CONVERSATION_MAP_COLLECTION)
      .findOne({ conversationId }) as ConversationMap | null;

    const patient = map?.patientId
      ? await findPatient(db, map.patientId)
      : null;

    return Response.json({
      id,
      patientId: map?.patientId?.toHexString?.() || '',
      patientName: patient?.name || 'Patient',
      duration: conversation.duration || 0,
      words: conversation.words || 0,
      exchanges: conversation.exchanges || 0,
      avgLatency: conversation.avgLatency || 0,
      createdAt: conversation.createdAt?.toISOString?.() || null,
      updatedAt: conversation.updatedAt?.toISOString?.() || null,
      logs: (conversation.logs || []).map((log) => ({
        sentence: log.sentence || '',
        role: log.role || '',
        words: log.words || 0,
        duration: log.duration || 0,
        wordsPerSecond: log.wordsPerSecond || 0,
      })),
    });
  } finally {
    await client.close();
  }
};

async function findPatient(db: ReturnType<MongoClient['db']>, patientId: ObjectId) {
  const config = await db
    .collection(NURSE_CONFIG_COLLECTION)
    .findOne(
      { 'patients._id': patientId },
      { projection: { patients: { $elemMatch: { _id: patientId } } } },
    );

  return (config?.patients?.[0] || null) as StoredPatient | null;
}
