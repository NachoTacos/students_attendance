import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/signin" />; // Ya no es /(tabs)/signin, ahora es directo /signin
}