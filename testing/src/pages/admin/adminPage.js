import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Context } from '../../components/Context';

const AdminPage = () => {
    const { serverURL, setAdminLogged } = useContext(Context);

    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeunload', (event) => handleUnload(event));

        axios.get('/api/items').then((response) => {
            setItems(response.data);
        });

        return () => {
            window.removeEventListener('beforeunload', (event) => handleUnload(event));
        }
    }, []);

    const handleUnload = (event) => {
        event.preventDefault();
        const confirmationMessage = 'Вы уверены, что хотите выйти? Вы будете деавторизированы.';
        event.returnValue = confirmationMessage;
        localStorage.removeItem('adminLogged');
        setAdminLogged(false);
        return confirmationMessage;
    }

    const handleLogout = () => {
        localStorage.removeItem('adminLogged');
        setAdminLogged(false);
    }

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        axios.delete(`/api/items/${id}`).then(() => {
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

        axios.post('/api/items', body).then((response) => {
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

        axios.put(`/api/items/${selectedItem.id}`, body).then(() => {
            setItems(
                items.map((item) =>
                    item.id === selectedItem.id ? { ...item, ...body } : item
                )
            );
            setShowEditModal(false);
        });
    };

    return (
        <div className="container">
            <Button variant="primary" onClick={handleShowAddModal}>
                Добавить
            </Button>
            <Button variant="danger" onClick={handleLogout}>
                ВЫЙТИ
            </Button>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.description}</td>
                            <td>
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

export default AdminPage;