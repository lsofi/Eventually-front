import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import InfoModal from './InfoModal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faCheckDouble, faCheck } from '@fortawesome/free-solid-svg-icons';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function TaskAddModal (props) {


    const [ errors, setErrors ] = useState({});
    const [ loadingAdd, setLoadingAdd ] = useState(0);
    const [ taskAdd, setTaskAdd ] = useState({});
    const [ showSuccessModal, setShowSuccessModal ] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('¡Tarea agregada con éxito!');
    
    useEffect(()=>{
        setTaskAdd({});
        setErrors({});
    }, [props.showModal])

    const findErrors = () => {
        const newErrors = {};
        if (!taskAdd.name || taskAdd.name === '') newErrors.name = "Por favor ingrese el nombre de la tarea a realizar."

        if (taskAdd.name && taskAdd.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."

        if (taskAdd.detail && taskAdd.detail.length > 500) newErrors.detail = "La descripción de la tarea no puede superar los 500 caracteres.";

        if (taskAdd.start_date && !taskAdd.start_time ) newErrors.start_time = 'Debe ingresar una hora de inicio.'

        if (taskAdd.end_time && taskAdd.end_time !== "" && !taskAdd.end_date ) newErrors.end_date = "Debe ingresar una fecha de fin."
        else if ( taskAdd.end_time !== "" && taskAdd.end_date < taskAdd.start_date) newErrors.end_date = "La fecha de fin no puede ser menor a la fecha de inicio."
        
        if (taskAdd.end_date && taskAdd.end_date !== "" && !taskAdd.end_time ) newErrors.end_time = "Debe ingresar una hora de fin."
        else if (taskAdd.start_time && taskAdd.end_date === taskAdd.start_date && taskAdd.end_time <= taskAdd.start_time) newErrors.end_time = "La hora de fin no puede ser menor o igual a la hora de inicio."

        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrors(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {
            console.log(error)
        }
    }

    const handleCancel = () => {
        setTaskAdd({});
        setErrors({});
        props.handleCloseModal();
    }

    const handleOnChange = (e) =>{
        const name = e.target.name; // Acá el nombre del target sería el task, el nombre del Control.
        const value = e.target.value; // Acá el valor que va tomando ese target es el texto dentro del Control.
        setTaskAdd({...taskAdd, [name]: value});
        if ( !! errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleAddResponsible = (e) => {
        const value = e.target.value;
        const in_charge = props.participants.filter(participant => {return participant.user_id === value})[0];
        console.log(in_charge)

        setTaskAdd({...taskAdd, in_charge: in_charge})
    }

    const handleRemoveResponsible = () => {
        setTaskAdd({...taskAdd, in_charge: null})
    }

    const handleConfirm = async (e) => {
        // Cuando se hace un submit de un form, hay comportamientos por defecto que se realizan al ejecutarse dicho submit. Estas dos líneas previenen algunos de esos comportamientos.
        e.preventDefault(); 
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors();
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        }
        else {
            try{
                setLoadingAdd(prev => prev+1);
                console.log("Tarea", taskAdd)
                let params = { 
                    ...taskAdd,
                    event_id: props.event_id
                };
                if (params.in_charge) {
                    params = {
                        ...params, 
                        in_charge: params.in_charge.user_id
                    }
                }
                const res = await axios.post('../api/activity/createActivity', params); 
                props.handleCloseModal();
                props.reloadEvent();
                setModalMesage('¡Tarea agregada con éxito!')
                setShowSuccessModal(true);
            } catch (error){
                console.log(error)
                setResponseErrors(error);
            }
            setLoadingAdd(prev => prev-1);
        }
    }

    return(
        <>
        <Modal show={props.showModal} onHide={handleCancel} backdrop="static" className='Modal'>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <Form style={{width: '90%'}} onSubmit={handleConfirm}>
                    <Form.Group className="mb-1">
                        <Form.Label className='mb-1'>Nombre de tarea <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control 
                            autoComplete='off'
                            type="text" 
                            name="name"
                            isInvalid={ !!errors.name}
                            placeholder="Ingresá el nombre de la tarea a agregar"
                            value={taskAdd.name}
                            onChange={handleOnChange}
                            maxLength={50}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                        <Form.Label className='mb-1'>Descripción</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            isInvalid={ !!errors.detail } 
                            placeholder="Ingresá una descripción de la tarea" 
                            name="detail"
                            value={taskAdd.detail} 
                            maxLength={500} 
                            onChange={handleOnChange}
                        />
                        <Form.Text className="text-end">{taskAdd.detail?  taskAdd.detail.length: 0} de 500</Form.Text>
                        <Form.Control.Feedback type="invalid">{errors.detail}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-1 d-flex flex-column" controlId="responsible">
                        <Form.Label className='mb-1'>Responsable</Form.Label>
                        {taskAdd.in_charge && taskAdd.in_charge.user_id?
                        <Card className='mb-1 participant-info'>
                            <Card.Body>
                                <Row>
                                    <Col className='col-participant px-3'>
                                        <h6 className='m-0'>{taskAdd.in_charge.username}</h6>
                                        <span>{taskAdd.in_charge.name + ' ' + taskAdd.in_charge.lastname}</span>
                                    </Col>
                                    <Col className='col-participant d-flex align-items-center' xs={2} md={1}>
                                        <Button className="delete-btn d-flex" onClick={handleRemoveResponsible}>
                                            <FontAwesomeIcon icon={faTimesCircle}/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card> 
                        :
                        <>
                            <Form.Select 
                                name="in_charge" 
                                isInvalid={ !!errors.in_charge } 
                                disabled={ !props.permissions.REGISTER_IN_CHARGE_ACTIVITY }
                                value={ taskAdd.in_charge? taskAdd.in_charge.user_id: '' } 
                                onChange={handleAddResponsible}
                            >
                                <option value={''}> Elegí el responsable de la tarea...</option>
                                {props.participants.map((participant, key) => {
                                    return(
                                        <option key={key} value={participant? participant.user_id: undefined}>{participant? participant.username: ''}</option>
                                    ) //TODO Consultar por qué hizo la validación de participantes acá el Kako
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.in_charge}</Form.Control.Feedback>
                        </>
                        }
                    </Form.Group>
                    <Row className="d-flex align-items-start">
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-1" controlId="start_date">
                                <Form.Label className='mb-1'>Fecha de inicio</Form.Label>
                                <Form.Control 
                                    name="start_date" 
                                    isInvalid={ !!errors.start_date } 
                                    value={taskAdd.start_date} 
                                    type="date" 
                                    placeholder="Ingresá la fecha de inicio"
                                    onChange={handleOnChange}
                                />
                                <Form.Control.Feedback type="invalid">{errors.start_date}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-1" controlId="start_time">
                                <Form.Label className='mb-1'>Hora de inicio</Form.Label>
                                <Form.Control 
                                    name="start_time"
                                    isInvalid={ !!errors.start_time } 
                                    value={ taskAdd.start_time } 
                                    type="time" 
                                    placeholder="Ingresá la hora de inicio"
                                    onChange={handleOnChange}
                                />
                                <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-start">
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-1" controlId="end_date">
                                <Form.Label className='mb-1'>Fecha de finalización </Form.Label>
                                <Form.Control 
                                    name="end_date" 
                                    isInvalid={ !!errors.end_date } 
                                    value={taskAdd.end_date}  
                                    type="date" 
                                    placeholder="Ingresá la fecha de fin"
                                    onChange={handleOnChange}
                                />
                                <Form.Control.Feedback type="invalid">{errors.end_date}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group className="mb-1" controlId="end_time">
                                <Form.Label className='mb-1'>Hora de finalización</Form.Label>
                                <Form.Control 
                                    name="end_time" 
                                    isInvalid={ !!errors.end_time} 
                                    value={ taskAdd.end_time }
                                    type="time"
                                    placeholder="Ingresá la hora de fin"
                                    onChange={handleOnChange}
                                />
                                <Form.Control.Feedback type="invalid">{errors.end_time}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>  
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleCancel}>
                    Cancelar
                </Button>
                {!loadingAdd?
                    <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
        <InfoModal
            showModal={showSuccessModal}
            handleCloseModal={()=>setShowSuccessModal(false)}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        </>
    )
}