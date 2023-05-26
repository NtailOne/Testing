import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
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
    const [selectedTest, setSelectedTest] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('test_name');
    const [loading, setLoading] = useState(false);

    let tableName = 'Тесты';

    useEffect(() => {
        getTestsTable();
        getTests();
    }, []);

    const getTestsTable = () => {
        axios.get(`/tests-table`).then((response) => {
            setTestsTable(response.data);
        });
    }

    const getTests = () => {
        axios.get(`/tests`).then((response) => {
            setTests(response.data);
        });
    }

    const getQuestions = () => {
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
        });
    }

    const getTopics = () => {
        axios.get(`/topics`).then((response) => {
            setTopics(response.data);
        });
    }

    const getUsers = () => {
        axios.get(`/users`).then((response) => {
            setUsers(response.data);
        });
    }

    const getGroups = () => {
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
        });
    }

    const getCourses = () => {
        axios.get(`/courses`).then((response) => {
            setCourses(response.data);
        });
    }

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleColumnSelect = (event) => {
        setSearchColumn(event.target.value);
    };

    const filteredQuestions = testsTable.filter((test) => {
        const value = test[searchColumn];
        const term = searchTerm.toLowerCase();
        return value && value.toString().toLowerCase().includes(term);
    });

    const handleModalCancel = () => {
        
        setShowAddModal(false);
        setShowEditModal(false);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (test) => {
        setSelectedTest(test);
        setShowEditModal(true);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        // const form = event.target;
        // const body = {
        //     title: form.title.value,
        //     description: form.description.value,
        // };

        // axios.post(`/tests`, body).then((response) => {
        //     setTests([...tests, response.data]);
        //     setShowAddModal(false);
        // });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

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
    };

    const handleDelete = (id) => {
        // axios.delete(`/tests/${id}`).then(() => {
        //     setTests(tests.filter((test) => test.id !== id));
        // });
    };

    return (
        <div className="mt-4 mx-0 mx-md-3">
            <div className='d-flex flex-wrap justify-content-between mb-4 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
                <div className='d-flex flex-wrap gap-2 col-12 col-md-auto'>
                    <Form.Select className='search-bar' value={searchColumn} onChange={handleColumnSelect}>
                        <option value='question_body'>Вопрос</option>
                        <option value='topic_name'>Тема</option>
                    </Form.Select>
                    <Form.Control
                        className='search-bar'
                        type='text'
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder='Поиск по критерию'
                    />
                </div>
                <Button className='col-12 col-sm' variant="primary" onClick={handleShowAddModal}>
                    Добавить
                </Button>
            </div>

            {loading ? <LoadingIndicator /> : <div className='table-responsive'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Тема</th>
                            <th>Вопрос</th>
                            <th>Ответы</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                    </tbody>
                </Table>
            </div>}

            <Modal show={showAddModal} onHide={handleModalCancel}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

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
        </div >
    );
};

export default Tests;