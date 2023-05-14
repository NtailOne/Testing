import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Users = () => {
    const [usersTable, setUsersTable] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);

    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
    let tableName = 'Пользователи';

    useEffect(() => {
        axios.get(`/users-table`).then((response) => {
            setUsersTable(response.data);
        });
        axios.get(`/users`).then((response) => {
            setUsers(response.data);
        });
        axios.get(`/roles`).then((response) => {
            setRoles(response.data);
        });
        axios.get(`/courses`).then((response) => {
            setCourses(response.data);
        });
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
        });
    }, []);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRoleChange = (event) => {
        setSelectedRoleId(event.target.value);
    }

    const handleCourseChange = (event) => {
        setSelectedCourseId(event.target.value);
        setFilteredGroups(groups.filter((group) => group.course_id == event.target.value));
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (userFromTable) => {
        const currUser = users.find(user => userFromTable.id == user.id);
        if (currUser !== undefined) {
            setSelectedUser(currUser);
            setSelectedRoleId(currUser.role_id);
            setSelectedCourseId(currUser.course_id);
            setFilteredGroups(groups.filter((group) => group.course_id == currUser.course_id));
            setShowEditModal(true);
        } else {
            console.error(`User with id ${userFromTable.id} not found`);
        }
    };

    const handleModalCancel = () => {
        setSelectedRoleId(null);
        setSelectedCourseId(null);
        setShowAddModal(false);
        setShowEditModal(false);
    }

    const handleDelete = (id) => {
        axios.delete(`/users/${id}`).then(() => {
            setUsers(users.filter((user) => user.id !== id));
        });
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            email: form.email.value,
            password: form.password.value,
            surname: form.surname.value,
            name: form.name.value,
            patronymic: form.patronymic.value,
            role_id: form.role.value,
            course_id: form.course.value === "" ? null : form.course.value,
            group_id: form.group.value === "" ? null : form.group.value
        };

        if (password_pattern.test(form.password.value)) {
            axios.post(`/users`, body).then((response) => {
                setUsers([...users, response.data]);
                setShowAddModal(false);
            });
        } else {
            alert(`Неверный пароль.
            \nДлина пароля должна быть не меньше 8 символов.
            \nПароль должен содержать только латинские символы, а также минимум одну строчную, одну заглавную букву и одну цифру.`);
        }
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            email: form.email.value,
            password: form.password.value,
            surname: form.surname.value,
            name: form.name.value,
            patronymic: form.patronymic.value,
            role_id: form.role.value,
            course_id: form.course.value === "" ? null : form.course.value,
            group_id: form.group.value === "" ? null : form.group.value
        };

        axios.put(`/users/${selectedUser.id}`, body).then(() => {
            setUsers(
                users.map((user) =>
                    user.id === selectedUser.id ? { ...user, ...body } : user
                )
            );
            setShowEditModal(false);
        });
    };

    return (
        <div className="pt-4 mx-0 mx-md-3">
            <div className='d-flex justify-content-between mb-4'>
                <h1>{tableName}</h1>

                <Button className='col-auto col-md-2' variant="primary" onClick={handleShowAddModal}>
                    Добавить
                </Button>
            </div>

            <div className='table-responsive'>
                <Table bordered hover className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Роль</th>
                            <th>ФИО</th>
                            <th>Электронная почта</th>
                            <th>Курс</th>
                            <th>Группа</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersTable.map((user) => (
                            <tr key={user.id}>
                                <td>{user.role_name}</td>
                                <td>{user.surname} {user.name} {user.patronymic}</td>
                                <td>{user.email}</td>
                                <td>{user.course_num}</td>
                                <td>{user.group_name}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(user)}
                                    >
                                        Редактировать
                                    </Button>{' '}
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showAddModal} onHide={handleModalCancel}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить пользователя</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="email">
                            <Form.Label className='mb-1 mt-2'>Электронная почта</Form.Label>
                            <Form.Control type="email" required placeholder="Введите email" />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label className='mb-1 mt-2'>Пароль</Form.Label>
                            <Form.Control
                                type={passwordVisible ? 'text' : 'password'}
                                required
                                placeholder="Введите пароль"
                            />
                            <Form.Text onClick={togglePasswordVisibility} className='d-block text-right pointer'>
                                {passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="surname">
                            <Form.Label className='mb-1'>Фамилия</Form.Label>
                            <Form.Control type="text" required placeholder="Введите фамилию" />
                        </Form.Group>
                        <Form.Group controlId="name">
                            <Form.Label className='mb-1 mt-2'>Имя</Form.Label>
                            <Form.Control type="text" required placeholder="Введите имя" />
                        </Form.Group>
                        <Form.Group controlId="patronymic">
                            <Form.Label className='mb-1 mt-2'>Отчество</Form.Label>
                            <Form.Control type="text" required placeholder="Введите отчество" />
                        </Form.Group>
                        <Form.Group controlId="role">
                            <Form.Label className='mb-1 mt-2'>Роль</Form.Label>
                            <Form.Control as="select" className='pointer' required value={selectedRoleId || ""} onChange={handleRoleChange}>
                                <option disabled value="">
                                    Выберите роль
                                </option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        {selectedRoleId == 1 && (
                            <>
                                <Form.Group controlId="course">
                                    <Form.Label className='mb-1 mt-2'>Курс</Form.Label>
                                    <Form.Control as="select" className='pointer' required value={selectedCourseId || ""} onChange={handleCourseChange}>
                                        <option disabled value="">
                                            Выберите курс
                                        </option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_num}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="group">
                                    <Form.Label className='mb-1 mt-2'>Группа</Form.Label>
                                    <Form.Control as="select" className='pointer' required defaultValue="">
                                        <option disabled value="">
                                            Выберите группу
                                        </option>
                                        {filteredGroups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.group_name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                            onClick={handleModalCancel}>
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
                        <Modal.Title>Редактировать пользователя</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="email">
                            <Form.Label className='mb-1 mt-2'>Электронная почта</Form.Label>
                            <Form.Control type="email" defaultValue={selectedUser.email} required placeholder="Введите email" />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label className='mb-1 mt-2'>Пароль</Form.Label>
                            <Form.Control type={passwordVisible ? 'text' : 'password'} defaultValue={selectedUser.password} required placeholder="Введите пароль"
                            />
                            <Form.Text onClick={togglePasswordVisibility} className='d-block text-right pointer'>
                                {passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="surname">
                            <Form.Label className='mb-1'>Фамилия</Form.Label>
                            <Form.Control type="text" defaultValue={selectedUser.surname} required placeholder="Введите фамилию" />
                        </Form.Group>
                        <Form.Group controlId="name">
                            <Form.Label className='mb-1 mt-2'>Имя</Form.Label>
                            <Form.Control type="text" defaultValue={selectedUser.name} required placeholder="Введите имя" />
                        </Form.Group>
                        <Form.Group controlId="patronymic">
                            <Form.Label className='mb-1 mt-2'>Отчество</Form.Label>
                            <Form.Control type="text" defaultValue={selectedUser.patronymic} required placeholder="Введите отчество" />
                        </Form.Group>
                        <Form.Group controlId="role">
                            <Form.Label className='mb-1 mt-2'>Роль</Form.Label>
                            <Form.Control as="select" className='pointer' required value={selectedRoleId || ""} onChange={handleRoleChange}>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        {selectedRoleId == 1 && (
                            <>
                                <Form.Group controlId="course">
                                    <Form.Label className='mb-1 mt-2'>Курс</Form.Label>
                                    <Form.Control as="select" className='pointer' required value={selectedCourseId || ""} onChange={handleCourseChange}>
                                        <option disabled value="">
                                            Выберите курс
                                        </option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_num}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="group">
                                    <Form.Label className='mb-1 mt-2'>Группа</Form.Label>
                                    <Form.Control as="select" className='pointer' required defaultValue={selectedUser.group || ""}>
                                        <option disabled value="">
                                            Выберите группу
                                        </option>
                                        {filteredGroups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.group_name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                            onClick={handleModalCancel}>
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

export default Users;