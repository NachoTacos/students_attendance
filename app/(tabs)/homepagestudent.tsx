import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { markAttendance, saveOfflineAttendance, syncPendingAttendance } from '../../services/api';

interface Subject {
  id: number;
  name: string;
  start_time: string; // "14:00:00"
  end_time: string;   // "16:00:00"
}

export default function HomePageStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState('');
  
  const [materias, setMaterias] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const API_URL = 'http://192.168.100.19:3000'; 

  useEffect(() => {
    AsyncStorage.getItem('studentName').then(val => { if(val) setStudentName(val); });
    fetchMaterias();
    const trySync = async () => {
      const result = await syncPendingAttendance();
      if (result.success && (result.count || 0) > 0) {
        Alert.alert("Sincronización", `☁️ Se subieron automáticamente ${result.count} asistencias que guardaste sin internet.`);
      }
    };
    trySync();

  }, []);

  const fetchMaterias = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMaterias(data);
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    }
  };

  const validarHorario = (materia: Subject) => {
    const ahora = new Date();


    const [hInicio, mInicio] = materia.start_time.split(':');
    const fechaInicio = new Date();
    fechaInicio.setHours(parseInt(hInicio), parseInt(mInicio), 0);


    const [hFin, mFin] = materia.end_time.split(':');
    const fechaFin = new Date();
    fechaFin.setHours(parseInt(hFin), parseInt(mFin), 0);

    const inicioPermitido = new Date(fechaInicio.getTime() - 15 * 60000);
    const finPermitido = new Date(fechaFin.getTime() + 10 * 60000);

    if (ahora < inicioPermitido) {
      Alert.alert("Muy temprano", `La asistencia para ${materia.name} inicia a las ${hInicio}:${mInicio}`);
      return false;
    }
    if (ahora > finPermitido) {
      Alert.alert("Tarde", `La clase de ${materia.name} ya terminó a las ${hFin}:${mFin}`);
      return false;
    }
    return true;
  };

const handleAttendance = async () => {
    if (!selectedSubject) {
        Alert.alert("Atención", "Por favor selecciona una materia primero.");
        return;
    }

    const esHorarioValido = validarHorario(selectedSubject);
    if (!esHorarioValido) return;

    setLoading(true);
    try {
      const studentId = await AsyncStorage.getItem('studentId');
      if (!studentId) return;

      const result = await markAttendance(studentId, selectedSubject.name);
      
      if (result.success) {
        Alert.alert("¡Éxito!", result.message);
      } else {
        Alert.alert("Aviso", result.message);
      }

    } catch (error) {
      console.log("Fallo de red, guardando offline...");
      
      const studentId = await AsyncStorage.getItem('studentId');
      if (studentId) {
        await saveOfflineAttendance(studentId, selectedSubject.name);
        Alert.alert(
          "Modo Sin Conexión", 
          "No tienes internet, pero tu asistencia se guardó en el celular. \n\nSe enviará automáticamente cuando recuperes la conexión y abras la app."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
      await AsyncStorage.clear();
      router.replace('/signin');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {studentName}</Text>
      
      <View style={styles.card}>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        <Text style={styles.subtitle}>Selecciona tu clase:</Text>

        <ScrollView contentContainerStyle={styles.subjectContainer} style={{maxHeight: 300}}>
            {materias.length === 0 ? (
                <Text style={{color: '#999', fontStyle: 'italic', margin: 20}}>
                  Cargando materias o sin conexión...
                </Text>
            ) : (
                materias.map((materia) => (
                    <TouchableOpacity 
                        key={materia.id}
                        style={[
                            styles.subjectButton, 
                            selectedSubject?.id === materia.id && styles.subjectButtonSelected
                        ]}
                        onPress={() => setSelectedSubject(materia)}
                    >
                        <Text style={[
                            styles.subjectText,
                            selectedSubject?.id === materia.id && styles.subjectTextSelected
                        ]}>
                            {materia.name}
                        </Text>
                        <Text style={[
                            styles.timeText,
                            selectedSubject?.id === materia.id && styles.subjectTextSelected
                        ]}>
                            {formatTime(materia.start_time)} - {formatTime(materia.end_time)}
                        </Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>

        <TouchableOpacity 
            style={[styles.mainButton, !selectedSubject && {backgroundColor: '#ccc'}]} 
            onPress={handleAttendance}
            disabled={loading || !selectedSubject}
        >
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>MARCAR ASISTENCIA</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout} style={{marginTop: 20}}>
          <Text style={{color: 'red'}}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, width: '90%', alignItems: 'center', elevation: 5 },
  date: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#555' },
  subtitle: { fontSize: 16, marginBottom: 10 },
  
  subjectContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: 15 },
  
  subjectButton: { 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#007AFF', 
    margin: 5, 
    minWidth: '40%', 
    alignItems: 'center'
  },
  subjectButtonSelected: { backgroundColor: '#007AFF' },
  
  subjectText: { color: '#007AFF', fontWeight: 'bold', textAlign: 'center' },
  timeText: { color: '#007AFF', fontSize: 11, marginTop: 2 }, 
  
  subjectTextSelected: { color: 'white' },

  mainButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});