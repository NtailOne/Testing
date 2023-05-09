import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { Context } from '../../components/Context';
import ItemsList from './itemsList';

const AdminPage = () => {
    const { setAdminLogged } = useContext(Context);
    const [isMenuOpen, setIsMenuOpen] = useState(true);

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
                                <Nav.Link href='#'>Link 1</Nav.Link>
                                <Nav.Link href='#'>Link 2</Nav.Link>
                                <Nav.Link href='#'>Link 3</Nav.Link>
                            </Nav>
                        </Navbar>
                    </Col>
                    <Col md={10}>
                        <ItemsList />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminPage;