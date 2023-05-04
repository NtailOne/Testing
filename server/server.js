const express = require("express");
const config = require("config");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = config.get("serverPort");

try {
    // database connection
    const pool = mysql.createPool({
        connectionLimit: config.get("connectionLimit"),
        host: config.get("host"),
        user: config.get("user"),
        database: config.get("database"),
        password: config.get("password")
    }).promise();

    // server port listening
    app.listen(PORT, () => {
        console.log('Server has started on port: ', PORT);
    });

    // client requests

    app.get('/home', async (req, res) => {
        res.send({ express: 'Server has received the home get request' });
    });

    app.post('/login', async (req, res) => {
        const sql = "SELECT * FROM users WHERE `email` = ? AND `password` = ?";
        const values = [
            req.body.email,
            req.body.password,
        ];
        await pool.query(sql, [req.body.email, req.body.password], (err, results) => {
            if (err) return res.json("Error");
            if (results.length > 0) return res.json("Success");
            else return res.json("Failed");
        });
    });

    // admin requests

    app.post('/admin', (req, res) => {
        const sql = "INSERT INTO users (`role_id`, `email`, `password`, `surname`, `name`, `patronymic`, `course`, `group`) VALUES ?";
        const values = [
            req.body.role_id,
            req.body.email,
            req.body.password,
            req.body.surname,
            req.body.name,
            req.body.patronymic,
            req.body.course,
            req.body.group
        ];
        pool.query(sql, [values], (err, results) => {
            if (err) return res.json("Error");
            return res.json(results);
        });
    });
} catch (e) { }

