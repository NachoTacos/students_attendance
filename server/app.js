const mysql = require("mysql")

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'students_attendance'
});

connection.connect(function(err){
  if(err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('Connection successfully to the database');
});


module.exports = { connection };
