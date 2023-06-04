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
    const [modalQuestions, setModalQuestions] = useState([]);
    const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
    const [nextQuestionId, setNextQuestionId] = useState(-1);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState({});
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [roles, setRoles] = useState({});
    const [members, setMembers] = useState([]);
    const [nextMemberId, setNextMemberId] = useState(-1);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState();
    const [maxScore, setMaxScore] = useState(0);
    const [selectedTest, setSelectedTest] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('test_name');
    const [loading, setLoading] = useState(false);
    const [selectedStudentChooseOption, setSelectedStudentChooseOption] = useState('Курс');

    let tableName = 'Тесты';

    useEffect(() => {
        getTests();
        getTestsTable();
        getRoles();
        getUsers();
        getCourses();
        getGroups();
        getQuestions();
    }, []);

    const getTestsTable = () => {
        setLoading(true);
        axios.get(`/tests-table`).then((response) => {
            setTestsTable(response.data.map(test => ({
                ...test,
                start_time: moment.utc(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment.utc(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            })));
            setLoading(false);
        });
    };

    const getTests = () => {
        setLoading(true);
        axios.get(`/tests`).then((response) => {
            setTests(response.data.map(test => ({
                ...test,
                start_time: moment.utc(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment.utc(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            })));
            setLoading(false);
        });
    };

    const getQuestions = () => {
        setLoading(true);
        axios.get(`/questions`).then((response) => {
            setQuestions(response.data);
            setLoading(false);
        });
    };

    const getUsers = () => {
        setLoading(true);
        axios.get(`/users`).then((response) => {
            setUsers(response.data);
            setLoading(false);
        });
    };

    const getGroups = () => {
        setLoading(true);
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
            setLoading(false);
        });
    };

    const getCourses = () => {
        setLoading(true);
        axios.get(`/courses`).then((response) => {
            setCourses(response.data);
            setLoading(false);
        });
    };

    const getRoles = () => {
        setLoading(true);
        axios.get(`/roles`).then((response) => {
            const data = response.data;
            const teacherRoleId = data.find(role => role.role_name === 'Преподаватель').id;
            const studentRoleId = data.find(role => role.role_name === 'Студент').id;
            setRoles({ teacher: teacherRoleId, student: studentRoleId });
            setLoading(false);
        });
    };

    const getMembers = (testId) => {
        setLoading(true);
        axios.get(`/members/${testId}`).then((response) => {
            setMembers(response.data);
            setLoading(false);
        });
    };

    const getTestQuestions = (testId) => {
        setLoading(true);
        axios.get(`/tests_questions/${testId}`).then((response) => {
            const testsQuestions = questions.filter(question => response.data.includes(question.id));
            setModalQuestions(testsQuestions);
            setSelectedQuestionsIds(response.data);
            setLoading(false);
        });
    };

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

    const handleTeacherChange = (selected) => {
        setSelectedTeacher(selected[0]);
    };

    const handleStudentChooseOptionChange = (event) => {
        setSelectedCourse({});
        setSelectedGroup({});
        setMembers([]);
        setSelectedStudentChooseOption(event.target.value);
    };

    const handleCourseChange = (event) => {
        const courseNum = event.target.value;
        const course = courses.find(c => c.course_num == courseNum);
        setSelectedCourse(course);
    };

    const handleGroupChange = (event) => {
        setSelectedGroup(event.target.value);
    };

    const addMember = (user_id = null) => {
        const newMember = {
            id: nextMemberId,
            user_id
        };
        setMembers([...members, newMember]);
        setNextMemberId(prev => prev - 1);
    };

    const handleMemberChange = (selected, id) => {
        const selectedUser = selected[0];
        if (selectedMembers.includes(selectedUser.id)) {
            return;
        }
        setSelectedMembers([...selectedMembers, selectedUser.id]);
        setMembers(
            members.map((member) =>
                member.id === id
                    ? { ...member, user_id: selectedUser.id }
                    : member
            )
        );
    };

    const handleDeleteMember = (selectedMember) => {
        setMembers(members.filter((member) => member.id !== selectedMember.id));
        setSelectedMembers(selectedMembers.filter((member) => member !== selectedMember.user_id));
    };

    const addQuestion = (question_body = '') => {
        const newQuestion = {
            id: nextQuestionId,
            question_body
        };
        setModalQuestions([...modalQuestions, newQuestion]);
        setNextQuestionId(prev => prev - 1);
        setMaxScore(prev => prev + 1);
    };

    const handleQuestionChange = (selected, id) => {
        const selectedQuestion = selected[0];
        if (selectedQuestionsIds.includes(selectedQuestion.id)) {
            return;
        }
        setSelectedQuestionsIds([...selectedQuestionsIds, selectedQuestion.id]);
        setModalQuestions(
            modalQuestions.map((question) =>
                question.id === id
                    ? { ...question, question_body: selectedQuestion.question_body }
                    : question
            )
        );
    };

    const handleDeleteQuestion = (selectedQuestion) => {
        setModalQuestions(modalQuestions.filter((question) => question.id !== selectedQuestion.id));
        setSelectedQuestionsIds(selectedQuestionsIds.filter((question) => question !== selectedQuestion.id));
        setMaxScore(prev => prev - 1);
    };

    const handleModalCancel = () => {
        setSelectedStudentChooseOption('Курс');
        setSelectedCourse({});
        setSelectedGroup({});
        setNextMemberId(-1);
        setMembers([]);
        setSelectedMembers([]);
        setNextQuestionId(-1);
        setModalQuestions([]);
        setSelectedQuestionsIds([]);
        setMaxScore(0);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowMembersModal(false);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (test) => {
        setSelectedTest(test);
        getTestQuestions(test.id);
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

        const form = event.target;
        const startTime = moment.utc(form.start_time.value).format('YYYY-MM-DD HH:mm:ss');
        const endTime = moment.utc(form.end_time.value).format('YYYY-MM-DD HH:mm:ss');
        const timeToPass = moment.utc(
            moment.duration(form.time_to_pass.value, 'minutes').asMilliseconds()
        ).format('HH:mm:ss');
        
        const testBody = {
            test_name: form.test_name.value,
            start_time: startTime,
            end_time: endTime,
            time_to_pass: timeToPass,
            max_score: maxScore,
            teacher_id: selectedTeacher.id,
            count_in_stats: form.count_in_stats.checked
        }
        if (selectedCourse !== undefined) {
            setSelectedMembers(users.filter(user =>
                user.role_id == roles['student']
                && user.course_id == selectedCourse.id));
        } else if (selectedGroup !== undefined) {
            setSelectedMembers(users.filter(user =>
                user.role_id == roles['student']
                && user.group_id == selectedGroup.id));
        }
        const testUsers = {
            test_id: -1,
            users: selectedMembers
        }
        const testQuestions = {
            test_id: -1,
            questions_ids: selectedQuestionsIds
        }

        axios.post(`/tests`, testBody).then((response) => {
            setTests([...tests, response.data]);
            setShowAddModal(false);
            testUsers.test_id = response.data.id;
            testQuestions.test_id = response.data.id;
            axios.post(`/tests_users`, testUsers).catch((error) => {
                console.error(error);
            });
            axios.post(`/tests_questions`, testQuestions).catch((error) => {
                console.error(error);
            });
            setLoading(false);
        }).catch((error) => {
            console.error(error);
        });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const form = event.target;
        const body = {
            title: form.title.value,
            description: form.description.value,
        };

        axios.put(`/tests/${selectedTest.id}`, body).then(() => {
            setTests(
                tests.map((test) =>
                    test.id === selectedTest.id ? { ...test, ...body } : test
                )
            );
            setLoading(false);
        });
        setShowEditModal(false);
    };

    const handleDelete = (id) => {
        setLoading(true);
        axios.delete(`/tests/${id}`).then(() => {
            setTests(tests.filter((test) => test.id !== id));
            setLoading(false);
        });
    };

    return (
        <div className='mt-4 mx-0 mx-md-3'>
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
                <Button className='col-12 col-md-2' variant='primary' onClick={handleShowAddModal}>
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
                                        variant='secondary'
                                        onClick={() => handleShowMembersModal(test)}
                                    >
                                        Просмотр
                                    </Button>
                                </td>
                                <td className='d-flex flex-column justify-content-center gap-2'>
                                    <Button
                                        variant='success'
                                        onClick={() => handleShowEditModal(test)}
                                    >
                                        Новый
                                    </Button>
                                    <Button
                                        variant='dark'
                                        onClick={() => handleShowEditModal(test)}
                                    >
                                        Остановить
                                    </Button>
                                    <Button
                                        variant='warning'
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
                        <Modal.Title>Добавить тест</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className='mb-3' controlId='test_name'>
                            <Form.Label>Название теста</Form.Label>
                            <Form.Control type='text' name='test_name' placeholder='Введите название' required />
                        </Form.Group>
                        <div className='d-flex flex-wrap gap-3 mb-3'>
                            <Form.Group className='col-12 col-sm' controlId='start_time'>
                                <Form.Label>Время начала</Form.Label>
                                <Form.Control type='datetime-local' name='start_time' required />
                            </Form.Group>
                            <Form.Group className='col-12 col-sm' controlId='end_time'>
                                <Form.Label>Время окончания</Form.Label>
                                <Form.Control type='datetime-local' name='end_time' required />
                            </Form.Group>
                        </div>
                        <Form.Group className='mb-3' controlId='time_to_pass'>
                            <Form.Label>Время на прохождение (в минутах)</Form.Label>
                            <Form.Control type='number' name='time_to_pass' placeholder='Введите время' required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='count_in_stats'>
                            <Form.Check type='checkbox' name='count_in_stats' label='Учитывать результаты теста в статистике' />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='teacher'>
                            <Form.Label>Выберите преподавателя</Form.Label>
                            <Typeahead
                                id='typeahead-teacher'
                                options={users.filter(user => user.role_id === roles['teacher'])}
                                onChange={handleTeacherChange}
                                labelKey={option => `${option.surname} ${option.name} ${option.patronymic}`}
                                placeholder='Выберите преподавателя'
                                allowNew={false}
                                required
                            />
                        </Form.Group>
                        <div className='d-flex flex-column flex-sm-row justify-content-between gap-3 mb-3'>
                            <Form.Check
                                type='radio'
                                label='Курс'
                                value='Курс'
                                checked={selectedStudentChooseOption === 'Курс'}
                                onChange={handleStudentChooseOptionChange}
                            />
                            <Form.Check
                                type='radio'
                                label='Группа'
                                value='Группа'
                                checked={selectedStudentChooseOption === 'Группа'}
                                onChange={handleStudentChooseOptionChange}
                            />
                            <Form.Check
                                type='radio'
                                label='Отдельно'
                                value='Отдельно'
                                checked={selectedStudentChooseOption === 'Отдельно'}
                                onChange={handleStudentChooseOptionChange}
                            />
                        </div>
                        <div className='d-flex flex-wrap gap-3'>
                            <Form.Group controlId='course' className={`${selectedStudentChooseOption !== 'Отдельно' ? 'd-flex' : 'd-none'} col-12 col-sm flex-wrap mb-3 justify-content-between`}>
                                <Form.Label>Выберите курс</Form.Label>
                                <Form.Select value={selectedCourse.id} onChange={handleCourseChange}>
                                    <option value='' disabled>Выберите курс</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.course_num}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId='group' className={`${selectedStudentChooseOption === 'Группа' ? 'd-flex' : 'd-none'} col-12 col-sm flex-wrap mb-3 justify-content-between`}>
                                <Form.Label>Выберите группу</Form.Label>
                                <Form.Select value={selectedGroup} onChange={handleGroupChange}>
                                    <option value='' disabled>Выберите группу</option>
                                    {groups.filter(group => group.course_id === selectedCourse.id)
                                        .map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.group_name}
                                            </option>
                                        ))}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className={`${selectedStudentChooseOption === 'Отдельно' ? 'd-block' : 'd-none'}`}>
                            <div className='d-flex flex-wrap mb-3 justify-content-between'>
                                <Form.Label>Участники:</Form.Label>
                                <Button variant='primary' onClick={addMember}>
                                    Добавить студента
                                </Button>
                            </div>
                            <div className={`table-responsive ${members.length === 0 ? 'd-none' : ''}`}>
                                <Table bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Участник</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => (
                                            <tr key={member.id} className='align-middle'>
                                                <td>
                                                    <Form.Group controlId={`member${member.id}`} className=''>
                                                        <Typeahead
                                                            id='typeahead-members'
                                                            options={users.filter(user => user.role_id === roles.student && !selectedMembers.some(member => member === user.id))}
                                                            onChange={(selected) => handleMemberChange(selected, member.id)}
                                                            labelKey={option => `${option.surname} ${option.name} ${option.patronymic}`}
                                                            placeholder='Выберите студента'
                                                            allowNew={false}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </td>
                                                <td className='d-flex flex-column justify-content-center'>
                                                    <DeleteItemConfirmation
                                                        onDelete={() => handleDeleteMember(member)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                        <div className='d-flex flex-wrap mb-3 justify-content-between'>
                            <Form.Label>Вопросы:</Form.Label>
                            <Button variant='primary' onClick={addQuestion}>
                                Добавить вопрос
                            </Button>
                        </div>
                        <div className={`table-responsive ${modalQuestions.length === 0 ? 'd-none' : ''}`}>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>Вопрос</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalQuestions.map((question) => (
                                        <tr key={question.id} className='align-middle'>
                                            <td>
                                                <Form.Group controlId={`question${question.id}`} className=''>
                                                    <Typeahead
                                                        id='typeahead-question'
                                                        options={questions.filter(question => !selectedQuestionsIds.some(q => q === question.id))}
                                                        onChange={(selected) => handleQuestionChange(selected, question.id)}
                                                        labelKey={"question_body"}
                                                        placeholder='Выберите вопрос'
                                                        allowNew={false}
                                                        required
                                                    />
                                                </Form.Group>
                                            </td>
                                            <td className='d-flex flex-column justify-content-center'>
                                                <DeleteItemConfirmation
                                                    onDelete={() => handleDeleteQuestion(question)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleModalCancel}>
                            Отмена
                        </Button>
                        <Button variant='primary' type='submit'>
                            Добавить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showEditModal} onHide={handleModalCancel}>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Редактировать тест</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className='mb-3' controlId='test_name'>
                            <Form.Label>Название теста</Form.Label>
                            <Form.Control type='text' name='test_name' defaultValue={selectedTest.test_name} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='start_time'>
                            <Form.Label>Время начала</Form.Label>
                            <Form.Control type='datetime-local' name='start_time' defaultValue={selectedTest.start_time} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='end_time'>
                            <Form.Label>Время окончания</Form.Label>
                            <Form.Control type='datetime-local' name='end_time' defaultValue={selectedTest.end_time} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='time_to_pass'>
                            <Form.Label>Время на прохождение (в минутах)</Form.Label>
                            <Form.Control type='number' name='time_to_pass' defaultValue={selectedTest.time_to_pass} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='max_score'>
                            <Form.Label>Максимальный балл</Form.Label>
                            <Form.Control type='number' name='max_score' defaultValue={selectedTest.max_score} required />
                        </Form.Group>
                        <Form.Group className='mb-3' controlId='count_in_stats'>
                            <Form.Check type='checkbox' name='count_in_stats' defaultChecked={selectedTest.count_in_stats} label='Учитывать результаты теста в статистике' />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleModalCancel}>
                            Отмена
                        </Button>
                        <Button variant='primary' type='submit'>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.user_name}</td>
                                            <td>{member.status_name}</td>
                                            <td>{member.grade}</td>
                                            <td>{member.time_spent}</td>
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