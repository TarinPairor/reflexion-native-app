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
      .findOne({}, { sort: { createdAt: -1 }, projection: { patients: 1 } });

    const patients = ((document?.patients || []) as StoredPatient[]).map((patient, index) => ({
      id: patient._id?.toHexString?.() || String(index),
      name: patient.name || `Person ${index + 1}`,
      age: patient.age || 0,
      mirrorName: patient.mirrorName || `Mirror ${index + 1}`,
      photoUrl: patient.photoUrl || '',
    }));

    return Response.json({ patients });
  } finally {
    await client.close();
  }
};
