import React, { useState } from 'react';
import { Form, Button, Table, Row } from 'react-bootstrap';
import moment from 'moment';

function Statistics() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadStudentsData = () => {
    // загрузка данных студентов из API
  };

  const handleExportToCsv = () => {
    // экспорт данных в CSV
  };

  return (
    <div style={{ padding: '20px' }}>
      <Form>
        <Row>
          <div style={{ marginRight: '20px' }}>
            <Form.Label>Выберите студента:</Form.Label>
            <Form.Control as="select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Все студенты</option>
              <option value="student1">Студент 1</option>
              <option value="student2">Студент 2</option>
              <option value="student3">Студент 3</option>
            </Form.Control>
          </div>
          <div style={{ marginRight: '20px' }}>
            <Form.Label>Выберите период:</Form.Label>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span style={{ margin: '0 10px' }}>—</span>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <Button variant="primary" className="mr-3" onClick={loadStudentsData}>Фильтр</Button>
            <Button variant="success" onClick={handleExportToCsv}>Экспорт в CSV</Button>
          </div>
        </Row>
      </Form>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>ID</th>
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
          {students.map((student) => (
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
    </div>
  );
}

export default Statistics;
