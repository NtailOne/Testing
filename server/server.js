const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = config.get('serverPort');

async function executeSelectSqlQuery(pool, sql, res) {
    try {
        const [rows] = await pool.execute(sql);
        res.send(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

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
            const sql = 'SELECT * FROM users WHERE `email` = ? AND `password` = ?;';
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

        // Запросы на получение записей БД
        app.get('/users', async (req, res) => {
            const sql = 'SELECT * FROM users';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/roles', async (req, res) => {
            const sql = 'SELECT * FROM roles';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/courses', async (req, res) => {
            const sql = `SELECT * FROM courses`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/groups', async (req, res) => {
            const sql = 'SELECT * FROM courses_groups';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/topics', async (req, res) => {
            const sql = `SELECT * FROM topics;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/questions', async (req, res) => {
            const sql = 'SELECT * FROM questions';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/tests', async (req, res) => {
            const sql = 'SELECT * FROM tests';
            await executeSelectSqlQuery(pool, sql, res);
        });

        // Запросы для отображения записей в таблицах
        app.get('/users-table', async (req, res) => {
            const sql = `SELECT u.id, u.surname, u.name, u.patronymic, u.email, r.role_name, c.course_num, g.group_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN courses c ON u.course_id = c.id
                LEFT JOIN courses_groups g ON u.group_id = g.id;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/groups-table', async (req, res) => {
            const sql = `SELECT courses_groups.id, courses_groups.group_name, courses.course_num
                FROM courses_groups
                JOIN courses ON courses_groups.course_id = courses.id;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/questions-table', async (req, res) => {
            const sql = `SELECT questions.id, topics.topic_name, questions.body
                FROM questions
                JOIN topics ON questions.topic_id = topics.id;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/tests-table', async (req, res) => {
            const sql = `SELECT tests.id, tests.test_name, tests.start_time, tests.end_time, courses.course_num, courses_groups.group_name, CONCAT(users.surname, ' ', users.name, ' ', users.patronymic) AS student_name
                FROM tests
                JOIN courses ON tests.course_id = courses.id
                LEFT JOIN courses_groups ON tests.group_id = courses_groups.id
                LEFT JOIN users ON tests.student_id = users.id;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        // Запросы на добавление записей в БД
        app.post('/users', async (req, res) => {
            const { role_id, email, password, surname, name, patronymic, course_id, group_id } = req.body;
            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const sql = `INSERT INTO users (role_id, email, password, surname, name, patronymic, course_id, group_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

                const params = [role_id, email, hashedPassword, surname, name, patronymic, course_id || null, group_id || null];
                const result = await pool.execute(sql, params);
                const insertedUser = { id: result[0].insertId, ...req.body };
                console.log(`Added user with id ${result[0].insertId}`);
                const message = 'User has successfully added';
                res.status(200).send({ message, user: insertedUser });
            } catch (error) {
                console.error(error);
                res.status(500).send('Add user error');
            }
        });

        // Запросы на изменений записей в БД
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const { email, password, surname, name, patronymic, role_id, course_id, group_id } = req.body;
            let sql;
            let values;
            if (password === "") {
                sql = `UPDATE users SET email = ?, surname = ?, name = ?, patronymic = ?, role_id = ?, course_id = ?, group_id = ? WHERE id = ?;`;
                values = [email, surname, name, patronymic, role_id, course_id, group_id, id];
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                sql = `UPDATE users SET email = ?, password = ?, surname = ?, name = ?, patronymic = ?, role_id = ?, course_id = ?, group_id = ? WHERE id = ?;`;
                values = [email, hashedPassword, surname, name, patronymic, role_id, course_id, group_id, id];
            }
            try {
                const [result] = await pool.execute(sql, values);
                if (result.affectedRows > 0) {
                    console.log(`Edited user with id ${id}`);
                    res.status(200).send('User has successfully edited');
                } else {
                    res.status(404).send('User is not found');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Edit user error');
            }
        });

        // Запросы на удаление записей из БД
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM users WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted user with id ${id}`);
                    res.status(204).send('User has successfully deleted');
                } else {
                    res.status(404).send('User is not found');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Delete user error');
            }
        });

        // Обработка неопределенных URL-адресов
        app.use((req, res) => {
            res.status(404).send('Not found');
        });

        // Слушатель порта
        app.listen(PORT, () => {
            console.log('Server is working on port: ', PORT);
        });
    } catch (e) {
        // Остановка приложения в случае ошибки подключения к базе данных
        console.error(e);
        process.exit(1);
    }

})();