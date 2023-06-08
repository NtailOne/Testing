import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { Context } from '../components/Context';

import Tests from './admin/tablesForms/tests';
import Topics from './admin/tablesForms/topics';
import Questions from './admin/tablesForms/questions';
import Statistics from './admin/tablesForms/statistics';

const TeacherPage = () => {
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
    if (selectedType === 'tests') {
        selectedComponent = <Tests />;
    } else if (selectedType === 'questions') {
        selectedComponent = <Questions />;
    } else if (selectedType === 'topics') {
        selectedComponent = <Topics />;
    } else if (selectedType === 'statistics') {
        selectedComponent = <Statistics />;
    }

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={2} className='admin-menu p-0'>
                        <Navbar expand='md' className='flex-column mt-4 px-3 px-md-0'>
                            <Button onClick={toggleMenu} className='d-md-none col-12 outline-dark bg-white text-dark text-bold mb-1'>
                                {isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                            </Button>
                            <Nav className={`col-12 flex-column mt-2 mt-md-0 gap-1 ${isMenuOpen ? '' : 'd-none d-md-block'}`}>
                                <Nav.Link className='yellow-chalk no-pointer text-black mb-4'>Мартыненко Анастасия Михайловна</Nav.Link>
                                <Nav.Link className={`blue-chalk px-0 rounded ${selectedType === 'tests' ? 'active' : ''}`} onClick={() => setSelectedType('tests')}>Тесты</Nav.Link>
                                <Nav.Link className={`green-chalk px-0 rounded ${selectedType === 'topics' ? 'active' : ''}`} onClick={() => setSelectedType('topics')}>Темы</Nav.Link>
                                <Nav.Link className={`purple-chalk px-0 rounded ${selectedType === 'questions' ? 'active' : ''}`} onClick={() => setSelectedType('questions')}>Вопросы</Nav.Link>
                                <Nav.Link className={`red-chalk px-0 rounded ${selectedType === 'statistics' ? 'active' : ''}`} onClick={() => setSelectedType('statistics')}>Статистика</Nav.Link>
                                <Nav.Link className='black-chalk px-0 rounded mt-4' onClick={handleLogout}>Выйти</Nav.Link>
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

export default TeacherPage;