import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';

const Topics = () => {
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState({});
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    let tableName = 'Темы';

    useEffect(() => {
        axios.get(`/topics`).then((response) => {
            setTopics(response.data);
        });
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredTopics = topics.filter((topic) => {
        const value = topic.topic_name;
        const term = searchTerm.toLowerCase();
        return value.toString().toLowerCase().includes(term);
    });

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (topic) => {
        setSelectedTopic(topic);
        setShowEditModal(true);
    };

    const handleShowQuestionsModal = (topic) => {
        setSelectedTopic(topic);
        axios.get(`/questions/${topic.id}`).then((response) => {
            setQuestions(response.data);
            setShowQuestionsModal(true);
        });
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            topic_name: form.topic_name.value
        };

        axios.post(`/topics`, body).then((response) => {
            setTopics([...topics, response.data]);
        });
        setShowAddModal(false);
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            topic_name: form.topic_name.value
        };

        axios.put(`/topics/${selectedTopic.id}`, body).then(() => {
            setTopics(
                topics.map((topic) =>
                    topic.id === selectedTopic.id ? { ...topic, ...body } : topic
                )
            );
            setShowEditModal(false);
        });
    };

    const handleDelete = (id) => {
        axios.delete(`/topics/${id}`).then(() => {
            setTopics(topics.filter((topic) => topic.id !== id));
        });
    };

    const handleDeleteQuestion = (id) => {
        axios.delete(`/questions/${id}`).then(() => {
            setQuestions(questions.filter((question) => question.id !== id));
        });
    };

    return (
        <div className="mt-4 mx-0 mx-md-3">
            <div className='d-flex flex-wrap justify-content-between mb-4 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
                <div className='d-flex flex-wrap gap-2 col-12 col-md-auto'>
                    <Form.Control
                        className='search-bar'
                        type='text'
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder='Поиск'
                    />
                </div>
                <Button className='col-12 col-md-2' variant="primary" onClick={handleShowAddModal}>
                    Добавить
                </Button>
            </div>

            <div className='table-responsive'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Тема</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTopics.map((topic) => (
                            <tr key={topic.id}>
                                <td>{topic.topic_name}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleShowQuestionsModal(topic)}
                                    >
                                        Просмотр
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(topic)}
                                    >
                                        Редактировать
                                    </Button>
                                    <DeleteItemConfirmation
                                        onDelete={() => handleDelete(topic.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="topic_name">
                            <Form.Label className='mb-1 mt-2'>Название</Form.Label>
                            <Form.Control type="text" required placeholder="Введите название темы" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Добавить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Редактировать элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="topic_name">
                            <Form.Label className='mb-1 mt-2'>Название</Form.Label>
                            <Form.Control type="text" required defaultValue={selectedTopic.topic_name} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить изменения
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showQuestionsModal} onHide={() => setShowQuestionsModal(false)}>
                <Form>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedTopic.topic_name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table bordered hover className='bg-white text-black'>
                            <thead>
                                <tr>
                                    <th>Вопрос</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question) => (
                                    <tr key={question.id}>
                                        <td>{question.question_body}</td>
                                        <td className='d-flex flex-wrap justify-content-end gap-2'>
                                            <DeleteItemConfirmation
                                                onDelete={() => handleDeleteQuestion(question.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Form>
            </Modal>
        </div>
    );
};

export default Topics;