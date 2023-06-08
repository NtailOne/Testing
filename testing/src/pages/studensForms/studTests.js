import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

const Tests = () => {
    const [testsTable, setTestsTable] = useState([]);
    const [tests, setTests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [modalQuestions, setModalQuestions] = useState([]);
    const [modalQuestionsToDelete, setModalQuestionsToDelete] = useState([]);
    const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
    const [nextQuestionId, setNextQuestionId] = useState(-1);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState({});
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [roles, setRoles] = useState({});
    const [selectedTestUsersIds, setSelectedTestUsersIds] = useState([]);
    const [selectedTestQuestionsIds, setSelectedTestQuestionsIds] = useState([]);
    const [members, setMembers] = useState([]);
    const [membersToDelete, setMembersToDelete] = useState([]);
    const [selectedMembersIds, setSelectedMembersIds] = useState([]);
    const [nextMemberId, setNextMemberId] = useState(-1);
    const [selectedTeacher, setSelectedTeacher] = useState();
    const [selectedTest, setSelectedTest] = useState({});
    const [statuses, setStatuses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchColumn, setSearchColumn] = useState('test_name');
    const [loading, setLoading] = useState(false);
    const [selectedStudentChooseOption, setSelectedStudentChooseOption] = useState('Курс');
    const [newTest, setNewTest] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [editConfirmed, setEditConfirmed] = useState(false);

    let tableName = 'Доступные тесты';

    useEffect(() => {
        getTests();
        getTestsTable();
        getRoles();
        getUsers();
        getCourses();
        getGroups();
        getQuestions();
        getStatuses();
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
            setSelectedCourse(response.data[0]);
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

    const getStatuses = () => {
        setLoading(true);
        axios.get(`/statuses`).then((response) => {
            setStatuses(response.data);
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

    const getTestUsersIds = (testId) => {
        setLoading(true);
        axios.get(`/test_users/${testId}`).then((response) => {
            setSelectedTestUsersIds(response.data);
            const testsUsers = users.filter(user => response.data.includes(user.id));
            setMembers(testsUsers);
            setSelectedMembersIds(response.data);
            setLoading(false);
        });
    };

    const getTestQuestions = (testId) => {
        setLoading(true);
        axios.get(`/tests_questions/${testId}`).then((response) => {
            setSelectedTestQuestionsIds(response.data);
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
        if (event.target.value === 'Курс') {
            setSelectedCourse(courses[0]);
            setSelectedGroup({});
        } else if (event.target.value === 'Группа') {
            setSelectedCourse(courses[0]);
            setSelectedGroup(groups.filter(group => group.course_id === courses[0].id)[0]);
        } else if (event.target.value === 'Отдельно') {
            setSelectedCourse({});
            setSelectedGroup({});
        }
        setMembers([]);
        setSelectedStudentChooseOption(event.target.value);
    };

    const handleCourseChange = (event) => {
        const courseNum = event.target.value;
        const course = courses.find(c => c.course_num == courseNum);
        setSelectedCourse(course);
        if (JSON.stringify(selectedGroup) !== '{}') {
            setSelectedGroup(groups.filter(group => group.course_id === course.id)[0]);
        }
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

    const handleMemberChange = (selected, currentMember) => {
        const memberParam = currentMember.id > 0 ? 'id' : 'user_id';
        if (!selected[0]) {
            setMembers(
                members.map((member) =>
                    member.id === currentMember.id
                        ? {
                            id: nextMemberId,
                            user_id: null
                        }
                        : member
                )
            );
            setNextMemberId(prev => prev - 1);
            setSelectedMembersIds(selectedMembersIds.filter((memberId) => memberId !== currentMember[memberParam]));
            return;
        }
        const selectedUser = selected[0];
        if (selectedMembersIds.includes(selectedUser.id)) {
            return;
        }
        setMembersToDelete(membersToDelete.filter((member) => member[memberParam] !== currentMember[memberParam]));
        setSelectedMembersIds([...selectedMembersIds, selectedUser.id]);
        setMembers(
            members.map((member) =>
                member.id === currentMember.id
                    ? { ...member, user_id: selectedUser.id }
                    : member
            )
        );
    };

    const handleDeleteMember = (selectedMember) => {
        const memberParam = selectedMember.id > 0 ? 'id' : 'user_id';
        setMembers(members.filter((member) => member[memberParam] !== selectedMember[memberParam]));
        setSelectedMembersIds(selectedMembersIds.filter((memberId) => memberId !== selectedMember[memberParam]));
        setMembersToDelete([...membersToDelete, members.filter((member) => member[memberParam] === selectedMember[memberParam])]);
    };

    const addQuestion = (question_body = null, question_id = null) => {
        const newQuestion = {
            id: nextQuestionId,
            question_body,
            question_id
        };
        setModalQuestions([...modalQuestions, newQuestion]);
        setNextQuestionId(prev => prev - 1);
    };

    const handleQuestionChange = (selected, currentQuestion) => {
        const questionParam = currentQuestion.id > 0 ? 'id' : 'question_id';
        if (!selected[0]) {
            setModalQuestions(
                modalQuestions.map((question) =>
                    question.id === currentQuestion.id
                        ? {
                            id: nextQuestionId,
                            question_body: null,
                            question_id: null
                        }
                        : question
                )
            );
            setNextQuestionId(prev => prev - 1);
            setSelectedQuestionsIds(selectedQuestionsIds.filter((question) => question !== currentQuestion[questionParam]));
            return;
        }
        const selectedQuestion = selected[0];
        if (selectedQuestionsIds.includes(selectedQuestion.id)) {
            return;
        }
        setModalQuestionsToDelete(modalQuestionsToDelete.filter(question => question.id !== currentQuestion[questionParam]));
        setSelectedQuestionsIds([...selectedQuestionsIds, selectedQuestion.id]);
        setModalQuestions(
            modalQuestions.map((question) =>
                question.id === currentQuestion.id
                    ? {
                        ...question,
                        question_body: selectedQuestion.question_body,
                        question_id: selectedQuestion.id
                    }
                    : question
            )
        );
    };

    const handleDeleteQuestion = (selectedQuestion) => {
        const questionParam = selectedQuestion.id > 0 ? 'id' : 'question_id';
        setModalQuestions(modalQuestions.filter((question) => question.id !== selectedQuestion.id));
        setSelectedQuestionsIds(selectedQuestionsIds.filter((question) => question !== selectedQuestion[questionParam]));
        setModalQuestionsToDelete([...modalQuestionsToDelete, modalQuestions.filter((question) => question.id === selectedQuestion.id)]);
    };

    const handleRefresh = (testId) => {
        getMembers(testId);
    };

    const handleModalCancel = () => {
        setSelectedStudentChooseOption('Курс');
        setSelectedCourse({});
        setSelectedGroup({});
        setNextMemberId(-1);
        setMembers([]);
        setMembersToDelete([]);
        setSelectedMembersIds([]);
        setNextQuestionId(-1);
        setModalQuestions([]);
        setModalQuestionsToDelete([]);
        setSelectedQuestionsIds([]);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowMembersModal(false);
        setEditConfirmed(false);
    };

    const handleShowAddModal = (test = null) => {
        if (test != null) {
            setNewTest(true);
            const currentTest = tests.find(t => t.id == test.id);
            setSelectedTest(currentTest);
            setSelectedTeacher(users.find(user => user.id === currentTest.teacher_id));
            getTestUsersIds(currentTest.id);
            getTestQuestions(currentTest.id);
        }
        setShowAddModal(true);
    };

    const handleConfirmationConfirm = () => {
        setEditConfirmed(true);
        setShowConfirmation(false);
    }

    const handleConfirmationCancel = () => {
        setShowConfirmation(false);
        setShowEditModal(false);
    }

    const handleShowEditModal = (test) => {
        setShowConfirmation(true);
        const currentTest = tests.find(t => t.id === test.id);
        setSelectedTest(currentTest);
        setSelectedStudentChooseOption('Отдельно');
        setSelectedCourse({});
        setSelectedGroup({});
        setSelectedTeacher(users.find(user => user.id === currentTest.teacher_id));
        getTestUsersIds(currentTest.id);
        getTestQuestions(currentTest.id);
        setShowEditModal(true);
    };

    const handleShowMembersModal = (test) => {
        setSelectedTest(test);
        getMembers(test.id);
        setShowMembersModal(true);
    }

    const handleAddSubmit = (event) => {
        event.preventDefault();

        if (selectedTeacher === undefined) {
            alert('Выберите преподавателя');
            setLoading(false);
            return;
        } else if (selectedQuestionsIds.length === 0) {
            alert('Выберите вопросы')
            setLoading(false);
            return;
        } else if (members.some(member => member.user_id === null)) {
            alert('Заполните или удалите пустые поля участников')
            setLoading(false);
            return;
        } else if (modalQuestions.some(question => question.question_body === null)) {
            alert('Заполните или удалите пустые поля вопросов')
            setLoading(false);
            return;
        }

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
            max_score: selectedQuestionsIds.length,
            teacher_id: selectedTeacher.id,
            count_in_stats: form.count_in_stats.checked
        };

        let membersIds = selectedMembersIds;

        if (JSON.stringify(selectedGroup) !== '{}') {
            membersIds = users.filter(user =>
                user.role_id == roles['student']
                && user.group_id == selectedGroup.id)
                .map(user => user.id);
        } else if (JSON.stringify(selectedCourse) !== '{}') {
            membersIds = users.filter(user =>
                user.role_id == roles['student']
                && user.course_id == selectedCourse.id)
                .map(user => user.id);
        }

        if (membersIds.length === 0) {
            alert('По указанным параметрам студентов не найдено');
            setLoading(false);
            return;
        }

        const testUsers = {
            test_id: -1,
            users: membersIds,
            grade: 0,
            time_spent: moment.utc(
                moment.duration(0, 'minutes').asMilliseconds()
            ).format('HH:mm:ss'),
            status_id: statuses.find(status => status.status_name === 'Не начал').id
        };
        const testQuestions = {
            test_id: -1,
            questions_ids: selectedQuestionsIds
        };

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
            getTestsTable();
            setLoading(false);
            setNewTest(false);
        }).catch((error) => {
            console.error(error);
        });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        if (!editConfirmed) {
            return;
        } else {
            const testUserRefreshData = {
                grade: 0,
                time_spent: moment.utc(
                    moment.duration(0, 'minutes').asMilliseconds()
                ).format('HH:mm:ss'),
                status_id: statuses.find(status => status.status_name === 'Не начал').id
            };
            selectedTestUsersIds.forEach(async userId => {
                axios.put(`/tests_users/${selectedTest.id}/${userId}`, testUserRefreshData);
            });
        }
        if (selectedTeacher === undefined) {
            alert('Выберите преподавателя');
            return;
        } else if (selectedQuestionsIds.length === 0) {
            alert('Выберите вопросы')
            return;
        } else if (members.some(member => member.user_id === null)) {
            alert('Заполните или удалите пустые поля участников')
            return;
        } else if (modalQuestions.some(question => question.question_body === null)) {
            alert('Заполните или удалите пустые поля вопросов')
            return;
        }

        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

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
            max_score: selectedQuestionsIds.length,
            teacher_id: selectedTeacher.id,
            count_in_stats: form.count_in_stats.checked
        };

        let membersIds = selectedMembersIds;
        if (JSON.stringify(selectedGroup) !== '{}') {
            membersIds = users.filter(user =>
                user.role_id == roles['student']
                && user.group_id == selectedGroup.id)
                .map(user => user.id);
        } else if (JSON.stringify(selectedCourse) !== '{}') {
            membersIds = users.filter(user =>
                user.role_id == roles['student']
                && user.course_id == selectedCourse.id)
                .map(user => user.id);
        }

        if (membersIds.length === 0) {
            alert('По указанным параметрам студентов не найдено');
            setLoading(false);
            return;
        }

        const testUsers = {
            test_id: -1,
            users: [],
            grade: 0,
            time_spent: moment.utc(
                moment.duration(0, 'minutes').asMilliseconds()
            ).format('HH:mm:ss'),
            status_id: statuses.find(status => status.status_name === 'Не начал').id
        };
        const testQuestions = {
            test_id: -1,
            questions_ids: []
        };

        axios.put(`/tests/${selectedTest.id}`, testBody, { signal }).then(() => {
            const membersPromises = membersIds.map(memberId => {
                if (!selectedTestUsersIds.some(id => id === memberId)) {
                    return axios.post(`/tests_users`, {
                        ...testUsers,
                        users: [memberId],
                        test_id: selectedTest.id
                    }, { signal });
                }
                return Promise.resolve();
            });
            const questionsPromises = selectedQuestionsIds.map(questionId => {
                if (!selectedTestQuestionsIds.some(id => id === questionId)) {
                    return axios.post(`/tests_questions`, {
                        ...testQuestions,
                        questions_ids: [questionId],
                        test_id: selectedTest.id
                    }, { signal });
                }
                return Promise.resolve();
            });
            const membersDeletePromises = membersToDelete.map(member => {
                return axios.delete(`/tests_users/${selectedTest.id}/${member[0].id}`, { signal });
            });
            const questionsDeletePromises = modalQuestionsToDelete.map(question => {
                return axios.delete(`/tests_questions/${selectedTest.id}/${question[0].id}`, { signal });
            });
            Promise.all([
                ...membersPromises,
                ...questionsPromises,
                ...membersDeletePromises,
                ...questionsDeletePromises
            ]).then(() => {
                getTestsTable();
                getTests();
                setMembersToDelete([]);
                setModalQuestionsToDelete([]);
                setLoading(false);
                setShowEditModal(false);
                setEditConfirmed(false);
            }).catch((error) => {
                console.log("Error updating questions or users: ", error);
                setLoading(false);
                setShowEditModal(false);
                setEditConfirmed(false);
            });
        }).catch((error) => {
            if (error.name === "AbortError") {
                console.log("Request has cancelled: ", error.message);
            } else {
                console.log("Test updating error: ", error);
            }
            setLoading(false);
            controller.abort();
            setShowEditModal(false);
            setEditConfirmed(false);
        });
    };

    const handleDelete = (id) => {
        setLoading(true);
        axios.delete(`/tests/${id}`).then(() => {
            setTests(tests.filter((test) => test.id !== id));
            setTestsTable(testsTable.filter((test) => test.id !== id));
            setLoading(false);
        });
    };

    return (
        <div className='mt-4 mx-0 mx-md-3'>
            <div className='d-flex flex-wrap justify-content-between mb-4 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
            </div>

            <div className='table-responsive'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>Время доступа</th>
                            <th>Время на прохождение</th>
                            <th>Максимальный балл</th>
                            <th>Преподаватель</th>
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
                                <td className='d-flex flex-column justify-content-center gap-2'>
                                    <Button
                                        variant='success'
                                        onClick={() => handleShowAddModal(test)}
                                    >
                                        Начать
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div >
    );
};

export default Tests;