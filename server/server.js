const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Para que el server pueda recibir peticiones de mi App
app.use(cors({
    origin:'http://localhost:8081',
    methods: ['GET', 'POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 



mysqldb = require('./app').connection;

app.get("/data", (req, res) => {
    mysqldb.query("SELECT * FROM students", (error, results) => {
        if(error) throw error;
        res.json(results);
    })
    
});


// verificar estudiantes
app.post("/verify_student", function(req, res) {

    var sql = 'SELECT * FROM `students` WHERE `student_name` = ? AND `student_password`= ?';

    const {student_name, student_password} = req.body;

    // Checar si hay valores vacios
    if(!student_name){
        return res.status(400).json({error: "Missing fields, check request body"});
    }

    mysqldb.query(sql,[student_name, student_password], (err, results) => {
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

// verificar profesores
app.post("/verify_teacher", function(req, res) {

    var sql = 'SELECT * FROM `teachers` WHERE `teacher_name` = ? AND `teacher_password`= ?';

    const {teacher_name, teacher_password} = req.body;

    // Checar si hay v  alores vacios
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

// Metodo para insertar estudiantes desde el login
app.post("/insert", function(req,res) {


    var sql = `INSERT INTO students
    (teacher_password, student_group, student_career, teacher_name, student_email) VALUES
    (?, ?, ?, ?, ?)`;

    const {teacher_password, student_group, student_career, teacher_name, student_email } = req.body;

    if(!teacher_password){
        return res.status(400).json({error: "Missing fields, check request body" });
    }

    mysqldb.query(sql, [teacher_password, student_group, student_career, teacher_name, student_email], (err, data) =>{
        if(err){
            console.error("Error in the database:",err);
            return res.status(500).json({ error: "Database insert failed", details: err.sqlMessage });
        }
        else{
            console.log("Successfully inserted into the database");
            return res.status(201).json({ message: "Inserted successfully into the database", insertedId: data.insertId });
        }
});

});




app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);

});