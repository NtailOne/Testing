import React, { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from '../components/Context';

const LoginForm = () => {
    const { serverURL } = useContext(Context);

    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    function Validation(valuesToValidate) {
        let error = {};
        const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

        if (valuesToValidate.email === "") {
            error.email = "Поле email не должно быть пустым";
        } else if (!email_pattern.test(valuesToValidate.email)) {
            error.email = "Неправильная почта";
        } else {
            error.email = "";
        }

        if (valuesToValidate.password === "") {
            error.password = "Пароль не должен быть пустым";
        } else if (!password_pattern.test(valuesToValidate.password)) {
            error.password = "Неправильный пароль";
        } else {
            error.password = "";
        }
        return error;
    }

    const handleInput = (event) => {
        setValues(prev => ({
            ...prev,
            [event.target.name]: event.target.value
        }));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(Validation(values));
        if (errors.email === "" && errors.password === "") {
            axios.post(serverURL + 'login', values)
                .then(res => {
                    if (res.data === "Success") navigate('/home');
                    else alert('Аккаунт не найден');
                })
                .catch(err => console.log(err));
        }
    }

    return (
        <Form className='col-md-6 col-11' onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='formBasicEmail'>
                <Form.Label>Email адрес</Form.Label>
                <Form.Control type='email' name='email' onChange={handleInput} placeholder='Введите email' />
                {errors.email && <span className='text-danger'>{errors.email}</span>}
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicPassword'>
                <Form.Label>Пароль</Form.Label>
                <Form.Control type='password' name='password' onChange={handleInput} placeholder='Пароль' />
                {errors.password && <span className='text-danger'>{errors.password}</span>}
            </Form.Group>
            <Button className='col-12' variant='primary' type='submit'>Войти</Button>
        </Form>
    );
};
export default LoginForm;