import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de tener el http:// y tu IP correcta
const API_URL = 'http://192.168.100.19:3000'; 
export const loginStudent = async (studentName, password) => {
    try {
        const response = await fetch(`${API_URL}/verify_student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_name: studentName,
                student_password: password
            }),
        });
        return await response.json(); 
    } catch (error) {
        console.error("Error login:", error);
        throw error;
    }
};

export const markAttendance = async (studentId, subjectName) => {
    try {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                student_id: studentId,
                subject: subjectName // Enviamos el nombre (ej: "Matemáticas")
            }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error asistencia:", error);
        throw error;
    }
};

export const registerStudent = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register_student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error registro:", error);
        throw error;
    }
};

export const saveOfflineAttendance = async (studentId, subjectName) => {
    try {
        // Obtenemos lo que ya haya guardado
        const existingData = await AsyncStorage.getItem('offline_attendance');
        let attendanceList = existingData ? JSON.parse(existingData) : [];

        // Agregamos la nueva asistencia con la fecha actual
        attendanceList.push({
            student_id: studentId,
            subject: subjectName,
            date: new Date().toISOString() // Guardamos cuándo ocurrió
        });

        // Guardamos de nuevo en el celular
        await AsyncStorage.setItem('offline_attendance', JSON.stringify(attendanceList));
        return true;
    } catch (error) {
        console.error("Error guardando offline:", error);
        return false;
    }
};

// 2. FUNCIÓN PARA SINCRONIZAR (SUBIR LO PENDIENTE)
export const syncPendingAttendance = async () => {
    try {
        const existingData = await AsyncStorage.getItem('offline_attendance');
        if (!existingData) return { success: true, count: 0 };

        const attendanceList = JSON.parse(existingData);
        if (attendanceList.length === 0) return { success: true, count: 0 };

        console.log("Intentando sincronizar:", attendanceList.length, "registros.");

        // Intentamos enviar cada uno al servidor
        // Usamos un bucle for...of para procesar asíncronamente
        const failedUploads = [];
        let successCount = 0;

        for (const item of attendanceList) {
            try {
                // Reutilizamos la función markAttendance que ya tienes
                // IMPORTANTE: Asegúrate de que markAttendance esté exportada en este mismo archivo
                const result = await markAttendance(item.student_id, item.subject);
                if (result.success || result.message.includes("Ya marcaste")) {
                    successCount++;
                } else {
                    failedUploads.push(item); // Si el servidor rechaza, lo guardamos para después
                }
            } catch (error) {
                // Si falla la conexión de nuevo, lo guardamos
                failedUploads.push(item);
            }
        }

        // Sobrescribimos el almacenamiento solo con los que fallaron (si hubo)
        if (failedUploads.length > 0) {
            await AsyncStorage.setItem('offline_attendance', JSON.stringify(failedUploads));
        } else {
            await AsyncStorage.removeItem('offline_attendance'); // Limpiamos si todo salió bien
        }

        return { success: true, count: successCount, pending: failedUploads.length };

    } catch (error) {
        console.error("Error en sincronización:", error);
        return { success: false, error };
    }
};