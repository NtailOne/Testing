import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingIndicator = ({ color }) => {
    return (
        <div className="d-flex justify-content-center align-content-center">
            <Spinner animation="border" variant={color ? 'dark' : 'light'} role="status" />
            <h3
                className={`ms-3 ${color ? '' : 'text-white'}`}
                style={color && { color: color }}>
                Загрузка...
            </h3>
        </div>
    );
};

export default LoadingIndicator;