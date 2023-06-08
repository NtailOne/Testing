import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { Context } from '../components/Context';

import StudentTests from './studensForms/studTests';
import PassedTests from './studensForms/passedTests';

const StudentPage = () => {
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
        localStorage.removeItem('user');
        setAdminLogged(false);
        return confirmationMessage;
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        setAdminLogged(false);
    }

    useEffect(() => {
        window.addEventListener('beforeunload', (event) => handleUnload(event));
        return () => {
            window.removeEventListener('beforeunload', (event) => handleUnload(event));
        }
    }, []);

    let selectedComponent;
    if (selectedType === 'studentTests') {
        selectedComponent = <StudentTests />;
    } else if (selectedType === 'passedTests') {
        selectedComponent = <PassedTests />;
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
                                <Nav.Link className='orange-chalk no-pointer text-black mb-4'>Маслов Никита Сергеевич</Nav.Link>
                                <Nav.Link className={`green-chalk px-0 rounded ${selectedType === 'studentTests' ? 'active' : ''}`} onClick={() => setSelectedType('studentTests')}>Тесты</Nav.Link>
                                <Nav.Link className={`red-chalk px-0 rounded ${selectedType === 'passedTests' ? 'active' : ''}`} onClick={() => setSelectedType('passedTests')}>Пройденные</Nav.Link>
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

export default StudentPage;