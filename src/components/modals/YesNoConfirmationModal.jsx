import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function YesNoConfirmationModal( props ) {
    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} style={{zIndex: '9999999'}}>
            {props.title?
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            : null}
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {props.img? <img style={{width: "220px"}} src={props.img}/> : null}
                {props.message? <h5 className="mt-3 text-center">{props.message}</h5> : null}
            </Modal.Body>
            <Modal.Footer>
                {props.loading?
                    <Button className="btn-primary-modal px-3" type="submit" disabled={true}>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                    :
                    <Button className="btn-primary-modal px-3" onClick={props.handleConfirm}>
                        Sí
                    </Button>
                }
                <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
