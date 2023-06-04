import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from 'axios';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';
import LoadingIndicator from '../../../components/LoadingIndicator';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [questionsTable, setQuestionsTable] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('question_body');
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState();
    const [answers, setAnswers] = useState([]);
    const [newAnswerId, setNewAnswerId] = useState(-1);
    const [modalAnswers, setModalAnswers] = useState([]);
    const [modalAnswersToDelete, setModalAnswersToDelete] = useState([]);
    const [loading, setLoading] = useState(false);

    let tableName = 'Вопросы';

    useEffect(() => {
        getQuestions();
        getAnswers();
        getTopics();
        getQuestionsTable();
    }, []);

    const getQuestionsTable = () => {
        setLoading(true);
        axios.get(`/questions-table`).then((response) => {
            setQuestionsTable(response.data);
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
            setOptions(response.data.map(topic => ({ value: topic.id, label: topic.topic_name })));
            setLoading(false);
        });
    }

    const getAnswers = () => {
        setLoading(true);
        axios.get(`/answers`).then((response) => {
            setAnswers(response.data);
            setLoading(false);
        });
    }

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

    const createModalAnswer = () => {
        const modalAnswer = {
            id: newAnswerId,
        };
        setModalAnswers([...modalAnswers, modalAnswer]);
        setNewAnswerId(prev => prev - 1);
    };

    const handleModalAnswerChange = (event, answerId, property) => {
        setModalAnswers(
            modalAnswers.map((answer) =>
                answer.id === answerId
                    ? { ...answer, [property]: property === 'correctness' ? event.target.checked : event.target.value }
                    : answer)
        );
    };

    const handleDeleteModalAnswer = (answerId) => {
        setModalAnswersToDelete(modalAnswers.filter((modalAnswer) => modalAnswer.id === answerId));
        setModalAnswers(modalAnswers.filter((modalAnswer) => modalAnswer.id !== answerId));
    };

    const handleModalCancel = () => {
        setSelectedQuestion({});
        setSelectedOption(null);
        setNewAnswerId(-1);
        setModalAnswers([]);
        setModalAnswersToDelete([]);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowExcelModal(false);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (questionsFromTable) => {
        const currQuestion = questions.find(question => questionsFromTable.id == question.id);
        if (currQuestion !== undefined) {
            setSelectedQuestion(currQuestion);
            setModalAnswers(answers.filter(answer => answer.question_id == currQuestion.id)
                .map(answer => ({ ...answer, correctness: answer.correctness > 0 })));
            setSelectedOption(currQuestion.topic_id);
            setShowEditModal(true);
        } else {
            console.error(`User with id ${questionsFromTable.id} not found`);
        }
    };

    const handleShowExcelModal = () => {
        setShowExcelModal(true);
    }

    const handleAddSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        if (selectedOption === null) {
            alert('Выберите тему')
            return;
        } else if (modalAnswers.length === 1) {
            alert('У тестового вопроса не может быть один ответ')
            return;
        } else if (modalAnswers.length === 0) {
            alert('Вы не добавили ни одного ответа')
            return;
        }

        const countTrue = modalAnswers.filter(answer => answer.correctness === true).length;
        const countFalse = modalAnswers.length - countTrue;

        const updatedAnswers = modalAnswers.map(answer => {
            let value = answer.correctness === true ? 1 / countTrue : -1 / countFalse;
            return { ...answer, correctness: value };
        });

        const form = event.target;
        const body = {
            topic_id: selectedOption,
            question_body: form.question.value
        };

        axios.post(`/questions`, body)
            .then((response) => {
                setQuestions([...questions, response.data]);
                const question_id = response.data.id;

                const answersArr = updatedAnswers.map(answer => ({
                    question_id,
                    answer_body: answer.answer_body,
                    correctness: answer.correctness
                }));

                axios.post(`/answers`, { answers: answersArr })
                    .then((response) => {
                        const newAnswers = response.data;
                        setAnswers((prevState) => [...prevState, ...newAnswers]);
                    });

                handleModalCancel();
                getQuestionsTable();
                setLoading(false);
            });
        setShowAddModal(false);
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        if (selectedOption === null) {
            alert('Выберите тему')
            return;
        } else if (modalAnswers.length === 1) {
            alert('У тестового вопроса не может быть один ответ')
            return;
        } else if (modalAnswers.length === 0) {
            alert('Вы не добавили ни одного ответа')
            return;
        }
        
        setLoading(true);

        const countTrue = modalAnswers.filter(answer => answer.correctness === true).length;
        const countFalse = modalAnswers.length - countTrue;

        const updatedAnswers = modalAnswers.map(answer => {
            let value = answer.correctness === true ? 1 / countTrue : -1 / countFalse;
            return { ...answer, correctness: value };
        });

        const form = event.target;
        const body = {
            topic_id: selectedOption,
            question_body: form.question.value
        };

        axios.put(`/questions/${selectedQuestion.id}`, body).then(() => {
            const answerPromises = updatedAnswers.map(answer => {
                if (answer.id < 0) {
                    return axios.post(`/answers`, { ...answer, question_id: selectedQuestion.id });
                } else if (answer.id >= 0) {
                    return axios.put(`/answers/${answer.id}`, answer);
                }
                return Promise.resolve();
            });
            const answerDeletePromises = modalAnswersToDelete.map(answer => {
                return axios.delete(`/answers/${answer.id}`);
            });
            Promise.all([...answerPromises, ...answerDeletePromises]).then(() => {
                getAnswers();
                setQuestions(
                    questions.map((question) =>
                        question.id === selectedQuestion.id ? { ...question, ...body } : question
                    )
                );
                getQuestionsTable();
                setModalAnswersToDelete([]);
                setLoading(false);
            }).catch((error) => {
                console.log("Error updating answers: ", error);
            });
        }).catch((error) => {
            console.log("Error updating question: ", error);
        });
        setShowEditModal(false);
    };

    const handleDelete = (id) => {
        setLoading(true);
        axios.delete(`/questions/${id}`).then(() => {
            setQuestions(questions.filter(question => question.id !== id));
            setQuestionsTable(questionsTable.filter(question => question.id !== id));
            setAnswers(answers.filter(answer => answer.question_id !== id));
            setLoading(false);
        });
    };

    const handleExcelSubmit = async (event) => {
        event.preventDefault();
        const file = event.target.formFile.files[0];
        try {
            setShowExcelModal(false);
            setLoading(true);
            await parseCsv(file);
            getAnswers();
            getQuestions();
            getTopics();
            await getQuestionsTable();
            setLoading(false);
        } catch (error) {
            console.log('Error parsing CSV:', error);
        }
    };

    const parseCsv = async (file) => {
        return new Promise(async (resolve, reject) => {
            const allowedExtensions = ['csv'];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                alert(`Ошибка: недопустимое расширение файла (${fileExtension}). Допустимые расширения: ${allowedExtensions.join(', ')}`);
                setLoading(false);
                return;
            }
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async (event) => {
                const csv = event.target.result;
                const answerStartIndex = 2;
                const failedRecords = [];
                const lines = csv.split('\n');
                for (let i = 0, iLen = lines.length - 1; i < iLen; i++) {
                    const cellsSplitted = lines[i].split(';');
                    const cellsTrimmed = cellsSplitted.map(cell => cell.trim())
                    const cellsSliceFirst = cellsTrimmed.slice(0, answerStartIndex);
                    const cellsSliceSecond = cellsTrimmed.slice(answerStartIndex).filter(cell => cell !== '' && cell !== '\r');
                    const cells = cellsSliceFirst.concat(cellsSliceSecond);

                    if (cells.length < 4) {
                        failedRecords.push({ record: i + 1, reason: 'Количество ответов меньше двух' });
                        continue;
                    }
                    const topicName = cells[0];
                    if (topicName === "") {
                        failedRecords.push({ record: i + 1, reason: 'Отсутствует тема' });
                        continue;
                    }
                    const questionBody = cells[1];
                    if (questionBody === "") {
                        failedRecords.push({ record: i + 1, reason: 'Отсутствует вопрос' });
                        continue;
                    } else if (questions.some(question => question.question_body === questionBody)) {
                        failedRecords.push({ record: i + 1, reason: 'Такой вопрос уже существует в базе' });
                        continue;
                    }
                    const answerCells = cells.slice(answerStartIndex);
                    const answerBodies = answerCells.map((answer) => answer);
                    if (answerBodies.some(answer => answer === "" || answer === "*")) {
                        failedRecords.push({ record: i + 1, reason: 'Обнаружен пустой ответ' });
                        continue;
                    }
                    const correctAnswerIndexes = answerBodies.reduce((acc, answer, index) => {
                        if (answer[0] === '*') {
                            acc.push(index);
                        }
                        return acc;
                    }, []);
                    const answersWithCorrectness = answerBodies.map((answer, index) => {
                        const isCorrect = correctAnswerIndexes.includes(index);
                        return {
                            answer_body: answer.slice(1),
                            correctness: isCorrect,
                        };
                    });
                    if (answersWithCorrectness.every(answer => answer.correctness === false)) {
                        failedRecords.push({ record: i + 1, reason: 'Все ответы неверные' });
                        continue;
                    }

                    const countTrue = answersWithCorrectness.filter(answer => answer.correctness === true).length;
                    const countFalse = answersWithCorrectness.length - countTrue;

                    const updatedAnswers = answersWithCorrectness.map(answer => {
                        let value = answer.correctness === true ? 1 / countTrue : -1 / countFalse;
                        return { ...answer, correctness: value };
                    });
                    let topicId;
                    const topicIndex = options.findIndex((option) => option.label === topicName);
                    if (topicIndex === -1) {
                        const newTopic = { topic_name: topicName };
                        const response = await axios.post('/topics', newTopic);
                        topicId = response.data.id;
                    } else {
                        topicId = options[topicIndex].value;
                    }
                    const newQuestion = { topic_id: topicId, question_body: questionBody };
                    const questionResponse = await axios.post('/questions', newQuestion);
                    const questionId = questionResponse.data.id;
                    const newAnswers = updatedAnswers.map(answer => ({ question_id: questionId, answer_body: answer.answer_body, correctness: answer.correctness }));
                    axios.post('/answers', { answers: newAnswers }).then((response) => {
                        const responseAnswers = response.data;
                        setAnswers((prevState) => [...prevState, ...responseAnswers]);
                    });
                }
                if (failedRecords.length > 0) {
                    const message = failedRecords.map(({ record, reason }) => `Запись №${record}. Причина: ${reason}`).join('\n');
                    alert(`Следующие записи не прошли валидацию:\n${message}`);
                }
                resolve();
            };
            reader.onerror = (error) => reject(error);
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
                <Button className='col-12 col-sm' variant="success" onClick={handleShowExcelModal}>
                    Загрузить из Excel
                </Button>
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
                        {filteredQuestions.map((question) => (
                            <tr key={question.id}>
                                <td>{question.topic_name}</td>
                                <td>{question.question_body}</td>
                                <td>
                                    <ul>
                                        {answers
                                            .filter((answer) => question.id === answer.question_id)
                                            .map((answer, index) => (
                                                <li key={index} className={answer.correctness > 0 ? 'correct-answer' : ''}>
                                                    {answer.answer_body}
                                                </li>
                                            ))
                                        }
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
            </div>}

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
                            <Button variant="primary" onClick={createModalAnswer}>
                                Добавить ответ
                            </Button>
                        </div>
                        <div className={`table-responsive ${modalAnswers.length === 0 ? 'd-none' : ''}`}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Ответ</th>
                                        <th>Правильный</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalAnswers.map((answer) => (
                                        <tr key={answer.id} className="align-middle">
                                            <td>
                                                <Form.Group controlId={`answer${answer.id}`} className='d-flex justify-content-center'>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={1}
                                                        placeholder="Введите текст ответа"
                                                        value={answer.answer_body}
                                                        onChange={(event) => handleModalAnswerChange(event, answer.id, 'answer_body')}
                                                    />
                                                </Form.Group>
                                            </td>
                                            <td>
                                                <Form.Group controlId={`correctness${answer.id}`} className='d-flex justify-content-center'>
                                                    <Form.Check type="checkbox" onChange={(event) => handleModalAnswerChange(event, answer.id, 'correctness')} />
                                                </Form.Group>
                                            </td>
                                            <td>
                                                <DeleteItemConfirmation
                                                    onDelete={() => handleDeleteModalAnswer(answer.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
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
                            <Form.Control as="textarea" rows={3} required defaultValue={selectedQuestion.question_body} placeholder="Введите вопрос" />
                        </Form.Group>
                        <div className='d-flex flex-wrap mb-1 mt-3 justify-content-between'>
                            <Form.Label className='mb-1 mt-2'>Ответы:</Form.Label>
                            <Button variant="primary" onClick={createModalAnswer}>
                                Добавить ответ
                            </Button>
                        </div>
                        <div className={`table-responsive ${modalAnswers.length === 0 ? 'd-none' : ''}`}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Ответ</th>
                                        <th>Правильный</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalAnswers.map((answer) => (
                                        <tr key={answer.id} className="align-middle">
                                            <td>
                                                <Form.Group controlId={`answer${answer.id}`} className='d-flex justify-content-center'>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={1}
                                                        placeholder="Введите текст ответа"
                                                        value={answer.answer_body}
                                                        onChange={(event) => handleModalAnswerChange(event, answer.id, 'answer_body')}
                                                    />
                                                </Form.Group>
                                            </td>
                                            <td>
                                                <Form.Group controlId={`correctness${answer.id}`} className='d-flex justify-content-center'>
                                                    <Form.Check type="checkbox" defaultChecked={answer.correctness > 0} onChange={(event) => handleModalAnswerChange(event, answer.id, 'correctness')} />
                                                </Form.Group>
                                            </td>
                                            <td>
                                                <DeleteItemConfirmation
                                                    onDelete={() => handleDeleteModalAnswer(answer.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
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

            <Modal show={showExcelModal} onHide={handleModalCancel}>
                <Form onSubmit={handleExcelSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Загрузка из Excel</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Структура файла должна быть как на примере ниже:</p>
                        <div className='table-responsive'>
                            <Table bordered>
                                <thead>
                                    <tr className="text-center">
                                        <th>A</th>
                                        <th>B</th>
                                        <th>C</th>
                                        <th>D</th>
                                        <th>E</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        <td>Тема1</td>
                                        <td>Вопрос1</td>
                                        <td>Ответ1</td>
                                        <td>*Ответ2</td>
                                        <td>Ответ3</td>
                                    </tr>
                                    <tr className="text-center">
                                        <td>Тема1</td>
                                        <td>Вопрос2</td>
                                        <td>*Ответ1</td>
                                        <td>*Ответ2</td>
                                        <td>Ответ3</td>
                                    </tr>
                                    <tr className="text-center">
                                        <td>Тема2</td>
                                        <td>Вопрос1</td>
                                        <td>Ответ1</td>
                                        <td>Ответ2</td>
                                        <td>*Ответ3</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <p>"*" перед ответом означает, что ответ правильный</p>
                        <Form.Group controlId="formFile">
                            <Form.Label>Выберите файл</Form.Label>
                            <Form.Control type="file" required name="fileInput" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalCancel}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Загрузить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
};

export default Questions;