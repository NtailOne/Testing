import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ContextProvider } from './components/Context';

import Login from './pages/login';
import TeacherPage from './pages/teacherPage';
import StudentPage from './pages/studentPage';
import Admin from './pages/admin/admin'

const App = () => {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route exact path='/' element={<Navigate to='/login' />} />
          <Route path='/login' element={<Login />} />
          <Route path='/teacherPage' element={<TeacherPage />} />
          <Route path='/studentPage' element={<StudentPage />} />
          <Route path='/admin' element={<Admin />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;