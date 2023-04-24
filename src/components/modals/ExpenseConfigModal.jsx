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
import CloseButton from "react-bootstrap/CloseButton";
import Placeholder from "react-bootstrap/Placeholder";
import InfoModal from './InfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faMinusCircle, faPlusCircle, faPenClip} from '@fortawesome/free-solid-svg-icons';
import ParticipantsAddModal from './ParticipantsAddModal';
import { getMyUserId } from '../../shared/shared-methods.util';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function ExpenseConfigModal( props ) {
    const [ expense, setExpense ] = useState({...props.expense});
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(0);
    const [ subscribeQuantity, setSubscribeQuantity] = useState(1);
    const [ showSuccessModal, setShowSuccessModal] = useState(false);
    const [ showParticipantsAddModal, setShowParticipantsAddModal ] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('');

    const myUser =  getMyUserId()

    useEffect(()=>{
        if (!props.showModal) return;
        getExpense();
        setErrors({});
        setSubscribeQuantity(1);
    },[props.showModal]);

    const getExpense = async () => {
        setLoading(prev=>prev+1);
        setExpense({name: props.expense.name, description: props.expense.description, amount: props.expense.amount, isOwn: props.expense.isOwn});
        if (props.event_id && props.expense.expense_id){
            try{
                const res = await axios.get(`../api/expense/getExpense?event_id=${props.event_id}&expense_id=${props.expense.expense_id}`);
                const resExpense = res.data;
                resExpense.in_charge = props.participants.filter(participant => {return participant.user_id === resExpense.in_charge})[0];
                setExpense(resExpense);
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }

    const modify = props.modify && (props.permissions.UPDATE_EXPENSE || props.permissions.UPDATE_OWN_EXPENSE && expense.isOwn);

    const findErrors = () => {
        const newErrors = {};

        if (!expense.name || expense.name === '') newErrors.name = "Debe ingresar un nombre."
        else if (expense.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."

        if (expense.description && expense.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres.";

        if (!expense.amount || expense.amount <= 0 ) newErrors.amount = "El monto no puede estar vacío.";

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

    const isSubscriber = () => {
        return (expense.subscribers && expense.subscribers.filter(c => c.user_id = myUser).length);
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setExpense({...expense, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleOnChangeAmount = (e) => {
        const value = e.target.value;
    
        if (value >= 0 && value < 999999999999999999999999999) setExpense({...expense, amount: value});
        if ( !!errors.amount ) setErrors({...errors, amount: null});
    }

    const handleChangeQuantity = (e) => {
        const value = e.target.value;

        if(!Number.isNaN(value) && value >= 0 && value <100) {
            setSubscribeQuantity(Number(value));
            setErrors({...errors, subscribeQuantity: null});
        }
    }

    const handleAddResponsible = async (e) => {
        const value = e.target.value;
        const in_charge = props.participants.filter(participant => {return participant.user_id === value})[0]; 

        setExpense({...expense, in_charge: in_charge});
    }

    const handleRemoveResponsible = async () => {
        setExpense({...expense, in_charge: {}});
    }

    const handleModifySubscribers = () =>{
        setShowParticipantsAddModal(true);
        props.handleCloseModal();
    }

    const handleSetSubscribers = async (subscribers) => {
        const params = {
            event_id: props.event_id,
            expense_id: expense.expense_id,
            subscribers: subscribers
        }
        setLoading(prev => prev + 1);
        try{
            await axios.post('../api/expense/updateSubscribers', params);
            getExpense();
        } catch (error) {}
        setLoading(prev => prev - 1);
        // setExpense({...expense, subscribers: subscribers});
    }

    const resetQuantities = () => {
        setExpense({...expense, quantifiable: false ,subscribers: expense.subscribers.map(element => {return {...element, quantity: 1}})});
    }

    const handleSubscribe = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {
                event_id: expense.event_id,
                expense_id: expense.expense_id,
                // quantity: subscribeQuantity
            };
            if (expense.quantifiable) params.quantity = subscribeQuantity;
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.post('../api/expense/subscribeToExpense', params);
                props.handleCloseModal();
                setModalMesage('Te suscribiste a ' + expense.name)
                setShowSuccessModal(true);
            } catch (error) {
               
            }
            setLoading(prev=>prev-1);
        }
    }

    const handleUnsubscribe = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {
                event_id: expense.event_id,
                expense_id: expense.expense_id,
            };
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.post('../api/expense/unsubscribeToExpense', params);
                props.handleCloseModal();
                setModalMesage('Te desuscribiste a ' + expense.name)
                setShowSuccessModal(true);
            } catch (error) {
               
            }
            setLoading(prev=>prev-1);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = expense;
            params.in_charge = params.in_charge.user_id;
            params.event_id = props.event_id;
            params.amount = Number(params.amount);
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.put('../api/expense/updateExpense', params);
                props.handleCloseModal();
                setModalMesage('¡Gasto modificado con éxito!')
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
            <Modal.Header>
                <div className="w-100 mx-3">
                    <Row>
                        <Col className="flex-grow-1">
                            <span>Gasto</span>
                            <Modal.Title>{expense.name}</Modal.Title>
                            <p style={{wordBreak: "break-word", marginBottom: "0"}}>{expense.description}</p>
                        </Col>
                        <Col className="flex-grow-0 d-flex flex-column align-items-end me-3 mt-3 justify-content-center">
                            {!modify?
                                loading?
                                    <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>
                                    :
                                    <CloseButton onClick={()=>{props.handleCloseModal(); props.reloadEvent();}}></CloseButton> 
                                :null}
                            <h3 className="text-tertiary" style={{minWidth: "fit-content"}}>${expense.amount}</h3>
                        </Col>
                    </Row>
                </div>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {loading ?
                    <div className="d-flex flex-column gap-2 " style={{width: '90%'}}>
                        {props.modify && (props.permissions.UPDATE_EXPENSE || props.permissions.UPDATE_OWN_EXPENSE && expense.isOwn)?
                            <>
                                <div className="d-flex gap-1 ms-1 w-100">
                                    <Placeholder animation="wave" className="m-1 rounded flex-grow-1"
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem'}}
                                    />
                                    <Placeholder animation="wave" className="my-1 rounded flex-grow-0"
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '40%'}}
                                    />
                                </div>
                                <Placeholder animation="wave" className="m-1 rounded"
                                    style={{backgroundColor: 'var(--text-ultra-muted)', height: '6rem', width: '100%'}}
                                />
                                <Placeholder animation="wave" className="m-1 mt-4 rounded"
                                    style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                                />
                            </>
                        :null}
                        <div className="d-flex flex-column w-80-sm gap-1 mt-3 mx-auto">
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                            />
                        </div>
                    </div>
                    :
                    <Form style={{width: '90%'}} onSubmit={handleSubmit}>
                        {props.modify && (props.permissions.UPDATE_EXPENSE || props.permissions.UPDATE_OWN_EXPENSE && expense.isOwn)? 
                        <>
                            <Row>
                                <Col xs={12} md={7}>
                                    <Form.Group className="mb-1 d-flex flex-column" controlId="name">
                                        <Form.Label className="mb-1">Nombre <span className="text-tertiary">*</span></Form.Label>
                                        <Form.Control isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off" disabled={!props.modify} 
                                                    value={expense.name} maxLength={50} onChange={handleOnChange}/>
                                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={5}>
                                    <Form.Group className="mb-1 d-flex flex-column" controlId="name">
                                        <Form.Label className="mb-1">Monto Total <span className="text-tertiary">*</span></Form.Label>
                                        <div className="d-flex">
                                            <InputGroup.Text className="px-2" style={{borderRadius: "0.5rem 0 0 0.5rem", borderColor: 'var(--card-border-color)'}}>$</InputGroup.Text>
                                            <Form.Control type="number" autoComplete="off" isInvalid={ !!errors.amount } placeholder="" name="amount" disabled={!props.modify} 
                                                    value={expense.amount} min={0} onChange={handleOnChangeAmount} 
                                                    style={{borderRadius: "0 0.5rem 0.5rem 0"}}/>
                                        </div>
                                        <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.amount}</span>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                                <Form.Label className="mb-1">Descripción</Form.Label>
                                <Form.Control as="textarea" isInvalid={ !!errors.description } placeholder="" name="description" disabled={!props.modify} 
                                            value={expense.description} onChange={handleOnChange} maxLength={500}/>
                                {props.modify? <Form.Text className="text-end">{expense.description?  expense.description.length: 0} de 500</Form.Text> : null}
                                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                                <Form.Label className="mb-1">Responsable</Form.Label>
                                {expense.in_charge && expense.in_charge.user_id?
                                    <Card className='participant-info'>
                                        <Card.Body>
                                            <Row className="px-3">
                                                <Col className='col-participant'>
                                                    <h6 className='m-0'>{expense.in_charge.username}</h6>
                                                    <span>{expense.in_charge.name + ' ' + expense.in_charge.lastname}</span>
                                                </Col>
                                                <Col className='col-participant d-flex align-items-center' xs={2} md={1}>
                                                    {props.modify? <Button className="delete-btn d-flex" onClick={handleRemoveResponsible}><FontAwesomeIcon icon={faTimesCircle}/></Button> : null}
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card> 
                                    :
                                    <>
                                        <Form.Select defaultValue="" name="in_charge" isInvalid={errors.in_charge} disabled={!props.modify}
                                        value={expense.in_charge? expense.in_charge.user_id: ''} onChange={(e)=>handleAddResponsible(e)}>
                                            <option value={''}> Elegí el responsable del gasto...</option>
                                            {props.participants.map((participant, key) =>{
                                                return(
                                                    <option key={key} value={participant? participant.user_id: null}>{participant? participant.username: ''}</option>
                                                )
                                            })}
                                        </Form.Select>
                                    </> 
                                }
                            </Form.Group>
                            <Form.Group className="mb-1 d-flex flex-column" controlId="quantifiable">
                                <Form.Label className="mb-1">Cantidad</Form.Label>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>¿Se puede pagar por unidades?</span>
                                    <Form.Check type="switch" id="visible" name="visible" value={expense.quantifiable} 
                                    checked={expense.quantifiable}
                                    style={{fontSize: '1.5rem'}} 
                                    onChange={(event) => {
                                            if (!event.target.checked) resetQuantities();
                                            else setExpense({...expense, quantifiable: true});
                                            setSubscribeQuantity(1);
                                    }}/>
                                </div>
                            </Form.Group>
                        </>
                        : null}
                        <Card className="my-1">
                            <Card.Header className="d-flex justify-content-between">
                                <h5>Suscriptores</h5>
                                {props.modify && (props.permissions.UPDATE_EXPENSE_SUBSCRIBERS_LIST || props.permissions.UPDATE_OWN_EXPENSE_SUBSCRIBERS_LIST && expense.isOwn)?
                                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={handleModifySubscribers}>
                                    <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    &nbsp;Editar suscriptores
                                </Button>: null}
                            </Card.Header>
                            <Card.Body className="list-container">
                                {expense.subscribers && expense.subscribers.length?
                                <>
                                    <div className="expense-card" style={{maxHeight: "40vh", overflow: "auto"}}>
                                        {expense.subscribers.map((subscriber, key) => {
                                            return (
                                                <div className='d-flex flex-row align-items-center card mb-2 py-1 px-2 ' style={{gap: '0.5rem'}} key={key}>
                                                    <div className="d-flex flex-grow-1 justify-content-between align-items-center px-2 ">
                                                        <div>
                                                            <h5>{subscriber.name} {subscriber.lastname}</h5>
                                                            <span>{subscriber.username}</span>
                                                        </div>
                                                        <h2 className="text-tertiary mb-0">{subscriber.quantity}</h2>
                                                    </div>
                                                </div>
                                        )})}
                                    </div> 
                                </>
                                : <h4 className="mx-2">{loading? "Cargando suscriptores":"No hay suscriptores todavía"}</h4>}
                            </Card.Body>
                        </Card>
                        {/* <div className="d-flex flex-column justify-content-center align-items-center m-2 add-button" style={{gap: '1rem'}}>
                            {!isSubscriber()?
                            <>
                                {expense.quantifiable? 
                                    <Form.Group className="mb-1 d-flex flex-column" controlId="formGridAddress2">
                                        <div className="d-flex align-items-center" style={{gap: '0.5rem'}}>
                                            <Form.Label className="m-0">¿Cuántos/as vas a pagar?</Form.Label>
                                            <Form.Control className="form-input" type="number" autoComplete="off" min={1} max={99} 
                                                isInvalid={!!errors.subscribeQuantity} 
                                                placeholder="" 
                                                name="subscribeQuantity" 
                                                value={subscribeQuantity} 
                                                onChange={(e)=>{handleChangeQuantity(e)}}  
                                                style={{maxWidth: !errors.subscribeQuantity? '4rem': '6rem', margin: 'auto'}}/>
                                        </div>
                                        <span className='text-danger'>{errors.subscribeQuantity}</span>
                                    </Form.Group>: null}
                                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={handleSubscribe}>
                                    <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    &nbsp;Suscribirse
                                </Button> 
                            </>:
                                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={handleUnsubscribe}>
                                    <FontAwesomeIcon size="lg" icon={faMinusCircle}/>
                                    &nbsp;Desuscribirse
                                </Button>
                            }
                        </div> */}
                    </Form>
                }
            </Modal.Body>
            {modify?
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent();}}>
                    Cancelar
                </Button>
                {!loading?
                    <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
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
            showModal={showSuccessModal}
            handleCloseModal={()=>{setShowSuccessModal(false); props.reloadEvent();}}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        <ParticipantsAddModal
            title={`Editar suscriptores ${expense.name}`}
            subtitle="Gasto"
            showModal={showParticipantsAddModal}
            setSubscribers={handleSetSubscribers}
            handleCloseModal={()=>{setShowParticipantsAddModal(false); props.handleOpenModal()}}
            participants={props.participants}
            consumables={props.consumables}
            expense={expense}
            notEmpty={true}
        />
        </>
    );
}
