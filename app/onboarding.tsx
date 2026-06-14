import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from './apiUrl';

type Relationship = 'child' | 'sibling' | 'spouse' | 'other';
type Gender = 'male' | 'female' | 'other';
type PreferredLanguage = 'english' | 'mandarin' | 'other';
type Topic = 'family' | 'food' | 'travel' | 'work' | 'others';
type AlertSensitivity =
  | 'notify_me_about_everything'
  | 'only_important_changes'
  | 'only_urgent_alerts';
type SummaryTime = '09:00' | '19:00';

type AccountForm = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  relationshipToElderly: Relationship;
};

type PatientForm = {
  name: string;
  age: string;
  gender: Gender;
  preferredLanguage: PreferredLanguage;
  usualWakeTime: string;
  speechOrHearingConditions: string;
  photoUrl: string;
  keyTopics: Topic[];
  keyTopicsOtherText: string;
  mirrorName: string;
};

type NotificationForm = {
  pushNotificationsEnabled: boolean;
  alertSensitivity: AlertSensitivity;
  preferredDailySummaryTime: SummaryTime;
};

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string }[] = [
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'other', label: 'Other' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const LANGUAGE_OPTIONS: { value: PreferredLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'other', label: 'Other' },
];

const TOPIC_OPTIONS: { value: Topic; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'work', label: 'Work' },
  { value: 'others', label: 'Others' },
];

const ALERT_OPTIONS: { value: AlertSensitivity; label: string }[] = [
  { value: 'notify_me_about_everything', label: 'Notify me about everything' },
  { value: 'only_important_changes', label: 'Only important changes' },
  { value: 'only_urgent_alerts', label: 'Only urgent alerts' },
];

const SUMMARY_OPTIONS: { value: SummaryTime; label: string }[] = [
  { value: '09:00', label: 'Morning push at 9am' },
  { value: '19:00', label: 'Evening push at 7pm' },
];

