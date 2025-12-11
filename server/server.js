const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 



mysqldb = require('./app').connection;



app.get("/data", (req, res) => {
    mysqldb.query("SELECT * FROM students", (error, results) => {
        if(error) throw error;
        res.json(results);
    })
    
});


app.post("/verify_student", function(req, res) {
    const sql = 'SELECT * FROM `students` WHERE `student_name` = ? AND `student_password`= ?';
    const {student_name, student_password} = req.body;

    if(!student_name) return res.status(400).json({error: "Faltan campos"});

    mysqldb.query(sql, [student_name, student_password], (err, results) => {
        if(err) return res.status(500).json({ error: "Error BD", details: err.sqlMessage });
        
        if (results.length > 0){
            const student = results[0]; 
            return res.json({
                success: true, 
                student_id: student.id,      
                student_name: student.student_name 
            });
        } else {
            return res.json({success: false});
        }
    });
});
app.post("/verify_teacher", function(req, res) {

    var sql = 'SELECT * FROM `teachers` WHERE `teacher_name` = ? AND `teacher_password`= ?';

    const {teacher_name, teacher_password} = req.body;

    if(!teacher_name){
        return res.status(400).json({error: "Missing fields, check request body"});
    }

    mysqldb.query(sql,[teacher_name, teacher_password], (err, results) => {
        if(err){
            console.error("Error in the database:",err);
            return res.status(500).json({ error: "La verificacion fallo", details: err.sqlMessage });
        }
        if (results.length != []){
            return res.json({success: true});
        }
        else{
            return res.json({success: false});
        }
    });
});

app.post("/register_student", function(req, res) {
    const { student_name, student_password, student_email, student_group, student_career } = req.body;

    if(!student_name || !student_password || !student_group) {
        return res.status(400).json({ success: false, message: "Faltan datos obligatorios (Nombre, Contraseña o Grupo)" });
    }

    const sql = `INSERT INTO students 
    (student_name, student_password, student_email, student_group, student_career) 
    VALUES (?, ?, ?, ?, ?)`;

    mysqldb.query(sql, [student_name, student_password, student_email, student_group, student_career], (err, result) => {
        if(err) {
            console.error("Error al registrar:", err);
            return res.status(500).json({ success: false, error: err.sqlMessage });
        }
        res.json({ success: true, message: "Estudiante registrado con éxito" });
    });
});

app.post("/attendance", function(req, res) {
    const { student_id, subject } = req.body;

    if (!student_id || !subject) {
        return res.status(400).json({ error: "Falta ID estudiante o Materia" });
    }

    const sql = "INSERT INTO attendance (student_id, subject, date, status, is_synced, sync_timestamp) VALUES (?, ?, CURDATE(), 'Presente', 1, NOW())";

    mysqldb.query(sql, [student_id, subject], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                return res.json({ 
                    success: false, 
                    message: `⚠️ Ya marcaste asistencia en ${subject} el día de hoy.` 
                });
            }
            console.error(err);
            return res.status(500).json({ error: "Error interno", details: err.sqlMessage });
        }
        res.json({ success: true, message: `✅ Asistencia registrada en ${subject}` });
    });
});

app.get("/subjects", (req, res) => {
    mysqldb.query("SELECT * FROM subjects", (error, results) => {
        if(error) return res.status(500).json({ error: "Error BD" });
        res.json(results);
    });
});

app.get("/reports", (req, res) => {
    const sql = `
        SELECT 
            attendance.id,
            attendance.subject,
            attendance.date,
            attendance.sync_timestamp,
            students.student_name,
            students.student_group
        FROM attendance
        JOIN students ON attendance.student_id = students.id
        ORDER BY attendance.sync_timestamp DESC
    `;

    mysqldb.query(sql, (err, results) => {
        if (err) {
            console.error("Error obteniendo reportes:", err);
            return res.status(500).json({ error: "Error de base de datos" });
        }
        res.json(results);
    });
});

app.get("/all_students", (req, res) => {
    mysqldb.query("SELECT id, student_name, student_group FROM students ORDER BY student_group, student_name", (err, results) => {
        if (err) return res.status(500).json({ error: "Error BD" });
        res.json(results);
    });
});

app.post("/student_history", (req, res) => {
    const { student_id, subject } = req.body;


    const sqlDates = "SELECT DISTINCT date FROM attendance WHERE subject = ? ORDER BY date DESC";
    

    const sqlAttendance = "SELECT date FROM attendance WHERE student_id = ? AND subject = ?";

    mysqldb.query(sqlDates, [subject], (err, allClassDates) => {
        if (err) return res.status(500).json({ error: "Error fechas" });

        mysqldb.query(sqlAttendance, [student_id, subject], (err2, studentDates) => {
            if (err2) return res.status(500).json({ error: "Error alumno" });

            const historial = allClassDates.map((registroClase) => {
                const fechaClase = JSON.stringify(registroClase.date).substring(1,11); 
                
                const asistio = studentDates.some(registroAlumno => {
                    const fechaAlumno = JSON.stringify(registroAlumno.date).substring(1,11);
                    return fechaAlumno === fechaClase;
                });

                return {
                    date: fechaClase,
                    status: asistio ? 'Presente' : 'Ausente' 
                };
            });

            res.json(historial);
        });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`server is running at port ${port}`);

});