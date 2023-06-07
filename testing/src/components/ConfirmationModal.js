import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Отмена
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    Подтвердить
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;