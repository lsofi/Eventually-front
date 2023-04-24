import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

export default function ModalPassConfirm( props ){
    //@props => showModal, handleCancel, handleConfirm, title, messge, errors;

    return (
        <Modal show={props.showModal} onHide={props.handleCancel} backdrop="static" className='Modal'>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <h5 className="text-center">{props.message}</h5>
                <Form onSubmit={props.handleConfirm} style={{width: '90%'}}>
                    <Form.Group>
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control 
                            type="password" 
                            name="password" 
                            isInvalid={ !!props.errors }
                            placeholder="Por favor ingrese su contraseña" 
                            onChange={props.handleOnChange}
                            maxLength={32}
                            />
                        <Form.Control.Feedback type="invalid">{props.errors}</Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCancel}>
                    Cancelar
                </Button>
                {!props.loading?
                <Button className="btn-primary-modal px-3" onClick={props.handleConfirm}>
                    Confirmar
                </Button>:
                <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                </Button>}
            </Modal.Footer>
        </Modal>
    );
}