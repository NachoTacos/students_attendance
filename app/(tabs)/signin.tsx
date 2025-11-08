import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput } from 'react-native';

export default function SignIn() {
  const router = useRouter();

  const [student_password, setPassword] = useState('');
  const [student_group, setGroup] = useState('');
  const [student_career, setCareer] = useState('');
  const [student_name, setName] = useState('');
  const [student_email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function insertStudent(
    student_password: string,
    student_group: string,
    student_career: string,
    student_name: string, 
    student_email: string
  ) {
    // Validación básica
    if (!student_name || !student_email || !student_password || !student_group || !student_career) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("Enviando datos al servidor...");
      
      const response = await fetch("http://localhost:3000/insert", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_password: student_password,
          student_group: student_group,
          student_career: student_career,
          student_name: student_name,
          student_email: student_email
        }),
      });

      console.log("Respuesta del servidor:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Estudiante registrado:", data);
      
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      
      // Limpiar formulario después del registro exitoso
      setPassword('');
      setGroup('');
      setCareer('');
      setName('');
      setEmail('');
      
    } catch (error: any) {
      console.error("Error al insertar estudiante: ", error);
      setError(error.message);
      Alert.alert('Error', `No se pudo registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Sign in</ThemedText>
      
      <TextInput 
        placeholder='Insert your username' 
        value={student_name}
        onChangeText={setName} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
      />

      <TextInput 
        placeholder='Insert your email'  
        value={student_email}
        onChangeText={setEmail} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        secureTextEntry
        placeholder='Password'
        value={student_password}
        onChangeText={setPassword}
        style={styles.textInputStyle}
        placeholderTextColor="#999"
      />

      <TextInput 
        placeholder='Insert your group' 
        value={student_group}
        onChangeText={setGroup} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
      />

      <TextInput 
        placeholder='Insert your career' 
        value={student_career}
        onChangeText={setCareer} 
        style={styles.textInputStyle}
        placeholderTextColor="#999"
      />

      <ThemedText 
        onPress={() => router.navigate('/(tabs)')} 
        style={styles.linkText}
      >
        Already have an account?
      </ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button 
          title="Register"  
          onPress={() => {
            console.log("El botón fue presionado");
            insertStudent(
              student_password,
              student_group,
              student_career,
              student_name,
              student_email
            );
          }}
        />
      )}
      
      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    padding: 20, 
    fontSize: 25,
    textAlign: 'center'
  },
  textInputStyle: {
    color: 'white',
    height: 50,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
  },
  linkText: {
    color: "blue",
    textAlign: 'center',
    marginVertical: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});