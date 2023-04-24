import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";

export default function ConsumableAddModal( props ) {
    return (
        <Modal show={props.showModal} onHide={props.handleCancel} backdrop="static" className='Modal'>
            <Modal.Header className="d-flex flex-column align-items-start">
                <Modal.Title>{props.title}</Modal.Title>
                <p className="m-0">Ingresá la información requerida con un {<span className="text-tertiary">*</span>}</p>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {/* <h5 className="text-center">{props.message}</h5> */}
                <Form style={{width: '90%'}} onSubmit={props.handleConfirm}>
                    <Form.Group className="mb-1">
                        <Form.Label className="mb-1">Nombre de consumible {<span className="text-tertiary">*</span>}</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="name" autoComplete="off"
                            isInvalid={ !!props.errors.name }
                            placeholder="Ejemplo: Comida, bebida, etc." 
                            onChange={props.handleOnChange}
                            maxLength={30}
                        />
                        <Form.Control.Feedback 
                            type="invalid">
                                {props.errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-1 d-flex flex-column">
                        <Form.Label className="mb-1">Descripción</Form.Label>
                        <Form.Control 
                            type="text"
                            as="textarea"
                            name="description"
                            isInvalid={ !!props.errors.description }
                            placeholder="Ingresá una descripción del consumible a agregar" 
                            onChange={ props.handleOnChange }
                            maxLength={300}
                        />
                        <Form.Control.Feedback 
                            type="invalid"
                        >
                            {props.errors.description}
                        </Form.Control.Feedback>
                        <Form.Text className="text-end">
                            {props.consumable.description? props.consumable.description.length: 0} de 300
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="quantifiable">
                        <Form.Label className="mb-1">Cantidad</Form.Label>
                        <div className="d-flex align-items-center justify-content-between">
                            <span>¿Se puede ingresar cantidad a consumir?</span>
                            <Form.Check 
                                type="switch"
                                name="quantifiable"
                                checked={ props.consumable.quantifiable }
                                style={ {fontSize: '1.25rem', padding: '0'} } 
                                onChange={ props.handleOnChange }
                            />
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCancel}>
                    Cancelar
                </Button>
                {!(props.loading)?
                    <Button className="btn-primary-modal px-3" onClick={props.handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    );
}
