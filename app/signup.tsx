import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerStudent } from '../services/api';

export default function SignUpScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [career, setCareer] = useState('');

  const handleRegister = async () => {
    if (!name || !password || !group) {
      Alert.alert('Atención', 'Nombre, Contraseña y Grupo son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const result = await registerStudent({
        student_name: name,
        student_password: password,
        student_email: email,
        student_group: group,
        student_career: career
      });

      if (result.success) {
        Alert.alert('¡Registro Exitoso!', 'Ahora puedes iniciar sesión.');
        router.replace('/signin');
      } else {
        Alert.alert('Error', result.message || 'No se pudo registrar.');
      }
    } catch (error) {
      Alert.alert('Error', 'Fallo de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Nuevo Estudiante</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <View style={styles.row}>
            <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Grupo (Ej: A)"
            value={group}
            onChangeText={setGroup}
            placeholderTextColor="#999"
            />
            <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Carrera"
            value={career}
            onChangeText={setCareer}
            placeholderTextColor="#999"
            />
        </View>
        
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.navigate('/signin')} 
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },

  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  linkContainer: { marginTop: 25, alignItems: 'center', marginBottom: 20 },
  linkText: { color: '#007AFF', fontSize: 16, fontWeight: '600' }
});