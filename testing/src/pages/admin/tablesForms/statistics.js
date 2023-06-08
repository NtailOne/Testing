import React, { useState, useEffect } from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StatisticsChart from '../../../components/StatisticsChart';

const Statistics = () => {
    const [loading, setLoading] = useState(false);
    const [searchCategory, setSearchCategory] = useState('course');
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
    const [testUsers, setTestUsers] = useState([]);
    
    const [selectedStudent, setSelectedStudent] = useState({});
    const [selectedCourse, setSelectedCourse] = useState({});
    const [selectedGroup, setSelectedGroup] = useState({});
    const [selectedTest, setSelectedTest] = useState({});
    
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [filteredTestUsers, setFilteredTestUsers] = useState([]);
    const [filteredTable, setFilteredTable] = useState([]);

    const tableName = 'Статистика';

    const xAxisKey = 'Название';
    const barKey = 'Макс.балл';
    const chartData = tests.map(test => ({ [xAxisKey]: test.test_name, [barKey]: test.max_score }));
    // const chartsData = filteredStudents.map(student => ({ [xAxisKey]: test.test_name, [barKey]: test.max_score }));

    useEffect(() => {
        getStudents();
        getCourses();
        getGroups();
        getStatuses();
        getTests();
    }, []);

    const getStudents = () => {
        setLoading(true);
        axios.get(`/roles`).then((response) => {
            const data = response.data;
            const teacherRoleId = data.find(role => role.role_name === 'Преподаватель').id;
            const studentRoleId = data.find(role => role.role_name === 'Студент').id;
            setRoles({ teacher: teacherRoleId, student: studentRoleId });
            axios.get(`/users`).then((response) => {
                setStudents(response.data.filter(user => user.role_id === studentRoleId));
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

    const getTestUsers = (testId) => {
        setLoading(true);
        axios.get(`/test_users/full/${testId}`).then((response) => {
            setTestUsers(response.data);
            setLoading(false);
        }).catch('Getting test users error');
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
        axios.get(`/statuses`).then((response) => {
            setStatuses(response.data);
            setLoading(false);
        }).catch('Getting statuses error');
    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSearchCategory(value);
    };

    const handleCourseChange = (event) => {
        const value = event.target.value;
        setSelectedCourse(courses.find(course => course.id == value));
        const currentStudents = students.filter(student => student.course_id == value);
        setFilteredStudents(currentStudents);
        setFilteredTestUsers(testUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id)
        ));
        const currentTable = currentStudents.map(student => ({
            id: student.id,
            name: student.surname + ' ' + student.name + ' ' + student.patronymic,
            course_num: courses.find(course => course.id == student.course_id).course_num,
            group_name: groups.find(group => group.id == student.group_id).group_name,
            test_name: 'ffffffffffff ffffff fffffffffffffffff fffff  faasfffffffffffffffffff asd',
            grade: 5,
            start_time: '24.06.2023',
            time_spent: '00:01:00'
        }));
        console.log(currentTable)
        setFilteredTable(currentTable);
    };

    const handleGroupChange = (event) => {
        const value = event.target.value;
        setSelectedGroup(groups.find(group => group.id == value));
        const currentStudents = students.filter(student => student.group_id == value);
        setFilteredStudents(currentStudents);
        setFilteredTestUsers(testUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id)
        ));
        const currentTable = '';
        setFilteredTable(currentTable);
    };

    const handleStudentChange = (event) => {
        const value = event.target.value;
        setSelectedStudent(students.find(student => student.id == value));
        const currentStudents = students.filter(student => student.id == value);
        setFilteredStudents(currentStudents);
        setFilteredTestUsers(testUsers.filter(testUser =>
            currentStudents.some(currentStudent => currentStudent.id == testUser.user_id)
        ));
        const currentTable = '';
        setFilteredTable(currentTable);
    };

    const handleTestChange = (event) => {
        const value = event.target.value;
        const currentTest = tests.find(test => test.id == value);
        setSelectedTest(currentTest);
        getTestUsers(currentTest.id);
        const currentTestUsers = testUsers.filter(testUser => testUser.test_id == value);
        setFilteredTestUsers(currentTestUsers);
        setFilteredStudents(students.filter(student => currentTestUsers.some(testUser => testUser.user_id == student.id)));
        const currentTable = '';
        setFilteredTable(currentTable);
    };

    const handleExportToCsv = () => {

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
                    <div className='d-flex flex-wrap gap-4 col-12 mb-4'>
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
                            <th>ФИО студента</th>
                            <th>Курс</th>
                            <th>Группа</th>
                            <th>Оценка</th>
                            <th>Дата прохождения</th>
                            <th>Время на прохождение, мин</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTable.map((row) => (
                            <tr key={row.id}>
                                <td>{row.test_name}</td>
                                <td>{row.name}</td>
                                <td>{row.course_num}</td>
                                <td>{row.group_name}</td>
                                <td>{row.grade}</td>
                                <td>{moment(row.start_time).format('DD.MM.YYYY')}</td>
                                <td>{row.time_spent}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}

            <div className='text-white mb-4'>
                <p>Лучший средний балл</p>
                <p>Лучшее среднее время прохождения</p>
            </div>

            <div className='mb-4 table-responsive'>
                <StatisticsChart data={chartData} xAxisKey={xAxisKey} barKey={barKey} />
            </div>
        </div>
    );
}

export default Statistics;
