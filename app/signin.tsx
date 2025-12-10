import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginStudent } from '../services/api'; // Ajusta la ruta si es necesario (ej: './services/api' o '../services/api')

export default function SignInScreen() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentName || !password) {
      Alert.alert('Atención', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      const result = await loginStudent(studentName, password);

      if (result.success) {
        if (result.student_id) {
            await AsyncStorage.setItem('studentId', result.student_id.toString());
            await AsyncStorage.setItem('studentName', result.student_name || studentName);
            await AsyncStorage.setItem('userRole', 'student'); // Guardamos el rol
        }
        Alert.alert('¡Éxito!', 'Bienvenido al sistema');
        // Redirigimos a la carpeta de tabs (Home del Estudiante)
        router.replace('/(tabs)/homepagestudent'); 
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estudiantes</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={studentName}
        onChangeText={setStudentName}
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
        onPress={() => router.navigate('/signup')} 
        style={{ marginTop: 20, alignItems: 'center' }}
      >
        <Text style={{ color: '#555', fontSize: 14 }}>
          ¿No tienes cuenta? <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Regístrate aquí</Text>
        </Text>
      </TouchableOpacity>

      {/* --- BOTÓN NUEVO PARA IR AL LOGIN DE PROFESOR --- */}
      <TouchableOpacity 
        onPress={() => router.navigate('/login_teacher')} 
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>¿Eres Profesor? Ingresa aquí</Text>
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
  
  // Estilos del link
  linkContainer: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 16, fontWeight: '600' }
});