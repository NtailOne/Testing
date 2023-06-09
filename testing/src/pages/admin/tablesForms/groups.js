import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import DeleteItemConfirmation from '../../../components/DeleteConfirmation';
import LoadingIndicator from '../../../components/LoadingIndicator';

const Groups = () => {
    const [groupsTable, setGroupsTable] = useState([]);
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const tableName = 'Группы';

    useEffect(() => {
        getCourses();
        getGroups();
        getGroupsForTable();
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredGroups = groupsTable.filter((group) => {
        const value = group.group_name;
        const term = searchTerm.toLowerCase();
        return value.toString().toLowerCase().includes(term);
    });

    const getGroupsForTable = () => {
        setLoading(true);
        axios.get(`/groups-table`).then((response) => {
            setGroupsTable(response.data);
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
            setLoading(false);
        });
    };

    const handleCourseChange = (event) => {
        setSelectedCourseId(event.target.value);
    };

    const handleModalCancel = () => {
        setSelectedCourseId(null);
        setShowAddModal(false);
        setShowEditModal(false);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleShowEditModal = (groupFromTable) => {
        const currGroup = groups.find(group => groupFromTable.id == group.id);
        setSelectedGroup(currGroup);
        setSelectedCourseId(currGroup.course_id);
        setShowEditModal(true);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const form = event.target;
        const body = {
            group_name: form.group_name.value,
            course_id: form.course.value
        };

        axios.post(`/groups`, body).then((response) => {
            setGroups([...groups, response.data]);
            getGroupsForTable();
            setLoading(false);
        });
        setShowAddModal(false);
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const form = event.target;
        const body = {
            group_name: form.group_name.value,
            course_id: form.course.value
        };

        axios.put(`/groups/${selectedGroup.id}`, body).then(() => {
            setGroups(
                groups.map((group) =>
                    group.id === selectedGroup.id ? { ...group, ...body } : group
                )
            );
            getGroupsForTable();
            setLoading(false);
        });
        setShowEditModal(false);
    };

    const handleDelete = (id) => {
        setLoading(true);
        axios.delete(`/groups/${id}`).then(() => {
            setGroupsTable(groupsTable.filter((group) => group.id !== id));
            setGroups(groups.filter((group) => group.id !== id));
            setLoading(false);
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

            {loading ? <LoadingIndicator /> : <div className='table-responsive'>
                <Table hover bordered className='bg-white text-black'>
                    <thead>
                        <tr>
                            <th>Группа</th>
                            <th>Курс</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.map((group) => (
                            <tr key={group.id}>
                                <td>{group.group_name}</td>
                                <td>{group.course_num}</td>
                                <td className='d-flex flex-wrap justify-content-end gap-2'>
                                    <Button
                                        variant='warning'
                                        onClick={() => handleShowEditModal(group)}
                                    >
                                        Редактировать
                                    </Button>
                                    <DeleteItemConfirmation
                                        onDelete={() => handleDelete(group.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}

            <Modal show={showAddModal} onHide={handleModalCancel}>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Добавить элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="group_name">
                            <Form.Label className='mb-1 mt-2'>Группа</Form.Label>
                            <Form.Control type="text" required placeholder="Введите название группы" />
                        </Form.Group>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalCancel}>
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
                        <Modal.Title>Редактировать элемент</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="group_name">
                            <Form.Label className='mb-1 mt-2'>Группа</Form.Label>
                            <Form.Control type="text" required defaultValue={selectedGroup.group_name} />
                        </Form.Group>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalCancel}>
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

export default Groups;