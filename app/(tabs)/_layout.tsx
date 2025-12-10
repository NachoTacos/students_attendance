import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } catch (error) {
      console.error("Error leyendo rol", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="homepagestudent" 
        options={{ 
          title: 'Estudiante',
          href: userRole === 'teacher' ? null : '/homepagestudent', // Ocultar si es profe
          tabBarIcon: ({ color }) => <Ionicons name="school" size={24} color={color} />,
        }} 
      />

      <Tabs.Screen 
        name="homepageteacher" 
        options={{ 
          title: 'Profesor',
          href: userRole === 'teacher' ? '/homepageteacher' : null, // Ocultar si NO es profe
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}