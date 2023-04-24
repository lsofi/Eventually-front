import React, {useState, useEffect} from 'react';
import axios from "axios";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import CloseButton from "react-bootstrap/CloseButton";
import InfoModal from './InfoModal';
import Placeholder from "react-bootstrap/Placeholder";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faCheckDouble, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getRanHex } from '../../shared/shared-methods.util';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../Alert';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function TaskConfigModal( props ) {

    const [ task, setTask ] = useState({...props.task});
    const [ errors, setErrors ] = useState({});
    const [ showSuccesModal, setShowSuccessModal] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('¡Tarea modificada con éxito!');
    const [ loading, setLoading ] = useState(0);
    const [ loadingResponsible, setLoadingResponsible ] = useState(0);
    const [ showTaskCompletedAlert, setShowTaskCompletedAlert] = useState(false);

    useEffect(()=>{
        if (!props.showModal) return;
        getTask();
        setErrors({});
    },[props.showModal])

    const modify = props.modify && (props.permissions.UPDATE_ACTIVITY || props.permissions.UPDATE_OWN_ACTIVITY && task.isOwn) && !task.complete;

    const initialTask = props.task
    const canBeCompleted = initialTask && !(initialTask.checklist && initialTask.checklist.length && initialTask.checklist.filter(check => (!check.completed)).length);

    const getTask = async () => {
        setLoading(prev=>prev+1);
        setTask({name: props.task.name});
        if (props.event_id && props.task.activity_id){
            try{
                const res = await axios.get(`../api/activity/getActivity?event_id=${props.event_id}&activity_id=${props.task.activity_id}`);
                const resTask = res.data;
                setTask(resTask);
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }


    const findErrors = () => {
        const newErrors = {};

        if (task.name && task.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."
        
        if (task.detail && task.detail.length > 500) newErrors.detail = "La descripción de la tarea no puede superar los 500 caracteres.";

        if (task.start_date && !task.start_time ) newErrors.start_time = 'Debe ingresar una hora de inicio.'

        if (task.end_time && task.end_time !== "" && !task.end_date ) newErrors.end_date = "Debe ingresar una fecha de fin."
        else if ( task.end_time !== "" && task.end_date < task.start_date) newErrors.end_date = "La fecha de fin no puede ser menor a la fecha de inicio."
        
        if (task.end_date && task.end_date !== "" && !task.end_time ) newErrors.end_time = "Debe ingresar una hora de fin."
        else if (task.start_time && task.end_date === task.start_date && task.end_time <= task.start_time) newErrors.end_time = "La hora de fin no puede ser menor o igual a la hora de inicio."

        if (!task.in_charge) newErrors.in_charge = "Debe seleccionar un responsable de tarea";

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
        } catch (error) {}
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setTask({...task, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleOnChangeArray = (id, e) => {
        if (!modify) return;
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        setTask({...task, checklist: task.checklist.map( element => element.check_id === id ? {...element, [name]: value}: element)})
    }

    const handleChecklistAdd = () => {
        const randomId = getRanHex(24);
        setTask({...task, checklist: [{check_id: randomId, detail: '', completed: false}]});
    }

    const pushElement = () => {
        const elementsArray = task.checklist;
        const randomId = getRanHex(24);
        elementsArray.push({check_id: randomId, detail: '', completed: false})
        setTask({...task, checklist: elementsArray});
    }

    const handleRemoveTask = (check_id) => {
        const checklist = task.checklist.filter(check => {return check.check_id !== check_id})
        if (checklist.length > 0) setTask({...task, checklist: checklist})
        else setTask({...task, checklist: null})
    }

    const handleAddResponsible = async (e) => {
        const value = e.target.value;
        const in_charge = props.participants.filter(participant => {return participant.user_id === value})[0]; 

        //TODO Cambiar el setTask por llamada a la API y llamar a un getTask para actualizar la tarea.

        setLoadingResponsible(prev => prev+1)
        try{
            const params = {
                event_id: props.event_id,
                activity_id: task.activity_id,
                in_charge: in_charge.user_id
            }
            //console.log(params);
            await axios.post('../api/activity/registerInChargeActivity', params);
            const res = await axios.get(`../api/activity/getActivity?event_id=${props.event_id}&activity_id=${props.task.activity_id}`);
            const resTask = res.data;
            setTask({...task, in_charge: resTask.in_charge});
        } catch (error) {

        };

        setLoadingResponsible(prev => prev-1)
    }

    const handleRemoveResponsible = async () => {
        try{
            setLoadingResponsible(prev => prev+1);
            const params = {
                event_id: props.event_id,
                activity_id: task.activity_id
            }
            const resDelete = await axios.put('../api/activity/deleteResponsible', params);
            if (resDelete) {
                setTask({...task, in_charge: {}});
            }
        } catch (error) {};
        setLoadingResponsible(prev =>prev-1);
    }

    const handleOnComplete = async () => {
        if (!task.complete){
            try{
                setLoading(prev=>prev+1);
                const params = {
                    event_id: props.event_id,
                    activity_id: task.activity_id,
                }
                await axios.put('../api/activity/completeActivity', params);
                getTask();
                setShowTaskCompletedAlert(true);
                props.reloadEvent();
            } catch (error) {}
            setLoading(prev=>prev-1);
        }
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = task;
            params.event_id = props.event_id;
            if (params.end_time === '') params.end_time = null;
            if (params.end_date === '') params.end_date = null;
            delete params.in_charge;
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                //console.log(params);
                await axios.put('../api/activity/updateActivity', params);
                props.handleCloseModal();
                setModalMesage('¡Tarea modificada con éxito!');
                setShowSuccessModal(true);
            } catch (error) {
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }

    return (
        <>
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" size="lg" className='Modal'>
            <Modal.Header className="d-flex flex-column align-items-start mx-3" >
                <span>Tarea</span>
                <div className='d-flex justify-content-between' style={{width: "100%", gap: "1rem"}}>
                    <Modal.Title style={{wordBreak: "break-word"}}>{task.name}</Modal.Title>
                    {task.complete || loading || !(props.permissions.COMPLETE_ACTIVITY || props.permissions.COMPLETE_OWN_ACTIVITY && task.isOwn)
                    || !canBeCompleted?
                        !modify? 
                            loading?
                                <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>
                                :
                                <CloseButton className="me-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}></CloseButton> 
                            :null
                        :
                        <Button className="btn-primary-modal px-3" onClick={handleOnComplete}>
                            <FontAwesomeIcon icon={faCheck}/>
                            &nbsp;Finalizar
                        </Button>
                    }
                </div>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {loading?
                    <div className="d-flex flex-column gap-2" style={{width: '90%'}}>
                        <Placeholder animation="wave" className="m-1 rounded" 
                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                        />
                        <Placeholder animation="wave" className="m-1 rounded" 
                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '6rem', width: '100%'}}
                        />
                        <Placeholder animation="wave" className="m-1 rounded" 
                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                        />
                        <div className="d-flex gap-1">
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                        </div>
                        <div className="d-flex gap-1">
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                        </div>
                    </div>
                    :
                    <Form style={{width: '90%'}} onSubmit={handleOnSubmit}>
                        {modify?
                        <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                            <Form.Label className="mb-1">Nombre <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off" disabled={!modify} 
                                        value={task.name} maxLength={50} onChange={handleOnChange}/>
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Form.Group>: null}
                        <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                            <Form.Label className="mb-1">Descripción</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                isInvalid={ !!errors.detail } 
                                placeholder="" 
                                name="detail" 
                                disabled={!modify} 
                                value={task.detail} 
                                maxLength={500} 
                                onChange={handleOnChange}
                            />
                            {modify? 
                            <Form.Text className="text-end">{task.detail?  task.detail.length: 0} de 500</Form.Text> 
                            : 
                            null}
                            <Form.Control.Feedback type="invalid">{errors.detail}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                            <Form.Label className="mb-1">Responsable</Form.Label>
                            {task.in_charge && task.in_charge.user_id?
                            <Card className='m-1 participant-info'>
                                <Card.Body>
                                    <Row>
                                        <Col className='col-participant px-3'>
                                            <h6 className='m-0'>{task.in_charge.username}</h6>
                                            <span>{task.in_charge.name + ' ' + task.in_charge.lastname}</span>
                                        </Col>
                                        <Col className='col-participant d-flex align-items-center' xs={2} md={1}>
                                            {modify && props.permissions.DELETE_IN_CHARGE_ACTIVITY? <Button className="delete-btn d-flex" onClick={handleRemoveResponsible}><FontAwesomeIcon icon={faTimesCircle}/></Button> : null}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card> 
                            :
                            <>
                                {props.permissions.REGISTER_IN_CHARGE_ACTIVITY && modify? 
                                <>
                                <Form.Select name="in_charge" isInvalid={errors.in_charge} disabled={!modify}
                                value={task.in_charge? task.in_charge.user_id: ''} onChange={(e)=>handleAddResponsible(e)}>
                                    <option value={''}>Elegí el responsable de la tarea...</option>
                                    {props.participants.map((participant, key) =>{
                                        return(
                                            <option key={key} value={participant? participant.user_id: undefined}>{participant? participant.username: ''}</option>
                                        )
                                    })}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.in_charge}</Form.Control.Feedback>
                                </> : null}
                            </>
                            }
                        </Form.Group>
                        {modify || task.start_date?
                        <Row className="d-flex align-items-start">
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-1" controlId="start_date">
                                    <Form.Label className='mb-1'>Fecha de inicio </Form.Label>
                                    <Form.Control name="start_date" isInvalid={ !!errors.start_date } value={task.start_date} type="date" placeholder="Ingresá la fecha de inicio " disabled={!modify} onChange={handleOnChange}/>
                                    <Form.Control.Feedback type="invalid">{errors.start_date}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-1" controlId="start_time">
                                    <Form.Label className='mb-1'>Hora de inicio </Form.Label>
                                    <Form.Control name="start_time"isInvalid={ !!errors.start_time} value={task.start_time} type="time" placeholder="Ingresá la hora de inicio " disabled={!modify} onChange={handleOnChange}></Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row> 
                        : 
                        null
                        }
                        {modify || task.end_date?
                        <Row className="d-flex align-items-start">
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-1" controlId="end_date">
                                    <Form.Label className='mb-1'>Fecha de finalización </Form.Label>
                                    <Form.Control name="end_date" isInvalid={ !!errors.end_date } value={task.end_date}  type="date" placeholder="Ingresá la fecha de fin del evento " disabled={!modify} onChange={handleOnChange}></Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.end_date}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-1" controlId="end_time">
                                    <Form.Label className='mb-1'>Hora de finalización </Form.Label>
                                    <Form.Control name="end_time" isInvalid={ !!errors.end_time} value={task.end_time}  type="time" placeholder="Ingresá la hora de fin del evento" disabled={!modify} onChange={handleOnChange}></Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.end_time}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>  
                        </Row> : null}
                        {task.checklist? 
                                <Form.Group className="mb-1" controlId="formBasicCheckbox">
                                    <Form.Label>Checklist</Form.Label>
                                    {task.checklist.map((task, key) => {
                                        return (
                                            <div className='d-flex align-items-center mb-2' style={{ gap: '0.5rem' }} key={key}>
                                                <Form.Check type="checkbox" checked={task.completed} name="completed" onChange={(e) => handleOnChangeArray(task.check_id, e)} />
                                                <Form.Control type="text" placeholder="Ingresá una descripción" name="detail" disabled={!modify} value={task.detail} onChange={(e) => handleOnChangeArray(task.check_id, e)} />
                                                {modify ?
                                                    <Button className="delete-btn d-flex" onClick={() => handleRemoveTask(task.check_id)}><FontAwesomeIcon icon={faTimesCircle} /></Button> : null}
                                            </div>
                                        )
                                    })}
                                    {modify ?
                                        <Button className="btn-gray-modal px-3 mt-2 mx-4" onClick={pushElement}>Añadir Elemento</Button> 
                                        : 
                                        null
                                    }
                                </Form.Group>
                            :
                                <div className="d-flex justify-content-center">
                                    {modify ?
                                        <Button className="btn-primary-modal px-3" onClick={handleChecklistAdd}><FontAwesomeIcon icon={faCheckDouble} /> Añadir Checklist</Button> 
                                    : 
                                        null
                                    }
                                </div>}
                    </Form>
                }
            </Modal.Body>
            {modify?
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}>
                    Cancelar
                </Button>
                {!loading && !loadingResponsible ?
                    <Button className="btn-primary-modal px-3" onClick={handleOnSubmit}>
                        Guardar
                    </Button> :
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
            :null}
        </Modal>
        <InfoModal
            showModal={showSuccesModal}
            handleCloseModal={()=>{setShowSuccessModal(false); props.reloadEvent();}}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        <Snackbar open={showTaskCompletedAlert} onClose={()=>{setShowTaskCompletedAlert(false)}} anchorOrigin={{vertical: "top", horizontal: "right"}}>
            <Alert onClose={()=>{setShowTaskCompletedAlert(false)}} severity="success" sx={{ width: '100%' }}>
                ¡Tarea finalizada con éxito!
            </Alert>
        </Snackbar>
        </>
    );
}
