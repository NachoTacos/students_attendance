import { Stack } from 'expo-router';

export default function StackLayout() {
  return(
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options = {{ headerShown: false }} />
      <Stack.Screen name="login_teacher" options = {{ headerShown: false }} />
    </Stack>
  );
}