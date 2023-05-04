import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavbarElement = () => {
    return (
        <Navbar className="mb-5" bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="/home">React-Bootstrap</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/home">Home</Nav.Link>
                        <Nav.Link href="about">About</Nav.Link>
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="contact">Contact</NavDropdown.Item>
                            <NavDropdown.Item href="blogs">Blogs</NavDropdown.Item>
                            <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="quit">
                                Quit
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
export default NavbarElement;