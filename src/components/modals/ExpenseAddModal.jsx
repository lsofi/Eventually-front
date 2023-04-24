import React, {useState, useEffect} from 'react';
import axios from "axios";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import InfoModal from './InfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function ExpenseAddModal (props){
    const [ errorsAdd, setErrorsAdd ] = useState({});
    const [ expenseAdd, setExpenseAdd ] = useState({quantifiable: false});
    const [ loadingAdd, setLoadingAdd ] = useState(false);

    
    const [ showSuccessModal, setShowSuccessModal] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('');

    useEffect(() => {
        setErrorsAdd({});
        setExpenseAdd({quantifiable: false});
    }, [props.showModal])

    const findErrors = () => {
        const newErrors = {};

        if (!expenseAdd.name || expenseAdd.name === '') newErrors.name = "Debe ingresar un nombre.";
        else if (expenseAdd.name.length > 30) newErrors.name = "El nombre no puede superar los 30 caracteres.";

        if (!expenseAdd.amount) newErrors.amount = "Debe ingresar un monto.";

        if (expenseAdd.description && expenseAdd.description.length > 300) newErrors.description = "La descripción no puede superar los 300 caracteres.";

        return newErrors;
    }
    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrorsAdd(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {}
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        setExpenseAdd({...expenseAdd, [name]: value});
        if ( !!errorsAdd[name] ) setErrorsAdd({...errorsAdd, [name]: null});
    }

    const handleAddResponsible = async (e) => {
        const value = e.target.value;
        const in_charge = props.participants.filter(participant => {return participant.user_id === value})[0]; 

        setExpenseAdd({...expenseAdd, in_charge: in_charge});
    }

    const handleCancel = () => {
        setExpenseAdd({quantifiable: false});
        props.handleCloseModal();
    }

    const handleRemoveResponsible = async () => {
        setExpenseAdd({...expenseAdd, in_charge: {}});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrorsAdd(newErrors);
        } else {
            const params = expenseAdd;
            params.in_charge = params.in_charge ? params.in_charge.user_id : null;
            params.event_id = props.event_id;
            params.amount = Number(params.amount);
            try {
                setLoadingAdd(true);
                await axios.post('../api/expense/createExpense', params);
                setErrorsAdd({});
                setExpenseAdd({quantifiable: false});
                props.handleCloseModal();
                setModalMesage('¡Gasto agregado con éxito!');
                setShowSuccessModal(true);
            } catch (error) {
                setResponseErrors(error);
            }
            setLoadingAdd(false);
        }
    }


    return (
        <>
        <Modal show={props.showModal} onHide={handleCancel} backdrop="static" className='Modal'>
            <Modal.Header>
                <div>
                    <Modal.Title>{props.title}</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <Form style={{width: '90%'}} onSubmit={handleSubmit}>
                    <Row>
                        <Col xs={12} md={7}>
                            <Form.Group className="d-flex flex-column mb-1" controlId="name">
                                <Form.Label className='mb-1'>Nombre <span className="text-tertiary">*</span></Form.Label>
                                <Form.Control
                                    isInvalid={!!errorsAdd.name}
                                    placeholder="Ingresá el nombre del gasto"
                                    name="name" autoComplete="off"
                                    // value={expenseAdd.name}
                                    maxLength={30}
                                    onChange={handleOnChange} />
                                <Form.Control.Feedback
                                    type="invalid">{errorsAdd.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={5}>
                            <Form.Group className="d-flex flex-column mb-1" controlId="totalExpense">
                                <Form.Label className='mb-1'>Monto Total <span className="text-tertiary">*</span></Form.Label>
                                <div className="d-flex">
                                    <InputGroup.Text className="px-2" style={{ borderRadius: "0.5rem 0 0 0.5rem", borderColor: 'var(--card-border-color)' }}>$</InputGroup.Text>
                                    <Form.Control
                                        type="number" autoComplete="off"
                                        isInvalid={!!errorsAdd.amount}
                                        placeholder="Ingresá el monto del gasto."
                                        name="amount"
                                        // value={expenseAdd.amount}
                                        min={0}
                                        onChange={handleOnChange}
                                        style={{ borderRadius: "0 0.5rem 0.5rem 0" }} 
                                    />
                                </div>
                                <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errorsAdd.amount}</span>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                        <Form.Label className='mb-1'>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            isInvalid={!!errorsAdd.description}
                            placeholder="Ingresá una descripción"
                            name="description"
                            value={expenseAdd.description}
                            onChange={handleOnChange}
                            maxLength={300}
                        />
                        <Form.Text className="text-end">{expenseAdd.description ? expenseAdd.description.length : 0} de 300</Form.Text>
                        <Form.Control.Feedback
                            type="invalid">{errorsAdd.description}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-1 d-flex flex-column" controlId="in_charge">
                        <Form.Label className='mb-1'>Responsable</Form.Label>
                        <Form.Text className="m-0 text-start">Si no elegís un responsable, por defecto serás vos.</Form.Text>
                        {expenseAdd.in_charge && expenseAdd.in_charge.user_id ?
                            <Card className='my-1 participant-info'>
                                <Card.Body>
                                    <Row className="px-3">
                                        <Col className='col-participant'>
                                            <h6 className='m-0'>{expenseAdd.in_charge.username}</h6>
                                            <span>{expenseAdd.in_charge.name + ' ' + expenseAdd.in_charge.lastname}</span>
                                        </Col>
                                        <Col className='col-participant d-flex align-items-center' xs={2} md={1}>
                                            <Button className="delete-btn d-flex" onClick={handleRemoveResponsible}><FontAwesomeIcon icon={faTimesCircle} /></Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            :
                            <>
                                <Form.Select 
                                    className='my-1'
                                    defaultValue="" 
                                    name="in_charge"
                                    isInvalid={errorsAdd.in_charge}
                                    value={expenseAdd.in_charge ? expenseAdd.in_charge.user_id : ''} 
                                    onChange={(e) => handleAddResponsible(e)}
                                >
                                    <option 
                                        value={''}> 
                                        Elegí el responsable del gasto...
                                    </option>
                                    {props.participants.map((participant, key) => {
                                        return (
                                            <option 
                                                key={key} 
                                                value={participant ? participant.user_id : null}
                                            >
                                                    {participant ? participant.username : ''}
                                            </option>
                                        )
                                    })}
                                </Form.Select>
                            </>
                        }
                    </Form.Group>
                    <Form.Group className="d-flex flex-column" controlId="quantifiable">
                        <Form.Label className='mb-1'>Cantidad</Form.Label>
                        <div className="d-flex align-items-center justify-content-between">
                            <span>¿Se puede pagar por unidades?</span>
                            <Form.Check type="switch" id="visible" name="visible" value={expenseAdd.visible} 
                                checked={expenseAdd.visible}
                                style={{fontSize: '1.25rem', padding: '0'}} onChange={(event) => {
                                    setExpenseAdd({ ...expenseAdd, quantifiable: event.target.checked });
                                }}/>
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleCancel}>
                    Cancelar
                </Button>
                {!loadingAdd?
                    <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
                        Agregar gasto
                    </Button> :
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
        <InfoModal
            showModal={showSuccessModal}
            handleCloseModal={()=>{setShowSuccessModal(false); props.reloadEvent();}}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        </>
    );
}