import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ContextProvider } from './components/Context';

import Home from './pages';
import About from './pages/about';
import Blogs from './pages/blogs';
import Login from './pages/login';
import Contact from './pages/contact';
import Admin from './pages/admin/admin'

const App = () => {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route exact path='/' element={<Navigate to='/login' />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path='/admin' element={<Admin />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;