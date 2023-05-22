import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from 'axios';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answersCount, setAnswersCount] = useState(1);

    let tableName = 'Вопросы';

    useEffect(() => {
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
        });
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleChange = (selectedOption) => {
        console.log(selectedOption[0].value);
        setSelectedOption(selectedOption[0].value);
    };

    const handleShowAddModal = () => {
        axios.get(`/topics`).then((response) => {
            setOptions(response.data.map(topic => ({ value: topic.id, label: topic.topic_name })));
        });
        setShowAddModal(true);
    };

    const handleShowEditModal = (question) => {
        setSelectedQuestion(question);
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        axios.delete(`/questions/${id}`).then(() => {
            setQuestions(questions.filter((question) => question.id !== id));
        });
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            title: form.title.value,
            description: form.description.value,
        };

        axios.post(`/questions`, body).then((response) => {
            setQuestions([...questions, response.data]);
            setShowAddModal(false);
        });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            title: form.title.value,
            description: form.description.value,
        };

        axios.put(`/questions/${selectedQuestion.id}`, body).then(() => {
            setQuestions(
                questions.map((question) =>
                    question.id === selectedQuestion.id ? { ...question, ...body } : question
                )
            );
            setShowEditModal(false);
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
                            <th>Вопрос</th>
                            <th>Ответы</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((question) => (
                            <tr key={question.id}>
                                <td>{question.topic_name}</td>
                                <td>{question.body}</td>
                                <td>{question.description}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(question)}
                                    >
                                        Редактировать
                                    </Button>
                                    <DeleteItemConfirmation
                                        onDelete={() => handleDelete(question.id)}
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
                        <Form.Group controlId="topic">
                            <Form.Label className='mb-1 mt-2'>Тема</Form.Label>
                            <Typeahead
                                id="typeahead-topic"
                                options={options}
                                defaultSelected={options.filter(option => option.value === selectedOption)}
                                onChange={handleChange}
                                labelKey="label"
                                placeholder="Выберите тему"
                            />
                        </Form.Group>
                        <Form.Group controlId="question">
                            <Form.Label className='mb-1 mt-2'>Вопрос</Form.Label>
                            <Form.Control type="text" required placeholder="Введите вопрос" />
                        </Form.Group>
                        <Form.Group controlId="question">
                            <Form.Label className='mb-1 mt-2'>Ответы</Form.Label>
                            <Form.Control type="text" required placeholder="Введите ответ" />
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
                        <Form.Group controlId="title">
                            <Form.Label className='mb-1 mt-2'>Название</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={selectedQuestion.title}
                            />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label className='mb-1 mt-2'>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={selectedQuestion.description}
                            />
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
        </div>
    );
};

export default Questions;