const blankPatient = (index: number): PatientForm => ({
  name: '',
  age: '',
  gender: 'male',
  preferredLanguage: 'english',
  usualWakeTime: '07:30',
  speechOrHearingConditions: '',
  photoUrl: '',
  keyTopics: ['family'],
  keyTopicsOtherText: '',
  mirrorName: `Mirror ${index + 1}`,
});

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [account, setAccount] = useState<AccountForm>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    relationshipToElderly: 'child',
  });
  const [patients, setPatients] = useState<PatientForm[]>([blankPatient(0)]);
  const [notifications, setNotifications] = useState<NotificationForm>({
    pushNotificationsEnabled: true,
    alertSensitivity: 'only_important_changes',
    preferredDailySummaryTime: '09:00',
  });

  const selectedPatient = patients[selectedPatientIndex];
  const canGoBack = step > 1;
  const stepTitle = useMemo(() => {
    if (step === 1) return 'Account creation';
    if (step === 2) return `Elderly profile ${selectedPatientIndex + 1}`;
    if (step === 3) return 'Mirror linking';
    return 'Notification setup';
  }, [selectedPatientIndex, step]);

  function updatePatient(index: number, updates: Partial<PatientForm>) {
    setPatients((current) =>
      current.map((patient, patientIndex) =>
        patientIndex === index ? { ...patient, ...updates } : patient,
      ),
    );
  }

  function addPatient() {
    setPatients((current) => [...current, blankPatient(current.length)]);
    setSelectedPatientIndex(patients.length);
  }

  function removePatient(index: number) {
    if (patients.length === 1) {
      Alert.alert('One profile required', 'Add at least one elderly profile before continuing.');
      return;
    }

    setPatients((current) => current.filter((_, patientIndex) => patientIndex !== index));
    setSelectedPatientIndex((current) => {
      if (current === index) {
        return Math.max(0, index - 1);
      }

      if (current > index) {
        return current - 1;
      }

      return current;
    });
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!account.name.trim() || !account.email.trim() || !account.password || !account.phoneNumber.trim()) {
        return 'Enter your name, email, password, and phone number.';
      }
      if (!account.email.includes('@')) {
        return 'Enter a valid email address.';
      }
      if (account.password.length < 8) {
        return 'Use a password with at least 8 characters.';
      }
    }

    if (step === 2) {
      for (const patient of patients) {
        if (!patient.name.trim() || !patient.age.trim() || !patient.usualWakeTime.trim()) {
          return 'Each elderly profile needs a name, age, and usual wake time.';
        }
        const age = Number(patient.age);
        if (!Number.isInteger(age) || age < 1 || age > 130) {
          return 'Enter a valid age for each elderly profile.';
        }
        if (patient.keyTopics.length === 0) {
          return 'Choose at least one topic for each elderly profile.';
        }
        if (patient.keyTopics.includes('others') && !patient.keyTopicsOtherText.trim()) {
          return 'Add free text for any profile using the Others topic.';
        }
      }
    }

    if (step === 3) {
      if (patients.some((patient) => !patient.mirrorName.trim())) {
        return 'Give each temporary mirror a name.';
      }
    }

    return '';
  }

  async function goNext() {
    setNotice(null);
    const validationMessage = validateCurrentStep();
    if (validationMessage) {
      setNotice({ type: 'error', message: validationMessage });
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    await submit();
  }

  async function submit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch(getApiUrl('/api/nurse-patient-config/create'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          account,
          patients: patients.map((patient) => ({
            ...patient,
            age: Number(patient.age),
          })),
          notifications,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error || 'Unable to create onboarding profile.');
      }

      setNotice({
        type: 'success',
        message: `Created caregiver profile with ${body.patientCount} elderly profile${body.patientCount === 1 ? '' : 's'}.`,
      });
      setTimeout(() => router.replace('/(tabs)'), 900);
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to create onboarding profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Step {step} of 4</Text>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle(step, patients.length)}</Text>
          </View>

          <View style={styles.progressTrack}>
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={[styles.progressStep, item <= step && styles.progressStepActive]}
              />
            ))}
          </View>

          {notice ? (
            <View style={[styles.notice, notice.type === 'success' ? styles.noticeSuccess : styles.noticeError]}>
              <Text style={[styles.noticeText, notice.type === 'success' ? styles.noticeSuccessText : styles.noticeErrorText]}>
                {notice.message}
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <AccountStep account={account} setAccount={setAccount} />
          ) : null}

          {step === 2 ? (
            <ElderlyStep
              addPatient={addPatient}
              patient={selectedPatient}
              patientIndex={selectedPatientIndex}
              patients={patients}
              removePatient={removePatient}
              selectedPatientIndex={selectedPatientIndex}
              setSelectedPatientIndex={setSelectedPatientIndex}
              updatePatient={updatePatient}
            />
          ) : null}

          {step === 3 ? (
            <MirrorStep patients={patients} updatePatient={updatePatient} />
          ) : null}

          {step === 4 ? (
            <NotificationStep notifications={notifications} setNotifications={setNotifications} />
          ) : null}
        </ScrollView>

        <View style={styles.navBar}>
          <TouchableOpacity
            disabled={!canGoBack || isSubmitting}
            onPress={() => setStep((current) => Math.max(1, current - 1))}
            style={[styles.backBtn, (!canGoBack || isSubmitting) && styles.disabledBtn]}
          >
            <Text style={styles.backBtnText}>{canGoBack ? 'Back' : 'Cancel'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={isSubmitting} style={styles.nextBtn} onPress={goNext}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextBtnText}>{step === 4 ? 'Finish setup' : 'Continue'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AccountStep({
  account,
  setAccount,
}: {
  account: AccountForm;
  setAccount: React.Dispatch<React.SetStateAction<AccountForm>>;
}) {
  return (
    <View>
      <Label>Name</Label>
      <TextInput
        onChangeText={(name) => setAccount((current) => ({ ...current, name }))}
        placeholder="e.g. Sarah Lim"
        style={styles.input}
        value={account.name}
      />

      <Label>Email</Label>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={(email) => setAccount((current) => ({ ...current, email }))}
        placeholder="you@email.com"
        style={styles.input}
        value={account.email}
      />

      <Label>Password</Label>
      <TextInput
        autoCapitalize="none"
        onChangeText={(password) => setAccount((current) => ({ ...current, password }))}
        placeholder="Create a password"
        secureTextEntry
        style={styles.input}
        value={account.password}
      />

      <Label>Phone number</Label>
      <TextInput
        keyboardType="phone-pad"
        onChangeText={(phoneNumber) => setAccount((current) => ({ ...current, phoneNumber }))}
        placeholder="+65 9123 4567"
        style={styles.input}
        value={account.phoneNumber}
      />

      <Label>I am caring for...</Label>
      <OptionGrid
        options={RELATIONSHIP_OPTIONS}
        selected={account.relationshipToElderly}
        onSelect={(relationshipToElderly) =>
          setAccount((current) => ({ ...current, relationshipToElderly }))
        }
      />
    </View>
  );
}

function ElderlyStep({
  addPatient,
  patient,
  patientIndex,
  patients,
  removePatient,
  selectedPatientIndex,
  setSelectedPatientIndex,
  updatePatient,
}: {
  addPatient: () => void;
  patient: PatientForm;
  patientIndex: number;
  patients: PatientForm[];
  removePatient: (index: number) => void;
  selectedPatientIndex: number;
  setSelectedPatientIndex: (index: number) => void;
  updatePatient: (index: number, updates: Partial<PatientForm>) => void;
}) {
  return (
    <View>
      <View style={styles.patientTabs}>
        {patients.map((item, index) => (
          <View
            key={index}
            style={[styles.patientTab, selectedPatientIndex === index && styles.patientTabActive]}
          >
            <TouchableOpacity
              onPress={() => setSelectedPatientIndex(index)}
              style={styles.patientTabLabel}
            >
              <Text style={[styles.patientTabText, selectedPatientIndex === index && styles.patientTabTextActive]}>
                {item.name.trim() || `Person ${index + 1}`}
              </Text>
            </TouchableOpacity>
            {patients.length > 1 ? (
              <TouchableOpacity
                accessibilityLabel={`Remove ${item.name.trim() || `Person ${index + 1}`}`}
                onPress={() => removePatient(index)}
                style={[styles.patientTabRemove, selectedPatientIndex === index && styles.patientTabRemoveActive]}
              >
                <Text style={[styles.patientTabRemoveText, selectedPatientIndex === index && styles.patientTabRemoveTextActive]}>
                  ×
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        <TouchableOpacity onPress={addPatient} style={styles.addTab}>
          <Text style={styles.addTabText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Label>Name they like to be called</Label>
      <TextInput
        onChangeText={(name) => updatePatient(patientIndex, { name })}
        placeholder="e.g. Grandpa Tan"
        style={styles.input}
        value={patient.name}
      />

      <View style={styles.twoCol}>
        <View style={styles.col}>
          <Label>Age</Label>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(age) => updatePatient(patientIndex, { age })}
            placeholder="82"
            style={styles.input}
            value={patient.age}
          />
        </View>
        <View style={styles.col}>
          <Label>Usual wake time</Label>
          <TextInput
            onChangeText={(usualWakeTime) => updatePatient(patientIndex, { usualWakeTime })}
            placeholder="07:30"
            style={styles.input}
            value={patient.usualWakeTime}
          />
        </View>
      </View>

      <Label>Gender</Label>
      <OptionGrid
        options={GENDER_OPTIONS}
        selected={patient.gender}
        onSelect={(gender) => updatePatient(patientIndex, { gender })}
      />

      <Label>Preferred language</Label>
      <OptionGrid
        options={LANGUAGE_OPTIONS}
        selected={patient.preferredLanguage}
        onSelect={(preferredLanguage) => updatePatient(patientIndex, { preferredLanguage })}
      />

      <Label>Speech or hearing conditions</Label>
      <TextInput
        multiline
        onChangeText={(speechOrHearingConditions) =>
          updatePatient(patientIndex, { speechOrHearingConditions })
        }
        placeholder="Optional"
        style={[styles.input, styles.textArea]}
        value={patient.speechOrHearingConditions}
      />

      <Label>Photo upload</Label>
      <PhotoInput
        photoUrl={patient.photoUrl}
        onChange={(photoUrl) => updatePatient(patientIndex, { photoUrl })}
      />

      <Label>Key topics they enjoy</Label>
      <MultiOptionGrid
        options={TOPIC_OPTIONS}
        selected={patient.keyTopics}
        onToggle={(topic) => {
          const isSelected = patient.keyTopics.includes(topic);
          const keyTopics = isSelected
            ? patient.keyTopics.filter((item) => item !== topic)
            : [...patient.keyTopics, topic];
          updatePatient(patientIndex, { keyTopics });
        }}
      />

      {patient.keyTopics.includes('others') ? (
        <>
          <Label>Other topics</Label>
          <TextInput
            onChangeText={(keyTopicsOtherText) => updatePatient(patientIndex, { keyTopicsOtherText })}
            placeholder="Gardening, mahjong, music..."
            style={styles.input}
            value={patient.keyTopicsOtherText}
          />
        </>
      ) : null}

      {patients.length > 1 ? (
        <TouchableOpacity onPress={() => removePatient(patientIndex)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>Remove this profile</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function MirrorStep({
  patients,
  updatePatient,
}: {
  patients: PatientForm[];
  updatePatient: (index: number, updates: Partial<PatientForm>) => void;
}) {
  return (
    <View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Temporary mirror linking</Text>
        <Text style={styles.infoText}>
          QR scanning and live device connection will be connected later. For now, each profile gets a generated mirror ID on save.
        </Text>
      </View>

      {patients.map((patient, index) => (
        <View key={index} style={styles.mirrorBlock}>
          <Text style={styles.mirrorHeading}>{patient.name.trim() || `Person ${index + 1}`}</Text>
          <Label>Mirror name</Label>
          <TextInput
            onChangeText={(mirrorName) => updatePatient(index, { mirrorName })}
            placeholder={`Mirror ${index + 1} - Toa Payoh home`}
            style={styles.input}
            value={patient.mirrorName}
          />
          <TouchableOpacity
            onPress={() => Alert.alert('Test greeting sent', `Aria will say good morning on ${patient.mirrorName || `Mirror ${index + 1}`}.`)}
            style={styles.testBtn}
          >
            <Text style={styles.testBtnText}>Send test greeting</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function NotificationStep({
  notifications,
  setNotifications,
}: {
  notifications: NotificationForm;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationForm>>;
}) {
  return (
    <View>
      <Label>Push notifications</Label>
      <OptionGrid
        options={[
          { value: true, label: 'Enable (recommended)' },
          { value: false, label: 'Disable' },
        ]}
        selected={notifications.pushNotificationsEnabled}
        onSelect={(pushNotificationsEnabled) =>
          setNotifications((current) => ({ ...current, pushNotificationsEnabled }))
        }
      />

      <Label>Alert sensitivity</Label>
      <OptionGrid
        options={ALERT_OPTIONS}
        selected={notifications.alertSensitivity}
        onSelect={(alertSensitivity) =>
          setNotifications((current) => ({ ...current, alertSensitivity }))
        }
      />

      <Label>Preferred daily summary time</Label>
      <OptionGrid
        options={SUMMARY_OPTIONS}
        selected={notifications.preferredDailySummaryTime}
        onSelect={(preferredDailySummaryTime) =>
          setNotifications((current) => ({ ...current, preferredDailySummaryTime }))
        }
      />
    </View>
  );
}

function PhotoInput({ photoUrl, onChange }: { photoUrl: string; onChange: (value: string) => void }) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.uploadBox}>
        {React.createElement('input', {
          accept: 'image/*',
          type: 'file',
          onChange: (event: { target?: { files?: FileList | null } }) => {
            const file = event.target?.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                onChange(reader.result);
              }
            };
            reader.readAsDataURL(file);
          },
        })}
        <Text style={styles.uploadText}>
          {photoUrl ? 'Photo selected' : 'Choose a photo for the dashboard card'}
        </Text>
      </View>
    );
  }

  return (
    <TextInput
      autoCapitalize="none"
      onChangeText={onChange}
      placeholder="Photo URL for now"
      style={styles.input}
      value={photoUrl}
    />
  );
}

function OptionGrid<T extends string | boolean>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={[styles.pill, isSelected && styles.pillActive]}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MultiOptionGrid<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onToggle(option.value)}
            style={[styles.pill, isSelected && styles.pillActive]}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function getStepSubtitle(step: number, patientCount: number) {
  if (step === 1) return 'Set up the caregiver account details.';
  if (step === 2) return `Add one or more elderly profiles. Current total: ${patientCount}.`;
  if (step === 3) return 'Name the mirror for each elderly profile. IDs are generated temporarily.';
  return 'Choose alert and daily summary preferences.';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  content: { padding: 20, paddingBottom: 24 },
  header: { marginBottom: 16 },
  eyebrow: {
    color: '#87566A',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: { color: '#2B2522', fontSize: 27, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#756C64', fontSize: 14, lineHeight: 20, marginTop: 6 },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  progressStep: {
    backgroundColor: '#E7DED2',
    borderRadius: 999,
    flex: 1,
    height: 6,
  },
  progressStepActive: { backgroundColor: '#87566A' },
  notice: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noticeSuccess: {
    backgroundColor: '#E6F9F0',
    borderColor: '#BFE8D2',
  },
  noticeError: {
    backgroundColor: '#F9E6EC',
    borderColor: '#E7C2CE',
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  noticeSuccessText: {
    color: '#1A7A4A',
  },
  noticeErrorText: {
    color: '#87566A',
  },
  label: {
    color: '#2B2522',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8CFC3',
    borderRadius: 8,
    borderWidth: 1,
    color: '#2B2522',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  col: { flex: 1 },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8CFC3',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: '#87566A',
    borderColor: '#87566A',
  },
  pillText: {
    color: '#756C64',
    fontSize: 13,
    fontWeight: '800',
  },
  pillTextActive: { color: '#FFFFFF' },
  patientTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  patientTab: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8CFC3',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  patientTabActive: {
    backgroundColor: '#2B2522',
    borderColor: '#2B2522',
  },
  patientTabText: {
    color: '#756C64',
    fontSize: 13,
    fontWeight: '800',
  },
  patientTabTextActive: { color: '#FFFFFF' },
  patientTabLabel: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  patientTabRemove: {
    alignItems: 'center',
    borderLeftColor: '#E7DED2',
    borderLeftWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    width: 34,
  },
  patientTabRemoveActive: {
    borderLeftColor: 'rgba(255,255,255,0.22)',
  },
  patientTabRemoveText: {
    color: '#87566A',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 20,
  },
  patientTabRemoveTextActive: {
    color: '#FFFFFF',
  },
  addTab: {
    backgroundColor: '#EFE7DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addTabText: {
    color: '#87566A',
    fontSize: 13,
    fontWeight: '800',
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8CFC3',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  uploadText: {
    color: '#756C64',
    fontSize: 13,
    fontWeight: '700',
  },
  removeBtn: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingVertical: 8,
  },
  removeBtnText: {
    color: '#87566A',
    fontSize: 13,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7DED2',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  infoTitle: {
    color: '#2B2522',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoText: {
    color: '#756C64',
    fontSize: 13,
    lineHeight: 19,
  },
  mirrorBlock: {
    borderBottomColor: '#E7DED2',
    borderBottomWidth: 1,
    paddingBottom: 18,
    paddingTop: 18,
  },
  mirrorHeading: {
    color: '#2B2522',
    fontSize: 16,
    fontWeight: '800',
  },
  testBtn: {
    alignItems: 'center',
    backgroundColor: '#2B2522',
    borderRadius: 8,
    marginTop: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  navBar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E7DED2',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  backBtn: {
    alignItems: 'center',
    borderColor: '#D8CFC3',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.45,
  },
  backBtnText: {
    color: '#756C64',
    fontSize: 15,
    fontWeight: '800',
  },
  nextBtn: {
    alignItems: 'center',
    backgroundColor: '#87566A',
    borderRadius: 8,
    flex: 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
