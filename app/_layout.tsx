import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: 'Profile', headerBackTitle: 'Back' }} />
          <Stack.Screen name="trend/[id]" options={{ headerShown: true, title: 'Trend History', headerBackTitle: 'Back' }} />
          <Stack.Screen name="session/[id]" options={{ headerShown: true, title: 'Session Replay', headerBackTitle: 'Back' }} />
          <Stack.Screen name="faq" options={{ headerShown: true, title: 'FAQ & Guide', headerBackTitle: 'Back' }} />
          <Stack.Screen name="chatbot" options={{ headerShown: true, title: 'Support', headerBackTitle: 'Back' }} />
        </Stack>
      </View>
    </>
  );
}
