import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Tests = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    let tableName = 'Тесты';

    useEffect(() => {
        axios.get(`/tests`).then((response) => {
            setItems(response.data);
        });
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        axios.delete(`/tests/${id}`).then(() => {
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

        axios.post(`/tests`, body).then((response) => {
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

        axios.put(`/tests/${selectedItem.id}`, body).then(() => {
            setItems(
                items.map((item) =>
                    item.id === selectedItem.id ? { ...item, ...body } : item
                )
            );
            setShowEditModal(false);
        });
    };

    return (
        <div className="mt-4 mx-0 mx-md-3">
            <div className='d-flex flex-wrap justify-content-between mb-4 gap-4'>
                <h1 className='text-white'>{tableName}</h1>
                <div className='d-flex flex-wrap gap-2 col-12 col-md-auto'>
                    <Form.Control
                        className='search-bar'
                        type='text'
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder='Поиск'
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
                            <th>Название</th>
                            <th>Время доступа</th>
                            <th>Курс</th>
                            <th>Группа</th>
                            <th>Студент</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.test_name}</td>
                                <td>{item.start_time} - {item.end_time}</td>
                                <td>{item.course_num}</td>
                                <td>{item.group_name}</td>
                                <td>{item.student_name}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleShowEditModal(item)}
                                    >
                                        Редактировать
                                    </Button>
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
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="title">
                            <Form.Label className='mb-1 mt-2'>Название</Form.Label>
                            <Form.Control type="text" placeholder="Введите название" />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label className='mb-1 mt-2'>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Введите описание"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
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
                            <Form.Label className='mb-1 mt-2'>Название</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={selectedItem.title}
                            />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label className='mb-1 mt-2'>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={selectedItem.description}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
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

export default Tests;