import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import LoadingIndicator from '../../components/LoadingIndicator';
import StatisticsChart from '../../components/StatisticsChart';

const XLSX = require('xlsx');
const PassedTests = () => {
    const [loading, setLoading] = useState(false);
    const [searchCategory, setSearchCategory] = useState('student');
    const [timeFrom, setTimeFrom] = useState(null);
    const [timeTo, setTimeTo] = useState(null);
    const [bestAverageGrade, setBestAverageGrade] = useState(null);
    const [bestAverageTime, setBestAverageTime] = useState(null);

    const [roles, setRoles] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [tests, setTests] = useState([]);
    const [testsUsers, setTestsUsers] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState({});
    const [selectedCourse, setSelectedCourse] = useState({});
    const [selectedGroup, setSelectedGroup] = useState({});
    const [selectedTest, setSelectedTest] = useState({});

    const [filteredTable, setFilteredTable] = useState([]);

    const tableName = 'Пройденные тесты';

    const xAxisKey = 'Студент';
    const barKey = 'Балл';
    const chartData = filteredTable.map(row => (
        {
            [xAxisKey]: row.test_name,
            [barKey]: row.grade,
        }
    ));

    useEffect(() => {
        getStudents();
        getCourses();
        getGroups();
        getStatuses();
        getTests();
        getTestsUsers();
    }, []);

    const getStudents = () => {
        setLoading(true);
        axios.get(`/roles`).then((response) => {
            const data = response.data;
            const teacherRoleId = data.find(role => role.role_name == 'Преподаватель').id;
            const studentRoleId = data.find(role => role.role_name == 'Студент').id;
            setRoles({ teacher: teacherRoleId, student: studentRoleId });
            axios.get(`/users`).then((response) => {
                setStudents(response.data.filter(user => user.role_id == studentRoleId));
                setLoading(false);
            }).catch('Getting users error');
        }).catch('Getting roles error');
    };

    const getTests = () => {
        setLoading(true);
        axios.get(`/tests`).then((response) => {
            const currentTests = response.data.map(test => ({
                ...test,
                start_time: moment.utc(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment.utc(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            }));
            setTests(currentTests.filter(test => test.count_in_stats == 1));
            setLoading(false);
        }).catch('Getting tests error');
    };

    const getTestsUsers = () => {
        setLoading(true);
        axios.get(`/statuses`).then((response) => {
            const data = response.data;
            const notStartedId = data.find(status => status.status_name == 'Не начал').id;
            const startedId = data.find(status => status.status_name == 'Начал').id;
            const endedId = data.find(status => status.status_name == 'Завершил').id;
            setStatuses({ notStarted: notStartedId, started: startedId, ended: endedId });
            setLoading(false);
            axios.get(`/tests_users`).then((response) => {
                setTestsUsers(response.data.filter(testUser => testUser.status_id == endedId));
                setLoading(false);
            }).catch('Getting test users error');
        }).catch('Getting statuses error');
    };

    const getGroups = () => {
        setLoading(true);
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
            setLoading(false);
        }).catch('Getting groups error');
    };

    const getCourses = () => {
        setLoading(true);
        axios.get(`/courses`).then((response) => {
            setCourses(response.data);
            setLoading(false);
        }).catch('Getting courses error');
    };

    const getStatuses = () => {
        setLoading(true);

    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSearchCategory(value);
    };

    const handleCourseChange = (event) => {
        const value = event.target.value;
        setSelectedCourse(courses.find(course => course.id == value));
        const currentStudents = students.filter(student => student.course_id == value);
        const currentTestsUsers = testsUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id));
        setTableData(currentStudents, currentTestsUsers);
    };

    const handleGroupChange = (event) => {
        const value = event.target.value;
        setSelectedGroup(groups.find(group => group.id == value));
        const currentStudents = students.filter(student => student.group_id == value);
        const currentTestsUsers = testsUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id)
        );
        setTableData(currentStudents, currentTestsUsers);
    };

    const handleStudentChange = (event) => {
        const value = event.target.value;
        setSelectedStudent(students.find(student => student.id == value));
        const currentStudents = students.filter(student => student.id == value);
        const currentTestsUsers = testsUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id)
        );
        setTableData(currentStudents, currentTestsUsers);
    };

    const handleTestChange = (event) => {
        const value = event.target.value;
        const currentTest = tests.find(test => test.id == value);
        setSelectedTest(currentTest);
        const currentTestsUsers = testsUsers.filter(testUser => testUser.test_id == value);
        const currentStudents = students.filter(student => currentTestsUsers.some(testUser => testUser.user_id == student.id));
        setTableData(currentStudents, currentTestsUsers);
    };

    const setTableData = (currentStudents, currentTestsUsers) => {
        const currentTable = currentTestsUsers.map(testUser => {
            const currentStudent = currentStudents.find(student => student.id == testUser.user_id);
            const currentTest = tests.find(test => test.id == testUser.test_id);
            return {
                id: testUser.id,
                name: currentStudent.surname + ' ' + currentStudent.name + ' ' + currentStudent.patronymic,
                course_num: courses.find(course => course.id == currentStudent.course_id).course_num,
                group_name: groups.find(group => group.id == currentStudent.group_id).group_name,
                test_name: currentTest.test_name,
                grade: testUser.grade,
                start_time: currentTest.start_time.slice(0, 10),
                time_spent: testUser.time_spent
            }
        });
        setFilteredTable(currentTable);
        const bestAvGrade = currentStudents.forEach(student => { });
        const bestAvTime = currentTable.forEach(row => { });
        setBestAverageGrade(bestAvGrade);
        setBestAverageTime(bestAvTime);
    };

    const handleExportToCsv = () => {
        const jsonData = filteredTable.map((item) => ({
            'Название теста': item.test_name,
            'ФИО студента': item.name,
            'Курс': item.course_num,
            'Группа': item.group_name,
            'Оценка': item.grade,
            'Дата прохождения': item.start_time,
            'Время на прохождение, мин': item.time_spent
        }));

        const wscols = [
            { wch: 30 },
            { wch: 30 },
            { wch: 10 },
            { wch: 15 },
            { wch: 10 },
            { wch: 20 },
            { wch: 25 }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(jsonData);
        ws['!cols'] = wscols;
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const fileName = `${jsonData['ФИО студента']}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className='mt-4 mx-0 mx-md-3'>
            <div className='d-flex flex-column flex-wrap justify-content-between mb-5 gap-4'>
                <div className='d-flex flex-wrap gap-5'>
                    <h1 className='text-white'>{tableName}</h1>
                    <Button variant='success' onClick={handleExportToCsv}>
                        Скачать CSV
                    </Button>
                </div>
                <div className='d-flex flex-wrap align-items-center col-12'>
                    <div className='d-none flex-wrap gap-4 col-12 mb-4'>
                        <Form.Select className='search-bar col-auto'
                            value={searchCategory || 'course'}
                            onChange={handleCategoryChange}
                        >
                            <option value='course'>По курсу</option>
                            <option value='group'>По группе</option>
                            <option value='student'>По студенту</option>
                            <option value='test'>По тесту</option>
                        </Form.Select>
                        {searchCategory === 'course' ? <Form.Select className='pointer col'
                            required
                            value={selectedCourse ? selectedCourse.id : ''}
                            onChange={handleCourseChange}>
                            <option disabled value=''>
                                Выберите курс
                            </option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.course_num}
                                </option>
                            ))}
                        </Form.Select> : ''}
                        {searchCategory === 'group' ? <Form.Select className='pointer col'
                            required
                            value={selectedGroup ? selectedGroup.id : ''}
                            onChange={handleGroupChange}>
                            <option disabled value=''>
                                Выберите группу
                            </option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {courses.find(course => course.id === group.course_id).course_num + " курс " + group.group_name}
                                </option>
                            ))}
                        </Form.Select> : ''}
                        {searchCategory === 'student' ? <Form.Select className='pointer col'
                            required
                            value={selectedStudent ? selectedStudent.id : ''}
                            onChange={handleStudentChange}>
                            <option disabled value=''>
                                Выберите студента
                            </option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.surname + " " + student.name + " " + student.patronymic}
                                </option>
                            ))}
                        </Form.Select> : ''}
                        {searchCategory === 'test' ? <Form.Select className='pointer col'
                            required
                            value={selectedTest ? selectedTest.id : ''}
                            onChange={handleTestChange}>
                            <option disabled value=''>
                                Выберите тест
                            </option>
                            {tests.map((test) => (
                                <option key={test.id} value={test.id}>
                                    {test.test_name}
                                </option>
                            ))}
                        </Form.Select> : ''}
                    </div>
                    <div className='d-flex flex-wrap gap-4 col-12'>
                        <Form.Group className='d-flex align-items-center col-12 col-sm' controlId='time_from'>
                            <Form.Label className='text-white my-0 me-3 text-bold text-large'>С</Form.Label>
                            <Form.Control type='datetime-local' name='time_from' required />
                        </Form.Group>
                        <Form.Group className='d-flex align-items-center col-12 col-sm' controlId='time_to'>
                            <Form.Label className='text-white my-0 me-3 text-bold text-large'>По</Form.Label>
                            <Form.Control type='datetime-local' name='time_to' required />
                        </Form.Group>
                    </div>
                </div>
            </div>

            {loading ? <LoadingIndicator /> : <div className='table-responsive mb-4'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Название теста</th>
                            <th>Оценка</th>
                            <th>Дата прохождения</th>
                            <th>Время на прохождение, мин</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTable.map((row) => (
                            <tr key={row.id}>
                                <td>{row.test_name}</td>
                                <td>{row.grade}</td>
                                <td>{row.start_time}</td>
                                <td>{row.time_spent}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}

            <div className='d-flex flex-wrap gap-5 text-white mb-4'>
                <h3>Средний балл: 4.44{bestAverageGrade}</h3>
                <h3>Среднее время прохождения: 00:02:10{bestAverageGrade}</h3>
            </div>

            <div className='mb-4 table-responsive'>
                <StatisticsChart data={chartData} xAxisKey={xAxisKey} barKey={barKey} />
            </div>
        </div>
    );
}

export default PassedTests;
