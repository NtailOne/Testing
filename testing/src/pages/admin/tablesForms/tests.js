import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
import moment from 'moment';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';
import LoadingIndicator from '../../../components/LoadingIndicator';

const Tests = () => {
    const [testsTable, setTestsTable] = useState([]);
    const [tests, setTests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedTest, setSelectedTest] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('test_name');
    const [loading, setLoading] = useState(false);

    let tableName = 'Тесты';

    useEffect(() => {
        getTests();
        getTestsTable();
    }, []);

    const getTestsTable = () => {
        setLoading(true);
        axios.get(`/tests-table`).then((response) => {
            setTestsTable(response.data.map(test => ({
                ...test,
                start_time: moment(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            })));
            setLoading(false);
        });
    }

    const getTests = () => {
        setLoading(true);
        axios.get(`/tests`).then((response) => {
            setTests(response.data.map(test => ({
                ...test,
                start_time: moment(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            })));
            setLoading(false);
        });
    }

    const getQuestions = () => {
        setLoading(true);
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
            setLoading(false);
        });
    }

    const getTopics = () => {
        setLoading(true);
        axios.get(`/topics`).then((response) => {
            setTopics(response.data);
            setLoading(false);
        });
    }

    const getUsers = () => {
        setLoading(true);
        axios.get(`/users`).then((response) => {
            setUsers(response.data);
            setLoading(false);
        });
    }

    const getGroups = () => {
        setLoading(true);
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
            setLoading(false);
        });
    }

    const getCourses = () => {
        setLoading(true);
        axios.get(`/courses`).then((response) => {
            setCourses(response.data);
            setLoading(false);
        });
    }

    const getMembers = (testId) => {
        setLoading(true);
        axios.get(`/members/${testId}`).then((response) => {
            setMembers(response.data);
            setLoading(false);
        });
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleColumnSelect = (event) => {
        setSearchColumn(event.target.value);
    };

    const filteredTests = testsTable.filter((test) => {
        const value = test[searchColumn];
        const term = searchTerm.toLowerCase();
        return value && value.toString().toLowerCase().includes(term);
    });

    const handleModalCancel = () => {

        setShowAddModal(false);
        setShowEditModal(false);
        setShowMembersModal(false);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (test) => {
        setSelectedTest(test);
        setShowEditModal(true);
    };

    const handleShowMembersModal = (test) => {
        setSelectedTest(test);
        getMembers(test.id);
        setShowMembersModal(true);
    }

    const handleAddSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        // const form = event.target;
        // const body = {
        //     title: form.title.value,
        //     description: form.description.value,
        // };

        // axios.post(`/tests`, body).then((response) => {
        //     setTests([...tests, response.data]);
        //     setShowAddModal(false);
        // });
        setLoading(false);
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        // const form = event.target;
        // const body = {
        //     title: form.title.value,
        //     description: form.description.value,
        // };

        // axios.put(`/tests/${selectedTest.id}`, body).then(() => {
        //     setTests(
        //         tests.map((test) =>
        //             test.id === selectedTest.id ? { ...test, ...body } : test
        //         )
        //     );
        //     setShowEditModal(false);
        // });
        setLoading(false);
    };

    const handleDelete = (id) => {
        setLoading(true);
        // axios.delete(`/tests/${id}`).then(() => {
        //     setTests(tests.filter((test) => test.id !== id));
        // });
        setLoading(false);
    };

    const handleDeleteMember = (id) => {
        setLoading(true);

        setLoading(false);
    };

    const [testName, setTestName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [timeToPass, setTimeToPass] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [teacherName, setTeacherName] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const newTest = {
            test_name: testName,
            start_time: startTime,
            end_time: endTime,
            time_to_pass: timeToPass,
            max_score: maxScore,
            teacher_name: teacherName,
        };
        // onSubmit(newTest);
        // onHide();
    };

    return (
        <div className="mt-4 mx-0 mx-md-3">
            <div className='d-flex flex-wrap justify-content-between mb-4 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
                <div className='d-flex flex-wrap gap-2 col-12 col-md-auto'>
                    <Form.Select className='search-bar' value={searchColumn} onChange={handleColumnSelect}>
                        <option value='test_name'>Название</option>
                        <option value='teacher_name'>Преподаватель</option>
                        <option value='start_time'>Время начала</option>
                    </Form.Select>
                    <Form.Control
                        className='search-bar'
                        type='text'
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder='Поиск по критерию'
                    />
                </div>
                <Button className='col-12 col-md-2' variant="primary" onClick={handleShowAddModal}>
                    Добавить
                </Button>
            </div>

            {loading ? <LoadingIndicator /> : <div className='table-responsive'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Время доступа</th>
                            <th>Время на прохождение</th>
                            <th>Максимальный балл</th>
                            <th>Преподаватель</th>
                            <th>Участники</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTests.map((test) => (
                            <tr key={test.id}>
                                <td>{test.test_name}</td>
                                <td>С {test.start_time}<br />До {test.end_time}</td>
                                <td>{test.time_to_pass}</td>
                                <td>{test.max_score}{test.count_in_stats ? '' : <p>Не учитывается</p>}</td>
                                <td>{test.teacher_name}</td>
                                <td>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleShowMembersModal(test)}
                                    >
                                        Просмотр
                                    </Button>
                                </td>
                                <td className='d-flex flex-column justify-content-center gap-2'>
                                    <Button
                                        variant="success"
                                        onClick={() => handleShowEditModal(test)}
                                    >
                                        Новый
                                    </Button>
                                    <Button
                                        variant="dark"
                                        onClick={() => handleShowEditModal(test)}
                                    >
                                        Остановить
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(test)}
                                    >
                                        Редактировать
                                    </Button>
                                    <DeleteItemConfirmation
                                        onDelete={() => handleDelete(test.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}

            <Modal show={showAddModal} onHide={handleModalCancel}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="testName">
                            <Form.Label>Название теста</Form.Label>
                            <Form.Control type="text" name="testName" placeholder="Введите название" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="startTime">
                            <Form.Label>Время начала</Form.Label>
                            <Form.Control type="datetime-local" name="startTime" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="endTime">
                            <Form.Label>Время окончания</Form.Label>
                            <Form.Control type="datetime-local" name="endTime" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="timeToPass">
                            <Form.Label>Время на прохождение (в минутах)</Form.Label>
                            <Form.Control type="number" name="timeToPass" placeholder="Введите время" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="maxScore">
                            <Form.Label>Максимальный балл</Form.Label>
                            <Form.Control type="number" name="maxScore" placeholder="Введите балл" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="countInStats">
                            <Form.Check type="checkbox" name="countInStats" label="Учитывать результаты теста в статистике" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalCancel}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Добавить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showEditModal} onHide={handleModalCancel}>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Редактировать элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="test_name">
                            <Form.Label>Название теста</Form.Label>
                            <Form.Control type="text" name="test_name" defaultValue={selectedTest.test_name} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="start_time">
                            <Form.Label>Время начала</Form.Label>
                            <Form.Control type="datetime-local" name="start_time" defaultValue={selectedTest.start_time} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="end_time">
                            <Form.Label>Время окончания</Form.Label>
                            <Form.Control type="datetime-local" name="end_time" defaultValue={selectedTest.end_time} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="time_to_pass">
                            <Form.Label>Время на прохождение (в минутах)</Form.Label>
                            <Form.Control type="number" name="time_to_pass" defaultValue={selectedTest.time_to_pass} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="max_score">
                            <Form.Label>Максимальный балл</Form.Label>
                            <Form.Control type="number" name="max_score" defaultValue={selectedTest.max_score} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="count_in_stats">
                            <Form.Check type="checkbox" name="count_in_stats" defaultChecked={selectedTest.count_in_stats} label="Учитывать результаты теста в статистике" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalCancel}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить изменения
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showMembersModal} onHide={handleModalCancel} className='members'>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedTest.test_name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loading ? <LoadingIndicator color='black' /> : <div className='table-responsive'>
                            <Table bordered hover className='bg-white text-black'>
                                <thead>
                                    <tr>
                                        <th>ФИО</th>
                                        <th>Статус</th>
                                        <th>Оценка</th>
                                        <th>Времени затрачено</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.user_name}</td>
                                            <td>{member.status_name}</td>
                                            <td>{member.grade}</td>
                                            <td>{member.time_spent}</td>
                                            <td className='d-flex flex-column justify-content-end gap-2'>
                                                <DeleteItemConfirmation
                                                    onDelete={() => handleDeleteMember(member.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>}
                    </Modal.Body>
                </Form>
            </Modal>
        </div >
    );
};

export default Tests;