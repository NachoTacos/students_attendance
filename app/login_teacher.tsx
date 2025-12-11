import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginTeacher() {
  const router = useRouter();

  // Estados
  const [teacherName, setTeacherName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://192.168.100.19:3000'; 

  const handleLogin = async () => {
    if (!teacherName || !password) {
      Alert.alert('Atención', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify_teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_name: teacherName,
          teacher_password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('userRole', 'teacher');
        await AsyncStorage.setItem('teacherName', teacherName); 
        
        router.replace('/(tabs)/homepageteacher');
      } else {
        Alert.alert('Error', 'Profesor no encontrado o contraseña incorrecta');
      }

    } catch (error) {
      console.error("Error login profesor:", error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Profesores</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario Profesor"
        value={teacherName}
        onChangeText={setTeacherName}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => router.navigate('/signin')} 
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Eres Estudiante? Ingresa aquí</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkContainer: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 16, fontWeight: '600' }
});