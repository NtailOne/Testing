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

    const [filteredStudents, setFilteredStudents] = useState([]);

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

    const tableName = 'Статистика';

    const chartData = tests.map(test => ({ name: test.test_name, value: test.max_grade }));
    const xAxisKey = 'Название';
    const barKey = 'Макс. балл';

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
            setTests(response.data.map(test => ({
                ...test,
                start_time: moment.utc(test.start_time).format('DD.MM.YYYY HH:mm:ss'),
                end_time: moment.utc(test.end_time).format('DD.MM.YYYY HH:mm:ss')
            })));
            setLoading(false);
        }).catch('Getting tests error');
    };

    const getTestUsersIds = (testId) => {
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
        setSelectedCourse(courses.find(course => course.id === value));
    };

    const handleGroupChange = (event) => {
        const value = event.target.value;
        setSelectedGroup(groups.find(group => group.id === value));
    };

    const handleStudentChange = (event) => {
        const value = event.target.value;
        setSelectedStudent(students.find(student => student.id === value));
    };

    const handleTestChange = (event) => {
        const value = event.target.value;
        setSelectedTest(tests.find(test => test.id === value));
    };

    const handleExportToCsv = () => {

    };

    return (
        <div className='mt-4 mx-0 mx-md-3'>
            <div className='d-flex flex-column flex-wrap justify-content-between mb-5 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
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
                            value={selectedCourse.id || ''}
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
                            value={selectedGroup.id || ''}
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
                            value={selectedStudent.id || ''}
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
                            value={selectedTest.id || ''}
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
                            <th>ФИО студента</th>
                            <th>Группа</th>
                            <th>Курс</th>
                            <th>Название теста</th>
                            <th>Оценка</th>
                            <th>Дата прохождения</th>
                            <th>Время на прохождение, мин</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{`${student.surname} ${student.name} ${student.patronymic}`}</td>
                                <td>{student.group_name}</td>
                                <td>{student.course_num}</td>
                                <td>{student.test_name}</td>
                                <td>{student.grade}</td>
                                <td>{moment(student.date).format('YYYY-MM-DD')}</td>
                                <td>{student.time_spent}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}

            <div className='text-white mb-4'>
                <p>Лучший средний балл</p>
                <p>Лучший балл</p>
            </div>

            <div className='mb-4 table-responsive'>
                <StatisticsChart data={chartData} xAxisKey={xAxisKey} barKey={barKey} />
            </div>

            <div>
                <Button variant='success' onClick={handleExportToCsv}>
                    Скачать CSV
                </Button>
            </div>
        </div>
    );
}

export default Statistics;
