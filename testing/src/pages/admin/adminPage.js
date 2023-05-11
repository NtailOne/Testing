import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { Context } from '../../components/Context';

import Users from './tablesForms/users';
import Groups from './tablesForms/groups';
import Topics from './tablesForms/topics';
import Questions from './tablesForms/questions';
import Tests from './tablesForms/tests';

const AdminPage = () => {
    const { setAdminLogged } = useContext(Context);
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [selectedType, setSelectedType] = useState('users');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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

    useEffect(() => {
        window.addEventListener('beforeunload', (event) => handleUnload(event));
        return () => {
            window.removeEventListener('beforeunload', (event) => handleUnload(event));
        }
    }, []);

    let selectedComponent;
    if (selectedType === 'users') {
      selectedComponent = <Users/>;
    } else if (selectedType === 'groups') {
      selectedComponent = <Groups />;
    } else if (selectedType === 'topics') {
      selectedComponent = <Topics />;
    } else if (selectedType === 'questions') {
      selectedComponent = <Questions />;
    } else if (selectedType === 'tests') {
      selectedComponent = <Tests />;
    }

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={2} className='admin-menu p-0'>
                        <Navbar expand='md' className='flex-column pt-4'>
                            <Button variant='outline-dark' onClick={toggleMenu} className='d-md-none'>
                                {isMenuOpen ? 'Close' : 'Menu'}
                            </Button>
                            <Nav className={`w-100 flex-column mt-2 mt-md-0 ${isMenuOpen ? '' : 'd-none'}`}>
                                <Nav.Link className={`red-chalk ${selectedType === 'users' ? 'active' : ''}`} onClick={() => setSelectedType('users')}>Пользователи</Nav.Link>
                                <Nav.Link className={`orange-chalk ${selectedType === 'groups' ? 'active' : ''}`} onClick={() => setSelectedType('groups')}>Группы</Nav.Link>
                                <Nav.Link className={`yellow-chalk ${selectedType === 'topics' ? 'active' : ''}`} onClick={() => setSelectedType('topics')}>Темы</Nav.Link>
                                <Nav.Link className={`green-chalk ${selectedType === 'questions' ? 'active' : ''}`} onClick={() => setSelectedType('questions')}>Вопросы</Nav.Link>
                                <Nav.Link className={`blue-chalk ${selectedType === 'tests' ? 'active' : ''}`} onClick={() => setSelectedType('tests')}>Тесты</Nav.Link>
                                <Nav.Link className='black-chalk mt-4' onClick={handleLogout}>Выйти</Nav.Link>
                            </Nav>
                        </Navbar>
                    </Col>
                    <Col md={10}>
                        {selectedComponent}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminPage;