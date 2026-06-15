import type { RequestHandler } from 'expo-router/server';
import { MongoClient, ObjectId } from 'mongodb';

declare const process: {
  env: Record<string, string | undefined>;
};

const DB_NAME = 'ref';
const CONVERSATION_MAP_COLLECTION = 'ConversationIdToPatientIdMap';
const CONVERSATION_COLLECTION = 'Conversation';
const TREND_CACHE_COLLECTION = 'PatientTrendCache';
const TIME_ZONE = 'Asia/Singapore';

type TrendDay = {
  date: string;
  duration: number;
  status: 'green' | 'yellow' | 'red';
  missed: boolean;
};

type ConversationMap = {
  conversationId?: ObjectId;
  createdAt?: Date;
};

type Conversation = {
  duration?: number;
};

type CachedTrend = {
  patientId?: ObjectId;
  days?: number;
  cacheDate?: string;
  trend?: TrendDay[];
};

export const GET: RequestHandler = async (request) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const days = Number(url.searchParams.get('days') || 7);

  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: 'Valid patient id is required' }, { status: 400 });
  }

  if (days !== 7 && days !== 30) {
    return Response.json({ error: 'Only 7-day and 30-day trends are available.' }, { status: 400 });
  }

  const patientId = new ObjectId(id);
  const cacheDate = getLocalDateKey(new Date());
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const cached = await db.collection(TREND_CACHE_COLLECTION).findOne({
      patientId,
      days,
      cacheDate,
    }) as CachedTrend | null;

    if (cached?.trend) {
      return Response.json({ cacheDate, days, trend: cached.trend });
    }

    const trend = await buildTrend(client, patientId, days);
    const now = new Date();
    await db.collection(TREND_CACHE_COLLECTION).updateOne(
      { patientId, days, cacheDate },
      {
        $set: {
          patientId,
          days,
          cacheDate,
          trend,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    );

    return Response.json({ cacheDate, days, trend });
  } finally {
    await client.close();
  }
};

async function buildTrend(client: MongoClient, patientId: ObjectId, days: number) {
  const db = client.db(DB_NAME);
  const dates = getRecentLocalDateKeys(days);
  const trend: TrendDay[] = [];

  for (const date of dates) {
    const { start, end } = getUtcBoundsForLocalDate(date);
    const map = await db.collection(CONVERSATION_MAP_COLLECTION).findOne(
      {
        patientId,
        createdAt: { $gte: start, $lt: end },
      },
      { sort: { createdAt: -1, updatedAt: -1 } },
    ) as ConversationMap | null;

    const conversation = map?.conversationId
      ? await db.collection(CONVERSATION_COLLECTION).findOne({ _id: map.conversationId }) as Conversation | null
      : null;

    const duration = conversation?.duration || 0;
    trend.push({
      date,
      duration,
      status: duration > 0 ? 'green' : 'red',
      missed: duration === 0,
    });
  }

  return trend;
}

function getRecentLocalDateKeys(days: number) {
  const today = getLocalDateKey(new Date());
  const dates: string[] = [];
  const [year, month, day] = today.split('-').map(Number);
  const end = Date.UTC(year, month - 1, day);

  for (let index = days - 1; index >= 0; index--) {
    const date = new Date(end - index * 24 * 60 * 60 * 1000);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function getUtcBoundsForLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, -8, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, -8, 0, 0, 0));
  return { start, end };
}

function getLocalDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: TIME_ZONE,
    year: 'numeric',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
