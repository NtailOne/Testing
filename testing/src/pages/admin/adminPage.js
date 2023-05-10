import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Context } from '../../components/Context';
import ItemsList from './itemsList';

const AdminPage = () => {
    const { setAdminLogged } = useContext(Context);
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [selectedType, setSelectedType] = useState('users');

    const toggleMenu = () => {
        console.log('CHANGED')
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
      selectedComponent = <ItemsList type='users' />;
    } else if (selectedType === 'courses') {
      selectedComponent = <ItemsList type='courses' />;
    } else if (selectedType === 'groups') {
      selectedComponent = <ItemsList type='groups' />;
    } else if (selectedType === 'topics') {
      selectedComponent = <ItemsList type='topics' />;
    } else if (selectedType === 'questions') {
      selectedComponent = <ItemsList type='questions' />;
    } else if (selectedType === 'tests') {
      selectedComponent = <ItemsList type='tests' />;
    }

    return (
        <div>
            <Button className='text-uppercase' variant='danger' onClick={handleLogout}>
                выйти
            </Button>
            <Container fluid>
                <Row>
                    <Col md={2}>
                        <Navbar bg='light' expand='md' className='flex-column'>
                            <Button variant='outline-dark' onClick={toggleMenu} className='d-md-none'>
                                {isMenuOpen ? 'Close' : 'Menu'}
                            </Button>
                            <Nav className={`flex-column mt-2 mt-md-0 ${isMenuOpen ? '' : 'd-none'}`}>
                                <Nav.Link className={selectedType === 'users' ? 'active' : ''} onClick={() => setSelectedType('users')}>Пользователи</Nav.Link>
                                <Nav.Link className={selectedType === 'courses' ? 'active' : ''} onClick={() => setSelectedType('courses')}>Курсы</Nav.Link>
                                <Nav.Link className={selectedType === 'groups' ? 'active' : ''} onClick={() => setSelectedType('groups')}>Группы</Nav.Link>
                                <Nav.Link className={selectedType === 'topics' ? 'active' : ''} onClick={() => setSelectedType('topics')}>Темы</Nav.Link>
                                <Nav.Link className={selectedType === 'questions' ? 'active' : ''} onClick={() => setSelectedType('questions')}>Вопросы</Nav.Link>
                                <Nav.Link className={selectedType === 'tests' ? 'active' : ''} onClick={() => setSelectedType('tests')}>Тесты</Nav.Link>
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