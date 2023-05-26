import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingIndicator = () => {
    return (
        <div className="d-flex justify-content-center align-content-center">
            <Spinner animation="border" variant="light" role="status" />
            <h3 className="ms-3 text-white">Загрузка...</h3>
        </div>
    );
};

export default LoadingIndicator;