import type { RequestHandler } from 'expo-router/server';
import { MongoClient, ObjectId } from 'mongodb';

declare function require(moduleName: string): {
  pbkdf2Sync: (
    password: string,
    salt: string,
    iterations: number,
    keylen: number,
    digest: string,
  ) => { toString: (encoding: string) => string };
  randomBytes: (size: number) => { toString: (encoding: string) => string };
};

declare const process: {
  env: Record<string, string | undefined>;
};

const { pbkdf2Sync, randomBytes } = require('crypto');

const DB_NAME = 'ref';
const COLLECTION_NAME = 'NursePatientConfig';

const RELATIONSHIPS = ['child', 'sibling', 'spouse', 'other'] as const;
const GENDERS = ['male', 'female', 'other'] as const;
const LANGUAGES = ['english', 'mandarin', 'other'] as const;
const TOPICS = ['family', 'food', 'travel', 'work', 'others'] as const;
const ALERT_SENSITIVITIES = [
  'notify_me_about_everything',
  'only_important_changes',
  'only_urgent_alerts',
] as const;
const SUMMARY_TIMES = ['09:00', '19:00'] as const;

type AccountBody = {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  relationshipToElderly?: string;
};

type PatientBody = {
  name?: string;
  age?: number;
  gender?: string;
  preferredLanguage?: string;
  usualWakeTime?: string;
  speechOrHearingConditions?: string;
  photoUrl?: string;
  keyTopics?: string[];
  keyTopicsOtherText?: string;
  mirrorName?: string;
};

type NotificationsBody = {
  pushNotificationsEnabled?: boolean;
  alertSensitivity?: string;
  preferredDailySummaryTime?: string;
};

type CreateConfigBody = {
  account?: AccountBody;
  patients?: PatientBody[];
  notifications?: NotificationsBody;
};

export const POST: RequestHandler = async (request) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Response.json({ error: 'MONGODB_URI is not set' }, { status: 500 });
  }

  const body = (await request.json()) as CreateConfigBody;
  const validationError = validateBody(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const now = new Date();
  const account = body.account as Required<AccountBody>;
  const notifications = body.notifications as Required<NotificationsBody>;
  const patients = body.patients as PatientBody[];

  const document = {
    name: account.name.trim(),
    email: account.email.trim().toLowerCase(),
    passwordHash: hashPassword(account.password),
    phoneNumber: account.phoneNumber.trim(),
    relationshipToElderly: account.relationshipToElderly,
    pushNotificationsEnabled: notifications.pushNotificationsEnabled,
    alertSensitivity: notifications.alertSensitivity,
    preferredDailySummaryTime: notifications.preferredDailySummaryTime,
    patients: patients.map((patient, index) => {
      const mirrorId = new ObjectId();
      return {
        _id: new ObjectId(),
        name: patient.name?.trim(),
        age: patient.age,
        gender: patient.gender,
        preferredLanguage: patient.preferredLanguage,
        usualWakeTime: patient.usualWakeTime?.trim(),
        speechOrHearingConditions: patient.speechOrHearingConditions?.trim() || undefined,
        photoUrl: patient.photoUrl?.trim() || undefined,
        keyTopics: patient.keyTopics,
        keyTopicsOtherText: patient.keyTopicsOtherText?.trim() || undefined,
        mirrorId,
        mirrorName: patient.mirrorName?.trim() || `Mirror ${index + 1}`,
        mirrorVerified: false,
      };
    }),
    createdAt: now,
    updatedAt: now,
  };

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const result = await client
      .db(DB_NAME)
      .collection(COLLECTION_NAME)
      .insertOne(document);

    return Response.json({
      insertedId: result.insertedId.toHexString(),
      patientCount: document.patients.length,
    });
  } finally {
    await client.close();
  }
};

function validateBody(body: CreateConfigBody) {
  const account = body.account;
  if (!account) return 'Account details are required.';
  if (!account.name?.trim()) return 'Name is required.';
  if (!account.email?.trim() || !account.email.includes('@')) return 'A valid email is required.';
  if (!account.password || account.password.length < 8) return 'Password must be at least 8 characters.';
  if (!account.phoneNumber?.trim()) return 'Phone number is required.';
  if (!isOneOf(account.relationshipToElderly, RELATIONSHIPS)) {
    return 'Relationship to elderly person is invalid.';
  }

  const patients = body.patients;
  if (!Array.isArray(patients) || patients.length === 0) {
    return 'At least one elderly profile is required.';
  }

  for (const patient of patients) {
    if (!patient.name?.trim()) return 'Each elderly profile needs a name.';
    if (
      typeof patient.age !== 'number' ||
      !Number.isInteger(patient.age) ||
      patient.age < 1 ||
      patient.age > 130
    ) {
      return 'Each elderly profile needs a valid age.';
    }
    if (!isOneOf(patient.gender, GENDERS)) return 'Patient gender is invalid.';
    if (!isOneOf(patient.preferredLanguage, LANGUAGES)) return 'Patient preferred language is invalid.';
    if (!patient.usualWakeTime?.trim()) return 'Each elderly profile needs a usual wake time.';
    if (!Array.isArray(patient.keyTopics) || patient.keyTopics.length === 0) {
      return 'Each elderly profile needs at least one key topic.';
    }
    if (patient.keyTopics.some((topic) => !isOneOf(topic, TOPICS))) {
      return 'One or more key topics are invalid.';
    }
    if (patient.keyTopics.includes('others') && !patient.keyTopicsOtherText?.trim()) {
      return 'Other topic text is required when Others is selected.';
    }
  }

  const notifications = body.notifications;
  if (!notifications) return 'Notification settings are required.';
  if (typeof notifications.pushNotificationsEnabled !== 'boolean') {
    return 'Push notification setting is required.';
  }
  if (!isOneOf(notifications.alertSensitivity, ALERT_SENSITIVITIES)) {
    return 'Alert sensitivity is invalid.';
  }
  if (!isOneOf(notifications.preferredDailySummaryTime, SUMMARY_TIMES)) {
    return 'Preferred daily summary time is invalid.';
  }

  return '';
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === 'string' && options.includes(value);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}
