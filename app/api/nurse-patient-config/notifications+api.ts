import type { RequestHandler } from 'expo-router/server';
import { MongoClient, ObjectId } from 'mongodb';

declare const process: {
  env: Record<string, string | undefined>;
};

const DB_NAME = 'ref';
const COLLECTION_NAME = 'NursePatientConfig';
const ALERT_SENSITIVITIES = [
  'notify_me_about_everything',
  'only_important_changes',
  'only_urgent_alerts',
] as const;
const SUMMARY_TIMES = ['09:00', '19:00'] as const;

type UpdateNotificationsBody = {
  nurseId?: string;
  pushNotificationsEnabled?: boolean;
  alertSensitivity?: string;
  preferredDailySummaryTime?: string;
};

export const PATCH: RequestHandler = async (request) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const body = (await request.json()) as UpdateNotificationsBody;
  const validationError = validateBody(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    let filter = body.nurseId
      ? { _id: new ObjectId(body.nurseId) }
      : {};

    if (!body.nurseId) {
      const latest = await collection.findOne({}, { sort: { createdAt: -1 } });
      if (!latest?._id) {
        return Response.json({ error: 'Nurse config not found' }, { status: 404 });
      }
      filter = { _id: latest._id };
    }

    const updateResult = await collection.updateOne(
      filter,
      {
        $set: {
          pushNotificationsEnabled: body.pushNotificationsEnabled,
          alertSensitivity: body.alertSensitivity,
          preferredDailySummaryTime: body.preferredDailySummaryTime,
          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      return Response.json({ error: 'Nurse config not found' }, { status: 404 });
    }

    const result = await collection.findOne(filter);

    return Response.json({
      nurseId: result?._id?.toHexString?.() || '',
      pushNotificationsEnabled: result?.pushNotificationsEnabled,
      alertSensitivity: result?.alertSensitivity,
      preferredDailySummaryTime: result?.preferredDailySummaryTime,
    });
  } finally {
    await client.close();
  }
};

function validateBody(body: UpdateNotificationsBody) {
  if (typeof body.pushNotificationsEnabled !== 'boolean') {
    return 'Push notification setting is required.';
  }
  if (!isOneOf(body.alertSensitivity, ALERT_SENSITIVITIES)) {
    return 'Alert sensitivity is invalid.';
  }
  if (!isOneOf(body.preferredDailySummaryTime, SUMMARY_TIMES)) {
    return 'Preferred daily summary time is invalid.';
  }
  if (body.nurseId && !ObjectId.isValid(body.nurseId)) {
    return 'Nurse id is invalid.';
  }

  return '';
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === 'string' && options.includes(value);
}
