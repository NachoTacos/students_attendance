import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Pantallas de Login (Full Screen) */}
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="login_teacher" />

      {/* La App Principal (El sistema de pestañas) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Pantalla de error */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}