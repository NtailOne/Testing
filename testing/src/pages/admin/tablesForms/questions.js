import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from 'axios';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [questionsTable, setQuestionsTable] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('question_body');
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswers, setNewAnswers] = useState([]);
    const [answersCount, setAnswersCount] = useState(1);

    let tableName = 'Вопросы';

    useEffect(() => {
        axios.get(`/questions-table`).then((response) => {
            setQuestionsTable(response.data);
        });
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
        });
        axios.get(`/answers`).then((response) => {
            setAnswers(response.data);
        });
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleColumnSelect = (event) => {
        setSearchColumn(event.target.value);
    };

    const filteredQuestions = questionsTable.filter((question) => {
        const value = question[searchColumn];
        const term = searchTerm.toLowerCase();
        return value && value.toString().toLowerCase().includes(term);
    });

    const handleChange = (selectedOption) => {
        if (selectedOption && selectedOption.length > 0) {
            setSelectedOption(selectedOption[0].value);
        } else setSelectedOption(null);
    };

    const createNewAnswer = () => {
        const newAnswer = {
            num: answersCount,
            answer_body: '',
            question_id: null
        };
        setNewAnswers([...newAnswers, newAnswer]);
        setAnswersCount(prev => prev + 1);
    };

    const handleNewAnswerChange = (event, answerNum) => {
        setNewAnswers(
            newAnswers.map((a) =>
                a.num === answerNum
                    ? { ...a, answer_body: event.target.value }
                    : a
            )
        );
    };

    const handleDeleteNewAnswer = (answerNum) => {
        setNewAnswers(newAnswers.filter((newAnswer) => newAnswer.num !== answerNum));
    };

    const handleModalCancel = () => {
        setSelectedQuestion({});
        setSelectedOption(null);
        setAnswersCount(1);
        setNewAnswers([]);
        setShowAddModal(false);
        setShowEditModal(false);
    };

    const handleShowAddModal = () => {
        axios.get(`/topics`).then((response) => {
            setOptions(response.data.map(topic => ({ value: topic.id, label: topic.topic_name })));
        });
        setShowAddModal(true);
    };

    const handleShowEditModal = (question) => {
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
        });
        setSelectedQuestion(question);
        setShowEditModal(true);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        if (selectedOption === null) {
            alert('Выберите тему')
            return;
        } else if (answersCount === 2) {
            alert('У тестового вопроса не может быть один ответ')
            return;
        } else if (answersCount === 1) {
            alert('Вы не добавили ни одного ответа')
            return;
        }

        const form = event.target;
        const body = {
            topic_id: form.topic.value,
            question_body: form.question_body.value,
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
            topic_id: form.topic.value,
            question_body: form.question_body.value,
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

    const handleDelete = (id) => {
        axios.delete(`/questions/${id}`).then(() => {
            setQuestions(questions.filter((question) => question.id !== id));
        });
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
                        {filteredQuestions.map((question) => (
                            <tr key={question.id}>
                                <td>{question.topic_name}</td>
                                <td>{question.question_body}</td>
                                <td>
                                    <ul>
                                        {answers.filter((answer) => (
                                            question.id === answer.question_id
                                        )).map((answer) => (
                                            <li key={answer.id} className={answer.correctness ? 'correct-answer' : ''}>{answer.answer_body}</li>
                                        ))}
                                    </ul>
                                </td>
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

            <Modal show={showAddModal} onHide={handleModalCancel}>
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
                                allowNew={false}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="question">
                            <Form.Label className='mb-1 mt-2'>Вопрос</Form.Label>
                            <Form.Control as="textarea" rows={3} required placeholder="Введите вопрос" />
                        </Form.Group>
                        <div className='d-flex flex-wrap mb-1 mt-3 justify-content-between'>
                            <Form.Label className='mb-1 mt-2'>Ответы:</Form.Label>
                            <Button variant="primary" onClick={createNewAnswer}>
                                Добавить ответ
                            </Button>
                        </div>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Ответ</th>
                                    <th>Правильный</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newAnswers.map((answer) => (
                                    <tr key={answer.num} className="align-middle">
                                        <td>
                                            <Form.Control
                                                type="text"
                                                placeholder="Введите текст ответа"
                                                value={answer.answer_body}
                                                onChange={(event) => handleNewAnswerChange(event, answer.num)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Group controlId="correctness" className='d-flex justify-content-center'>
                                                <Form.Check type="checkbox"/>
                                            </Form.Group>
                                        </td>
                                        <td>
                                            <DeleteItemConfirmation
                                                onDelete={() => handleDeleteNewAnswer(answer.num)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
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
                        <Button variant="secondary" onClick={handleModalCancel}>
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