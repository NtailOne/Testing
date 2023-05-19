import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteItemConfirmation = (props) => {
    const [show, setShow] = useState(false);

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleDelete = () => {
        props.onDelete();
        setShow(false);
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Удалить
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите удалить выбранный элемент?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeleteItemConfirmation;