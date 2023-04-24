import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'

export default function InfoModal( props ){

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} style={{zIndex: '9999999'}}>
            {props.title?
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            : null}
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {props.img? <img style={{width: "220px"}} src={props.img}/> : null}
                {props.message? <h3 className="mt-3 text-center">{props.message}</h3> : null}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-primary-modal px-3" onClick={props.handleCloseModal}>
                    Aceptar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}