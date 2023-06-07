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

        // Запросы на получение всех записей таблиц БД
        app.get('/users', async (req, res) => {
            const sql = 'SELECT id, role_id, email, surname, name, patronymic, course_id, group_id FROM users';
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

        app.get('/answers', async (req, res) => {
            const sql = 'SELECT * FROM answers';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/tests', async (req, res) => {
            const sql = 'SELECT * FROM tests';
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/statuses', async (req, res) => {
            const sql = 'SELECT * FROM statuses';
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
            const sql = `SELECT questions.id, topics.topic_name, questions.question_body
                FROM questions
                JOIN topics ON questions.topic_id = topics.id;`;
            await executeSelectSqlQuery(pool, sql, res);
        });

        app.get('/tests-table', async (req, res) => {
            const sql = `SELECT tests.id, 
                tests.test_name, 
                tests.start_time, 
                tests.end_time, 
                tests.time_to_pass, 
                tests.max_score, 
                CONCAT(users.surname, ' ', users.name, ' ', users.patronymic) AS teacher_name, 
                tests.count_in_stats 
                FROM tests
                JOIN users ON tests.teacher_id = users.id;`;
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

        app.post('/topics', async (req, res) => {
            const topicName = req.body.topic_name;
            const sql = 'INSERT INTO topics (topic_name) VALUES (?)';
            try {
                const [result] = await pool.execute(sql, [topicName]);
                const topic = { id: result.insertId, topic_name: topicName };
                console.log(`Added topic with id ${result.insertId}`);
                res.status(200).json(topic);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding topic');
            }
        });

        app.post('/groups', async (req, res) => {
            const { group_name, course_id } = req.body;
            const sql = 'INSERT INTO courses_groups (group_name, course_id) VALUES (?, ?)';
            try {
                const [result] = await pool.execute(sql, [group_name, course_id]);
                const group = { id: result.insertId, group_name, course_id };
                console.log(`Added group with id ${result.insertId}`);
                res.status(200).json(group);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding group');
            }
        });

        app.post('/questions', async (req, res) => {
            const { topic_id, question_body } = req.body;
            const sql = 'INSERT INTO questions (topic_id, question_body) VALUES (?, ?)';
            try {
                const [result] = await pool.execute(sql, [topic_id, question_body]);
                const question = { id: result.insertId, topic_id, question_body };
                console.log(`Added question with id ${result.insertId}`);
                res.status(200).json(question);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding question');
            }
        });

        app.post('/answers', async (req, res) => {
            const { answers } = req.body;
            console.log(answers)
            const sql = 'INSERT INTO answers (question_id, answer_body, correctness) VALUES (?, ?, ?)';
            try {
                const results = await Promise.all(answers.map(async ({ question_id, answer_body, correctness }) => {
                    const [result] = await pool.execute(sql, [question_id, answer_body, correctness]);
                    console.log(`Added answer with id ${result.insertId}`);
                    return { id: result.insertId, question_id, answer_body, correctness };
                }));
                res.status(200).json(results);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding answers');
            }
        });

        app.post('/tests', async (req, res) => {
            const { test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats } = req.body;
            const sql = 'INSERT INTO tests (test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats) VALUES (?, ?, ?, ?, ?, ?, ?)';
            try {
                const [result] = await pool.execute(sql, [test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats]);
                const test = { id: result.insertId, test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats };
                console.log(`Added test with id ${result.insertId}`);
                res.status(200).json(test);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding test');
            }
        });

        app.post('/tests_questions', async (req, res) => {
            const { test_id, questions_ids } = req.body;
            const sql = 'INSERT INTO tests_questions (test_id, question_id) VALUES (?, ?)';
            try {
                const results = await Promise.all(questions_ids.map(async question => {
                    const [result] = await pool.execute(sql, [test_id, question]);
                    return { id: result.insertId, test_id, question_id: question };
                }));
                console.log(`Added ${results.length} new tests_questions`);
                res.status(200).json(results);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding tests_questions');
            }
        });

        app.post('/tests_users', async (req, res) => {
            const { test_id, users, grade, time_spent, status_id } = req.body;
            const sql = 'INSERT INTO tests_users (test_id, user_id, grade, time_spent, status_id) VALUES (?, ?, ?, ?, ?)';
            try {
                const results = await Promise.all(users.map(async (user_id) => {
                    const [result] = await pool.execute(sql, [test_id, user_id, grade, time_spent, status_id]);
                    return { id: result.insertId, test_id, user_id, grade, time_spent, status_id };
                }));
                console.log(`Added ${results.length} new tests_users`);
                res.status(200).json(results);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding tests_users');
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
                    res.status(404).send('User not found');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Edit user error');
            }
        });

        app.put('/topics/:id', async (req, res) => {
            const id = req.params.id;
            const topicName = req.body.topic_name;
            const sql = 'UPDATE topics SET topic_name = ? WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [topicName, id]);
                if (result.affectedRows > 0) {
                    console.log(`Updated topic with id ${id}`);
                    const topic = { id: Number(id), topic_name };
                    res.status(200).json(topic);
                } else {
                    res.status(404).send('Topic not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating topic');
            }
        });

        app.put('/groups/:id', async (req, res) => {
            const id = req.params.id;
            const { group_name, course_id } = req.body;
            const sql = 'UPDATE courses_groups SET group_name = ?, course_id = ? WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [group_name, course_id, id]);
                if (result.affectedRows > 0) {
                    console.log(`Updated group with id ${id}`);
                    const group = { id: Number(id), group_name, course_id };
                    res.status(200).json(group);
                } else {
                    res.status(404).send('Group not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating group');
            }
        });

        app.put('/questions/:id', async (req, res) => {
            const id = req.params.id;
            const { topic_id, question_body } = req.body;
            const sql = 'UPDATE questions SET topic_id = ?, question_body = ? WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [topic_id, question_body, id]);
                if (result.affectedRows > 0) {
                    console.log(`Updated question with id ${id}`);
                    const question = { id: Number(id), topic_id, question_body };
                    res.status(200).json(question);
                } else {
                    res.status(404).send('Question not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating question');
            }
        });

        app.put('/answers/:id', async (req, res) => {
            const id = req.params.id;
            const { question_id, answer_body, correctness } = req.body;
            const sql = 'UPDATE answers SET question_id = ?, answer_body = ?, correctness = ? WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [question_id, answer_body, correctness, id]);
                if (result.affectedRows > 0) {
                    console.log(`Updated answer with id ${id}`);
                    const answer = { id: Number(id), question_id, answer_body, correctness };
                    res.status(200).json(answer);
                } else {
                    res.status(404).send('Answer not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating answer');
            }
        });

        app.put('/tests/:id', async (req, res) => {
            const id = req.params.id;
            const { test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats } = req.body;
            const sql = 'UPDATE tests SET test_name = ?, start_time = ?, end_time = ?, time_to_pass = ?, max_score = ?, teacher_id = ?, count_in_stats = ? WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats, id]);
                if (result.affectedRows > 0) {
                    console.log(`Updated test with id ${id}`);
                    const test = { id: Number(id), test_name, start_time, end_time, time_to_pass, max_score, teacher_id, count_in_stats };
                    res.status(200).json(test);
                } else {
                    res.status(404).send('Test not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating test');
            }
        });

        app.put('/tests_questions/:testId/:questionId', async (req, res) => {
            const { testId, questionId } = req.params;
            const sql = 'UPDATE tests_questions SET test_id = ?, question_id = ? WHERE test_id = ? && question_id = ?';
            try {
                const [result] = await pool.execute(sql, [testId, questionId, testId, questionId]);
                if (result.affectedRows > 0) {
                    console.log(`Updated tests_questions with test id ${testId} and question id ${questionId}`);
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Tests-questions not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating tests-questions');
            }
        });

        app.put('/tests_users/:testId/:userId', async (req, res) => {
            const { testId, userId } = req.params;
            const { grade, time_spent, status_id } = req.body;
            const sql = 'UPDATE tests_users SET grade = ?, time_spent = ?, status_id = ? WHERE test_id = ? && user_id = ?';
            try {
                const [result] = await pool.execute(sql, [grade, time_spent, status_id, testId, userId]);
                if (result.affectedRows > 0) {
                    console.log(`Updated tests_users with test id ${testId} and user id ${userId}`);
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Tests-users not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error updating tests-users');
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
                    res.status(204).send(`User with id ${id} deleted`);
                } else {
                    res.status(404).send('User not found');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Delete user error');
            }
        });

        app.delete('/topics/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM topics WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted topic with id ${id}`);
                    res.status(200).send(`Topic with id ${id} deleted`);
                } else {
                    res.status(404).send('Topic not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting topic');
            }
        });

        app.delete('/groups/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM courses_groups WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted group with id ${id}`);
                    res.status(200).send(`Group with id ${id} deleted`);
                } else {
                    res.status(404).send('Group not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting group');
            }
        });

        app.delete('/questions/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM questions WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted question with id ${id}`);
                    res.status(200).send(`Question with id ${id} deleted`);
                } else {
                    res.status(404).send('Question not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting question');
            }
        });

        app.delete('/answers/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM answers WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted answer with id ${id}`);
                    res.status(200).send(`Answer with id ${id} deleted`);
                } else {
                    res.status(404).send('Answer not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting answer');
            }
        });

        app.delete('/tests/:id', async (req, res) => {
            const id = req.params.id;
            const sql = 'DELETE FROM tests WHERE id = ?';
            try {
                const [result] = await pool.execute(sql, [id]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted test with id ${id}`);
                    res.status(200).send(`Test with id ${id} deleted`);
                } else {
                    res.status(404).send('Test not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting test');
            }
        });

        app.delete('/tests_questions/:testId/:questionId', async (req, res) => {
            const { testId, questionId } = req.params;
            const sql = 'DELETE FROM tests_questions WHERE test_id = ? && question_id = ?';
            try {
                const [result] = await pool.execute(sql, [testId, questionId]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted tests_questions with test id ${testId} and question id ${questionId}`);
                    res.status(200).send(`Tests-questions with test id ${testId} and question id ${questionId} deleted`);
                } else {
                    res.status(404).send('Tests-questions not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting tests-questions');
            }
        });

        app.delete('/tests_users/:testId/:userId', async (req, res) => {
            const { testId, userId } = req.params;
            const sql = 'DELETE FROM tests_users WHERE test_id = ? && user_id = ?';
            try {
                const [result] = await pool.execute(sql, [testId, userId]);
                if (result.affectedRows > 0) {
                    console.log(`Deleted tests_users with test id ${testId} and user id ${userId}`);
                    res.status(200).send(`Tests-users with test id ${testId} and user id ${userId} deleted`);
                } else {
                    res.status(404).send('Tests-users not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting tests-users');
            }
        });

        // Другие запросы к БД
        app.get('/tests_questions/:testId', async (req, res) => {
            const testId = req.params.testId;
            const sql = 'SELECT question_id FROM tests_questions WHERE test_id = ?';
            try {
                const [rows] = await pool.execute(sql, [testId]);
                const questionIds = rows.map(row => row.question_id);
                res.status(200).json(questionIds);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error retrieving test questions');
            }
        });

        app.get('/members/:testId', async (req, res) => {
            const testId = req.params.testId;
            const sql = `SELECT tests_users.*, CONCAT(users.surname, ' ', users.name, ' ', users.patronymic) AS user_name, status_name
                FROM tests_users
                JOIN users ON tests_users.user_id = users.id
                JOIN statuses ON tests_users.status_id = statuses.id
                WHERE tests_users.test_id = ?;`;
            try {
                const [rows] = await pool.execute(sql, [testId]);
                res.status(200).json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error retrieving members');
            }
        });

        app.get('/test_users/:testId', async (req, res) => {
            const testId = req.params.testId;
            const sql = 'SELECT user_id FROM tests_users WHERE test_id = ?';
            try {
                const [rows] = await pool.execute(sql, [testId]);
                const userIds = rows.map(row => row.user_id);
                res.status(200).json(userIds);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error retrieving test users');
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