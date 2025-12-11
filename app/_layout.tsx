import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="login_teacher" />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}