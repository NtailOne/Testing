import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Users = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");

    let tableName = 'Пользователи';

    useEffect(() => {
        axios.get(`/users`).then((response) => {
            setItems(response.data);
        });
        axios.get(`/roles`).then((response) => {
            setRoles(response.data);
        });
        axios.get(`/groups`).then((response) => {
            setGroups(response.data);
            setCourses(uniqueCourseNames);
        });
    }, []);

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        axios.delete(`/users/${id}`).then(() => {
            setItems(items.filter((item) => item.id !== id));
        });
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();

        const form = event.target;
        const body = {
            title: form.title.value,
            description: form.description.value,
        };

        axios.post(`/users`, body).then((response) => {
            setItems([...items, response.data]);
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

        axios.put(`/users/${selectedItem.id}`, body).then(() => {
            setItems(
                items.map((item) =>
                    item.id === selectedItem.id ? { ...item, ...body } : item
                )
            );
            setShowEditModal(false);
        });
    };

    const handleModalCancel = () => {
        setSelectedRoleId("");
        setSelectedCourse("");
        setShowAddModal(false);
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRoleChange = (event) => {
        setSelectedRoleId(event.target.value);
    }

    const handleCourseChange = (event) => {
        const selectedCourse = event.target.value;
        setSelectedCourse(selectedCourse);
        setFilteredGroups(groups.filter((group) => group.course_num == selectedCourse));
    };

    const uniqueCourseNames = groups.reduce((acc, curr) => {
        if (!acc.includes(curr.course_num)) {
            acc.push(curr.course_num);
        }
        return acc;
    }, []);

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
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.role_name}</td>
                                <td>{item.surname} {item.name} {item.patronymic}</td>
                                <td>{item.email}</td>
                                <td>{item.course_num}</td>
                                <td>{item.group_name}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(item)}
                                    >
                                        Редактировать
                                    </Button>{' '}
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить пользователя</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="email">
                            <Form.Label className='mb-1 mt-2'>Электронная почта</Form.Label>
                            <Form.Control type="email" placeholder="Введите email" />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label className='mb-1 mt-2'>Пароль</Form.Label>
                            <Form.Control
                                type={passwordVisible ? 'text' : 'password'}
                                placeholder="Введите пароль"
                            />
                            <Form.Text onClick={togglePasswordVisibility} className='d-block text-right'>
                                {passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="surname">
                            <Form.Label className='mb-1'>Фамилия</Form.Label>
                            <Form.Control type="text" placeholder="Введите фамилию" />
                        </Form.Group>
                        <Form.Group controlId="name">
                            <Form.Label className='mb-1 mt-2'>Имя</Form.Label>
                            <Form.Control type="text" placeholder="Введите имя" />
                        </Form.Group>
                        <Form.Group controlId="patronymic">
                            <Form.Label className='mb-1 mt-2'>Отчество</Form.Label>
                            <Form.Control type="text" placeholder="Введите отчество" />
                        </Form.Group>
                        <Form.Group controlId="role">
                            <Form.Label className='mb-1 mt-2'>Роль</Form.Label>
                            <Form.Control as="select" required value={selectedRoleId} onChange={handleRoleChange}>
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
                        {selectedRoleId === '1' && (
                            <>
                                <Form.Group controlId="course">
                                    <Form.Label className='mb-1 mt-2'>Курс</Form.Label>
                                    <Form.Control as="select" required value={selectedCourse} onChange={handleCourseChange}>
                                        <option disabled value="">
                                            Выберите курс
                                        </option>
                                        {courses.map((course) => (
                                            <option key={courses.indexOf(course)} value={course}>
                                                {course}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="group">
                                    <Form.Label className='mb-1 mt-2'>Группа</Form.Label>
                                    <Form.Control as="select" required defaultValue="">
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
                            onClick={() => { handleModalCancel() }}>
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
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={selectedItem.title}
                            />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={selectedItem.description}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                            onClick={() => { handleModalCancel() }}>
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