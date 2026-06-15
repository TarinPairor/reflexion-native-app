import type { RequestHandler } from 'expo-router/server';
import { MongoClient, ObjectId } from 'mongodb';

declare const process: {
  env: Record<string, string | undefined>;
};

const DB_NAME = 'ref';
const NURSE_CONFIG_COLLECTION = 'NursePatientConfig';
const CONVERSATION_MAP_COLLECTION = 'ConversationIdToPatientIdMap';
const CONVERSATION_COLLECTION = 'Conversation';

type StoredPatient = {
  _id?: ObjectId;
  name?: string;
  age?: number;
  gender?: string;
  preferredLanguage?: string;
  usualWakeTime?: string;
  speechOrHearingConditions?: string;
  photoUrl?: string;
  keyTopics?: string[];
  keyTopicsOtherText?: string;
  mirrorId?: ObjectId;
  mirrorName?: string;
  mirrorVerified?: boolean;
};

type ConversationMap = {
  conversationId?: ObjectId;
  patientId?: ObjectId;
  createdAt?: Date;
};

type Conversation = {
  _id?: ObjectId;
  duration?: number;
  words?: number;
  exchanges?: number;
  avgLatency?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export const GET: RequestHandler = async (request) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: 'Valid patient id is required' }, { status: 400 });
  }

  const patientId = new ObjectId(id);
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const config = await db
      .collection(NURSE_CONFIG_COLLECTION)
      .findOne(
        { 'patients._id': patientId },
        { projection: { _id: 1, patients: { $elemMatch: { _id: patientId } } } },
      );

    const patient = (config?.patients?.[0] || null) as StoredPatient | null;
    if (!patient) {
      return Response.json({ error: 'Patient not found' }, { status: 404 });
    }

    const latestMap = await db
      .collection(CONVERSATION_MAP_COLLECTION)
      .findOne(
        { patientId },
        { sort: { createdAt: -1, updatedAt: -1 } },
      ) as ConversationMap | null;

    const conversation = latestMap?.conversationId
      ? await db.collection(CONVERSATION_COLLECTION).findOne({ _id: latestMap.conversationId }) as Conversation | null
      : null;

    const spokenAt = conversation?.createdAt || latestMap?.createdAt || null;

    return Response.json({
      patient: {
        id,
        name: patient.name || 'Patient',
        age: patient.age || null,
        gender: patient.gender || '',
        preferredLanguage: patient.preferredLanguage || '',
        usualWakeTime: patient.usualWakeTime || '',
        photoUrl: patient.photoUrl || '',
        mirrorId: patient.mirrorId?.toHexString?.() || '',
        mirrorName: patient.mirrorName || '',
        mirrorVerified: Boolean(patient.mirrorVerified),
        keyTopics: patient.keyTopics || [],
      },
      latestConversation: conversation
        ? {
            id: latestMap?.conversationId?.toHexString?.() || '',
            duration: conversation.duration || 0,
            words: conversation.words || 0,
            exchanges: conversation.exchanges || 0,
            avgLatency: conversation.avgLatency || 0,
            createdAt: spokenAt?.toISOString?.() || null,
          }
        : null,
    });
  } finally {
    await client.close();
  }
};
