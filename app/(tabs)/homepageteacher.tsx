import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Student {
  id: number;
  student_name: string;
  student_group: string;
}

interface Subject {
  id: number;
  name: string;
}

interface HistorialItem {
  date: string;
  status: 'Presente' | 'Ausente';
}

export default function HomePageTeacher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const API_URL = 'http://192.168.100.19:3000'; 


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const resStudents = await fetch(`${API_URL}/all_students`);
      const dataStudents = await resStudents.json();
      setAllStudents(dataStudents);
      const resSubjects = await fetch(`${API_URL}/subjects`);
      const dataSubjects = await resSubjects.json();
      setSubjects(dataSubjects);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los datos. Revisa la conexión.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueGroups = [...new Set(allStudents.map(s => s.student_group))].sort(); // Grupos únicos ordenados
  
  const filteredStudents = selectedGroup 
    ? allStudents.filter(s => s.student_group === selectedGroup)
    : [];

  const handleVerHistorial = async () => {
    if (!selectedStudent || !selectedSubject) {
        Alert.alert("Faltan datos", "Por favor selecciona un estudiante y una materia.");
        return;
    }

    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/student_history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: selectedStudent.id,
                subject: selectedSubject.name
            })
        });
        const data = await response.json();
        setHistorial(data);
        setShowReportModal(true); 
    } catch (error) {
        Alert.alert("Error", "No se pudo generar el reporte.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
      await AsyncStorage.clear();
      router.replace('/login_teacher');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Profesor</Text>

      <Text style={styles.label}>1. Selecciona Grupo:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
        {uniqueGroups.map(group => (
            <TouchableOpacity 
                key={group} 
                style={[styles.chip, selectedGroup === group && styles.chipSelected]}
                onPress={() => { setSelectedGroup(group); setSelectedStudent(null); }}
            >
                <Text style={[styles.chipText, selectedGroup === group && styles.chipTextSelected]}>
                    Grupo {group}
                </Text>
            </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedGroup && (
        <>
            <Text style={styles.label}>2. Selecciona Estudiante:</Text>
            <View style={styles.listContainer}>
                {filteredStudents.length === 0 ? (
                    <Text style={{padding: 20, color: '#999'}}>No hay estudiantes en este grupo.</Text>
                ) : (
                    <FlatList
                        data={filteredStudents}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[styles.studentItem, selectedStudent?.id === item.id && styles.studentItemSelected]}
                                onPress={() => setSelectedStudent(item)}
                            >
                                <Text style={[styles.studentText, selectedStudent?.id === item.id && styles.studentTextSelected]}>
                                    {item.student_name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </>
      )}

      {selectedStudent && (
          <>
            <Text style={styles.label}>3. Selecciona Materia:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
                {subjects.map(subj => (
                    <TouchableOpacity 
                        key={subj.id} 
                        style={[styles.chip, selectedSubject?.id === subj.id && styles.chipSelected]}
                        onPress={() => setSelectedSubject(subj)}
                    >
                        <Text style={[styles.chipText, selectedSubject?.id === subj.id && styles.chipTextSelected]}>
                            {subj.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity 
                style={[styles.btnVer, !selectedSubject && {backgroundColor: '#ccc'}]} 
                onPress={handleVerHistorial}
                disabled={!selectedSubject || loading}
            >
                {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnVerText}>VER ASISTENCIA Y FALTAS</Text>}
            </TouchableOpacity>
          </>
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{color: 'red'}}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Modal visible={showReportModal} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reporte Detallado</Text>
            <Text style={styles.modalSubtitle}>
                {selectedStudent?.student_name}
            </Text>
            <Text style={{textAlign: 'center', marginBottom: 15, color: '#555'}}>Materia: {selectedSubject?.name}</Text>

            {historial.length > 0 ? (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryNumber}>{historial.length}</Text>
                        <Text style={styles.summaryLabel}>Clases</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, {color: 'green'}]}>
                            {historial.filter(h => h.status === 'Presente').length}
                        </Text>
                        <Text style={styles.summaryLabel}>Asistencias</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, {color: 'red'}]}>
                            {historial.filter(h => h.status === 'Ausente').length}
                        </Text>
                        <Text style={styles.summaryLabel}>Faltas</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, {color: '#007AFF'}]}>
                            {Math.round((historial.filter(h => h.status === 'Presente').length / historial.length) * 100)}%
                        </Text>
                        <Text style={styles.summaryLabel}>Puntaje</Text>
                    </View>
                </View>
            ) : null}

            <FlatList
                data={historial}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.reportRow, item.status === 'Ausente' ? styles.rowAbsent : styles.rowPresent]}>
                        <Text style={styles.reportDate}>📅 {item.date}</Text>
                        <Text style={[styles.reportStatus, {color: item.status === 'Ausente' ? 'red' : 'green'}]}>
                            {item.status === 'Presente' ? 'Presente' : 'Falta'}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No hay registros de clases para esta materia aún.
                    </Text>
                }
            />

            <TouchableOpacity style={styles.btnClose} onPress={() => setShowReportModal(false)}>
                <Text style={styles.btnCloseText}>Cerrar Reporte</Text>
            </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#333' },
  
  scrollChips: { maxHeight: 50, marginBottom: 5 },
  chip: { backgroundColor: '#e0e0e0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 35, justifyContent: 'center' },
  chipSelected: { backgroundColor: '#007AFF' },
  chipText: { color: '#333', fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },
  listContainer: { height: 180, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  studentItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  studentItemSelected: { backgroundColor: '#e6f2ff' },
  studentText: { fontSize: 16 },
  studentTextSelected: { color: '#007AFF', fontWeight: 'bold' },
  btnVer: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, marginTop: 25, alignItems: 'center', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, elevation: 3 },
  btnVerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginTop: 30, alignSelf: 'center', padding: 10 },

  modalContainer: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  modalTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  modalSubtitle: { fontSize: 20, textAlign: 'center', color: '#007AFF', marginBottom: 5, fontWeight: '600' },
  
  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  summaryItem: { alignItems: 'center' },
  summaryNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },

  reportRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 8, marginBottom: 5 },
  rowPresent: { backgroundColor: '#f0fff4' },
  rowAbsent: { backgroundColor: '#fff5f5' },
  reportDate: { fontSize: 16, fontWeight: '500', color: '#444' },
  reportStatus: { fontSize: 16, fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16, fontStyle: 'italic' },

  btnClose: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  btnCloseText: { color: '#fff', fontWeight: 'bold' }
});