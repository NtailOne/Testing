import React, { useContext, useEffect } from 'react';

import AdminLoginForm from './AdminLoginForm';
import AdminPage from './adminPage';

import { Context } from '../../components/Context'

const Admin = () => {
    const { adminLogged, setAdminLogged } = useContext(Context);

    useEffect(() => {
        const isLogged = localStorage.getItem('adminLogged');
        if (isLogged) {
            setAdminLogged(true);
        }
    }, []);

    return (
        adminLogged ? <AdminPage /> : <AdminLoginForm/>
    )
}

export default Admin;