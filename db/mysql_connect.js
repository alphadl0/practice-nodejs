// db/mysql_connect.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Bağlantı havuzu (Pool) oluşturuluyor
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Async/Await kullanabilmek için promise yapısını dışa aktarıyoruz
module.exports = pool.promise();