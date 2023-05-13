import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Questions = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    let tableName = 'Вопросы';

    useEffect(() => {
        axios.get(`/questions`).then((response) => {
            setItems(response.data);
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
        axios.delete(`/questions/${id}`).then(() => {
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

        axios.post(`/questions`, body).then((response) => {
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

        axios.put(`/questions/${selectedItem.id}`, body).then(() => {
            setItems(
                items.map((item) =>
                    item.id === selectedItem.id ? { ...item, ...body } : item
                )
            );
            setShowEditModal(false);
        });
    };

    return (
        <div className="container pt-4">
            <div className='d-flex justify-content-between mb-4'>
                <h1>{tableName}</h1>

                <Button className='col-2' variant="primary" onClick={handleShowAddModal}>
                    Добавить
                </Button>
            </div>

            <div className='table-responsive'>
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
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.topic_name}</td>
                                <td>{item.body}</td>
                                <td>{item.description}</td>
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
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="title">
                            <Form.Label>Название</Form.Label>
                            <Form.Control type="text" placeholder="Введите название" />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label>Описание</Form.Label>
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

export default Questions;