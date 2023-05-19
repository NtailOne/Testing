import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { Context } from '../../components/Context';

const AdminLoginForm = () => {
    const { serverURL, adminLogged, setAdminLogged } = useContext(Context);

    const [values, setValues] = useState({
        login: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({
            ...prev,
            [event.target.name]: [event.target.value]
        }));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(serverURL + 'admin-login', values)
            .then(res => {
                if (res.data === 'Success') {
                    setAdminLogged(!adminLogged);
                    localStorage.setItem('adminLogged', true);
                    navigate('/admin');
                }
                else alert('Аккаунт не найден');
            })
            .catch(err => console.log(err));
    }

    return (
        <div className='row justify-content-center mx-0 login admin'>
            <Form className='col-md-6 col-11' onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='formBasicEmail'>
                    <Form.Label className='text-white'>Логин</Form.Label>
                    <Form.Control type='login' name='login' onChange={handleInput} placeholder='Введите логин' />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formBasicPassword'>
                    <Form.Label className='text-white'>Пароль</Form.Label>
                    <Form.Control type='password' name='password' onChange={handleInput} placeholder='Пароль' />
                </Form.Group>
                <Button className='col-12 button' variant='primary' type='submit'>Войти</Button>
            </Form>
        </div>
    );
};
export default AdminLoginForm;