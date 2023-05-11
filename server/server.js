const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = config.get('serverPort');

(async () => {

    try {
        // Соединение с базой данных
        const pool = await mysql.createPool({
            connectionLimit: config.get('connectionLimit'),
            host: config.get('host'),
            user: config.get('user'),
            database: config.get('database'),
            password: config.get('password')
        });

        // Запросы от пользователей
        app.get('/home', (req, res) => {
            res.send({ express: 'Server has received the home get request' });
        });

        app.post('/login', async (req, res) => {
            const sql = 'SELECT * FROM users WHERE `email` = ? AND `password` = ?';
            const values = [
                req.body.email,
                req.body.password,
            ];
            try {
                const [rows] = await pool.execute(sql, values);
                if (rows.length > 0) {
                    res.status(200).send('Success');
                } else {
                    res.status(401).send('Failed');
                }
            } catch (err) {
                console.error(err);
                res.json('Error');
            }
        });

        // Запросы от администратора
        app.post('/admin-login', (req, res) => {
            const { login, password } = req.body;
            if (login == config.get('adminLogin') && password == config.get('adminPassword')) {
                res.status(200).send('Success');
            } else {
                res.status(401).send('Invalid login or password');
            }
        });

        app.get('/users', async (req, res) => {
            const sql = `SELECT u.id, r.role_name, c.course_num, g.group_name, u.email, u.surname, u.name, u.patronymic
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN courses c ON u.course = c.id
                JOIN courses_groups g ON u.group = g.id; `;
            try {
                const [rows] = await pool.execute(sql);
                res.send(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Обработка неопределенных URL-адресов
        app.use((req, res) => {
            res.status(404).send('Not found');
        });

        // Слушатель порта
        app.listen(PORT, () => {
            console.log('Сервер запущен на порту: ', PORT);
        });
    } catch (e) {
        console.error(e);
        process.exit(1); // Остановка приложения в случае ошибки подключения к базе данных
    }

})();