import type { RequestHandler } from 'expo-router/server';
import { MongoClient } from 'mongodb';

declare const process: {
  env: Record<string, string | undefined>;
};

const DB_NAME = 'ref';
const COLLECTION_NAME = 'NursePatientConfig';

type StoredPatient = {
  _id?: { toHexString?: () => string };
  name?: string;
  age?: number;
  preferredLanguage?: string;
  speechSpeed?: string;
  mirrorName?: string;
  photoUrl?: string;
};

export const GET: RequestHandler = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const document = await client
      .db(DB_NAME)
      .collection(COLLECTION_NAME)
      .findOne(
        {},
        {
          sort: { createdAt: -1 },
          projection: {
            alertSensitivity: 1,
            email: 1,
            name: 1,
            patients: 1,
            phoneNumber: 1,
            preferredDailySummaryTime: 1,
            pushNotificationsEnabled: 1,
          },
        },
      );

    const patients = ((document?.patients || []) as StoredPatient[]).map((patient, index) => ({
      id: patient._id?.toHexString?.() || String(index),
      name: patient.name || `Person ${index + 1}`,
      age: patient.age || 0,
      preferredLanguage: patient.preferredLanguage || '',
      speechSpeed: patient.speechSpeed || 'Slow',
      mirrorName: patient.mirrorName || `Mirror ${index + 1}`,
      photoUrl: patient.photoUrl || '',
    }));

    return Response.json({
      nurseId: document?._id?.toHexString?.() || '',
      caregiverName: document?.name || '',
      email: document?.email || '',
      phoneNumber: document?.phoneNumber || '',
      pushNotificationsEnabled: Boolean(document?.pushNotificationsEnabled),
      alertSensitivity: document?.alertSensitivity || 'only_important_changes',
      preferredDailySummaryTime: document?.preferredDailySummaryTime || '09:00',
      patients,
    });
  } finally {
    await client.close();
  }
};
