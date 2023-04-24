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
import { faReply, faPlusCircle, faMinusCircle, faTimesCircle, faCar, faLocationDot, faRoute} from '@fortawesome/free-solid-svg-icons';
import LocationForm from '../LocationForm';
import { getCoordinates, getCityAndProvnice } from '../../services/map.service';
import { getMyUserId, mongoDateToLocalDate } from '../../shared/shared-methods.util';
import TransportRequestModal from './TransportRequestModal';
import TransportRequestReplyModal from './TransportRequestReplyModal';
import MapModal from './MapModal';
import { toast } from 'react-toastify';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

const applications = [
        {
            "user_id": "6372c063852811bad539817f",
            "address": {
                "city": "140077",
                "province": "14",
                "country": "Argentina",
                "street": "Lancún",
                "number": "8243",
                "coordinates": "{\"lat\":-31.3122156,\"lng\":-64.2786862}",
                "alias": "Casa de cami"
            },
            "message": "Me pasas a buscar por mi casa?"
        }
    ];

const subscribers = [
    {username: 'joaquinC', name:'Joaquin Costamagna', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&w=1000&q=80', message: 'Me gustaría que me busques por el patio olmos'},
    {username: 'camila99', name:'Camila Bermejo', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&w=1000&q=80', message: 'Me gustaría que me busques por el patio olmos'},
]

export default function TransportConfigModal( props ) {

    const [ transport, setTransport ] = useState({...props.transport});
    const [ infoModal, setInfoModal ] = useState({showModal: false});
    const [ requestModal, setRequestModal] = useState({showModal: false})
    const [ requestReplyModal, setRequestReplyModal] = useState({showModal: false})
    const [ addressChanged, setAddressChanged ] = useState(false);
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ city, setCity ] = useState('');
    const [ province, setProvince ] = useState('');
    const [ showMapModal, setShowMapModal ] = useState(false);
    
    const myUser = getMyUserId();
    const modify = props.modify && (props.permissions.UPDATE_TRANSPORT && (transport.isOwn || transport.in_charge === myUser ));
    //const modify = false;
    
    useEffect(()=>{
        if (!props.showModal) return;
        getTransport();
        setErrors({});
    },[props.showModal]);
    

    const getLocationNames = async (address) => {
        const {city, province} = await getCityAndProvnice(address);
        setCity(city);
        setProvince(province);
    }

    const getAvailableSpace = (transport) => {
        const subscribersCount = transport.subscribers && transport.subscribers.length? transport.subscribers.length : 0;
        if (!transport.available_seats || subscribersCount > transport.available_seats) return 0;
        return transport.available_seats - subscribersCount;
    }

    const iAmOwner = () => {
        return transport.in_charge && transport.in_charge.user_id === myUser;
    }

    const iAmSubscriber = () =>{
        return transport.subscribers && transport.subscribers.findIndex((subscriber) => (subscriber.user_id === myUser)) != -1;
    }

    const iHaveRequest = () =>{
        return transport.applications && transport.applications.findIndex((application) => (application.user_id === myUser)) != -1;
    }

    const getTransport = async () => {
        setLoading(prev=>prev+1);
        setTransport(props.transport);
        if (props.event_id && props.transport.transport_id){
            try{
                const res = await axios.get(`../api/transport/getTransport?event_id=${props.event_id}&transport_id=${props.transport.transport_id}`);
                const resTransport = res.data;
                setTransport(resTransport);
                console.log(resTransport);
                setAddressChanged(false);
                if (!modify) getLocationNames(resTransport.starting_place)
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }

    const findErrors = () => {
        let newErrors = {};

        const patenteViejaRegEx = /^[A-Z]{3}[0-9]{3}$/;
        const patenteNuevaRegEx = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
        const telephoneRegEx = /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/;

        if (!transport.name || transport.name === '') newErrors.name = "Debe ingresar un nombre"
        if (transport.name && transport.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."
        
        if (!transport.description || transport.description === '') newErrors.description = "Debe ingresar una descripción."
        if (transport.description && transport.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres."

        if (transport.available_seats && isNaN(transport.available_seats)) newErrors.available_seats = "La cantidad de asientos ingresada debe ser un número."
        if (transport.available_seats != undefined && !isNaN(transport.available_seats) && transport.available_seats < 0) newErrors.available_seats = "La cantidad de asientos ingresada debe ser un número positivo."

        if (!transport.phone_contact || transport.phone_contact === '') newErrors.phone_contact = "Debe ingresar un número de teléfono."
        else if (transport.phone_contact && transport.phone_contact.length > 16) newErrors.phone_contact = "El número de teléfono no puede superar los 16 caracteres."
        else if (!transport.phone_contact.match(telephoneRegEx)) newErrors.phone_contact = "Por favor ingrese un número de teléfono válido."

        if (!transport.patent || transport.patent === '') newErrors.patent = "Debe ingresar una patente del vehículo."
        else if (!transport.patent.match(patenteViejaRegEx) && !transport.patent.match(patenteNuevaRegEx)) newErrors.patent = "Por favor ingrese una patente con formato correcto AAA000 o AA000AA."
        
        if (transport.starting_place && transport.starting_place.province === '') newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, province: "Debe seleccionar una provincia."}};
        if (transport.starting_place && transport.starting_place.city === '') newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, city: "Debe seleccionar una ciudad."}};
        if (transport.starting_place && transport.starting_place.street === '') newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, street: "Debe ingresar una calle."}};
        if (transport.starting_place && transport.starting_place.number === '') newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "Debe ingresar una altura."}};

        if (transport.starting_place && transport.starting_place.street && transport.starting_place.street.length > 30) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, street: "El nombre de la calle no puede superar los 30 caracteres."}};
        
        if (transport.starting_place && transport.starting_place.number && transport.starting_place.number.length > 5) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "La altura no puede superar los 5 dígitos."}};
        if (transport.starting_place && transport.starting_place.number && transport.starting_place.number <= 0) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "La altura debe ser un número mayor a 0."}};
        if (transport.starting_place && transport.starting_place.number && !Number.isInteger(parseFloat(transport.starting_place.number))) newErrors = {...newErrors, starting_place: { ...newErrors.address, number: "La altura debe ser un número entero."}};

        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrorFromResponse(field, errorMsg);
            });
        } catch (error) {}
    }

    const setErrorFromResponse = (errorField, errorMsg) =>{
        if (errorField && errorField.includes('.')){
            const errorFieldArray = errorField.split('.');
            let stringErrorObj = '';
            for (let field of errorFieldArray) {
                stringErrorObj += `{"${field}": `
            }
            stringErrorObj += `"${errorMsg}"` + '}'.repeat(errorFieldArray.length);
            setErrors(prev => ({...prev, ...JSON.parse(stringErrorObj)}));
        } else {
            setErrors(prev=> ({...prev, [errorField]: errorMsg}));
        }
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (name === 'patent') value = value.toUpperCase().trim();

        setTransport({...transport, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleOnChangeAddress = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setTransport({...transport, starting_place: {...transport.starting_place, [name]: value}});
        if ( !!errors.starting_place[name] ) setErrors({...errors, starting_place:{...errors.starting_place, [name]: null}});
        setAddressChanged(true);
    }

    const handleOnChangeAmount = (e) => {
        const value = e.target.value;
        if (isNaN(value)) return;
    
        if (value >= 0 && value < 100) setTransport({...transport, available_seats: Number(value)});
        if ( !!errors.amount ) setErrors({...errors, available_seats: null});
    }

    const handleSetAddress = (address) => {
        setTransport(prev => ({...prev, starting_place: address}));
        setAddressChanged(true);
    }

    const handleSubscribeTransport = () => {
        setRequestModal({showModal: true, transport: transport});
        props.handleCloseModal();
    }

    const handleUnsubscribeTransport = async (user_id) => {
        setLoading(prev=>prev+1);
        try {
            const params = {
                user_id: user_id,
                event_id: props.event_id,
                transport_id: transport.transport_id
            }
            await axios.post('../api/transport/unsubscribeToTransport', params);
            if (user_id === myUser) toast.success('Desuscrito de transporte con éxito.');
            getTransport();
            props.reloadEvent();
        } catch (error) {
            console.log(error);
        }
        setLoading(prev=>prev-1);
    }

    const handleReplyRequest = (request) => {
        setRequestReplyModal({showModal: true, request: request, reply: true});
        props.handleCloseModal();
    }

    const handleViewSubscriber = (request) => {
        setRequestReplyModal({showModal: true, request: request, reply: false});
        props.handleCloseModal();
    }

    const handleCloseRequestModal = () => {
        setRequestModal({showModal: false});
        props.handleOpenModal();
    }

    const handleCloseRequestReplyModal = () => {
        setRequestReplyModal({showModal: false});
        props.handleOpenModal();
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
            setLoading(prev=>prev+1);
            const params = {
                ...transport,
                event_id: props.event_id,
            }
            delete params.in_charge;
            if (addressChanged) params.starting_place.coordinates = transport.starting_place? JSON.stringify(await getCoordinates(transport.starting_place)): '';
            try {
                await axios.put('../api/transport/updateTransport', params);
                props.handleCloseModal();
                setInfoModal({showModal: true, message: '¡Transporte modificado con éxito!'});
            } catch (error) {
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }

    const calculateRoute = () => {
        let route = 'https://www.google.com/maps/dir/';
        const startingPointAddress = JSON.parse(transport.starting_place.coordinates);
        if (startingPointAddress) route += `${startingPointAddress.lat},${startingPointAddress.lng}`;
        transport.subscribers.forEach(subscriber => {
            let subAddress = JSON.parse(subscriber.address.coordinates);
            route += `/${subAddress.lat},${subAddress.lng}`;
        })
        const eventAddress = JSON.parse(props.eventAddress.coordinates);
        if (eventAddress) route += `/${eventAddress.lat},${eventAddress.lng}`;
        route += '?optimizeWaypointOrder=true'

        return route;
    }

    // const calculateRoute2 = () => {
    //     let route = 'https://www.google.com/maps/dir/?api=1&origin=';
    //     const startingPointAddress = JSON.parse(transport.starting_place.coordinates);
    //     if (startingPointAddress) route += `${startingPointAddress.lat},${startingPointAddress.lng}`;
    //     const eventAddress = JSON.parse(props.eventAddress.coordinates);
    //     if (eventAddress) route += `&destination=${eventAddress.lat},${eventAddress.lng}`;
    //     route += '&waypoints='
    //     transport.subscribers.forEach(subscriber => {
    //         let subAddress = JSON.parse(subscriber.address.coordinates);
    //         route += `${subAddress.lat},${subAddress.lng}|`;
    //     })
    //     route = route.substring(0, route.length - 1);
    //     route += '&optimizeWaypointOrder=true'

    //     return route;
    // }

    return (
        <>
            <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" size="lg" className='Modal'>
                <Modal.Header>
                    <div className="w-100 mx-3">
                        <Row>
                            <Col className="flex-grow-1">
                                <span>Transporte</span>
                                <Modal.Title>{transport.name}</Modal.Title>
                                <p style={{wordBreak: "break-word", marginBottom: "0"}}>{transport.description}</p>
                            </Col>
                            <Col className="flex-grow-0 d-flex flex-column align-items-end me-3 mt-3 justify-content-center">
                                {!modify?
                                    loading?
                                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>
                                        :
                                        <CloseButton onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}></CloseButton> 
                                    :null}
                            </Col>
                        </Row>
                    </div>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    {modify?
                        <>
                            {loading  || true && false?
                                <div className="d-flex flex-column gap-2" style={{width: '90%'}}>
                                    <div className="d-flex gap-2 m-1 w-100">
                                        <Placeholder animation="wave" className="my-1 rounded flex-grow-1"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem'}}
                                        />
                                        <Placeholder animation="wave" className="my-1 rounded flex-grow-0"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '40%'}}
                                        />
                                    </div>
                                    <Placeholder animation="wave" className="m-1 rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '6rem', width: '100%'}}
                                    />
                                    <Placeholder animation="wave" className="m-1 rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                                    />
                                    <Placeholder animation="wave" className="m-1 rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                                    />
                                    <div className="d-flex gap-2 m-1 w-100">
                                        <Placeholder animation="wave" className="my-1 rounded flex-grow-1"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem'}}
                                        />
                                        <Placeholder animation="wave" className="my-1 rounded flex-grow-0"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '40%'}}
                                        />
                                    </div>
                                    <div className="d-flex gap-1 mt-5">
                                        <Placeholder animation="wave" className="m-1 rounded" 
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                                        />
                                        <Placeholder animation="wave" className="m-1 rounded" 
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                                        />
                                    </div>
                                    <Placeholder animation="wave" className="m-1 rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '6rem', width: '100%'}}
                                    />
                                </div>
                                :
                                <Form style={{width: '90%'}} onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12} md={8}>
                                            <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                                                <Form.Label>Nombre <span className="text-tertiary">*</span></Form.Label>
                                                <Form.Control isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off" disabled={!props.modify} 
                                                            value={transport.name} maxLength={50} onChange={handleOnChange}/>
                                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                                                <Form.Label>Cantidad de asientos <span className="text-tertiary">*</span></Form.Label>
                                                <div className="d-flex">
                                                    <Form.Control type="text" autoComplete="off" isInvalid={ !!errors.available_seats } placeholder="" name="available_seats" disabled={!props.modify} 
                                                            value={transport.available_seats} onChange={handleOnChangeAmount} 
                                                            style={{borderRadius: "0.5rem"}}/>
                                                </div>
                                                <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.available_seats}</span>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-2 d-flex flex-column" controlId="description">
                                        <Form.Label>Descripción del transporte</Form.Label>
                                        <Form.Control as="textarea" isInvalid={ !!errors.description } placeholder="" name="description" disabled={!props.modify} 
                                                    value={transport.description} onChange={handleOnChange} maxLength={500}/>
                                        {props.modify? <Form.Text className="text-end">{transport.description?  transport.description.length: 0} de 500</Form.Text> : null}
                                        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-2 d-flex flex-column" controlId="phone_contact">
                                        <Form.Label className="mb-0">Número de contacto <span className="text-tertiary">*</span></Form.Label>
                                        <span className="text-muted" style={{fontSize:'0.9rem'}}>Sin espacios ni caracteres especiales</span>
                                        <Form.Control isInvalid={ !!errors.phone_contact } placeholder="" name="phone_contact"
                                                    value={transport.phone_contact} maxLength={16} onChange={handleOnChange}/>
                                        <Form.Control.Feedback type="invalid">{errors.phone_contact}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-2 d-flex flex-column mb-3" controlId="patent">
                                        <Form.Label className="mb-0">Patente del vehículo <span className="text-tertiary">*</span></Form.Label>
                                        <span className="text-muted" style={{fontSize:'0.9rem'}}>Sin espacios ni caracteres especiales</span>
                                        <Form.Control isInvalid={ !!errors.patent } placeholder="" name="patent"
                                                    value={transport.patent} maxLength={7} onChange={handleOnChange}/>
                                        <Form.Control.Feedback type="invalid">{errors.patent}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Row className="d-flex align-items-start mb-1">
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-1" controlId="start_date">
                                                <Form.Label className='mb-1'>Fecha de partida </Form.Label>
                                                <Form.Control name="start_date" isInvalid={ !!errors.start_date } value={transport.start_date} type="date" disabled={!modify} onChange={handleOnChange}/>
                                                <Form.Control.Feedback type="invalid">{errors.start_date}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group className="mb-1" controlId="start_time">
                                                <Form.Label className='mb-1'>Hora partida </Form.Label>
                                                <Form.Control name="start_time"isInvalid={ !!errors.start_time} value={transport.start_time} type="time" disabled={!modify} onChange={handleOnChange}></Form.Control>
                                                <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <h4>Lugar de partida</h4>
                                        <div className="px-3 pt-0 pb-4">
                                            <LocationForm address={transport.starting_place} errors={errors.starting_place} handleOnChange={handleOnChangeAddress} modify={props.modify} handleSetAddress={handleSetAddress} changedAddress={addressChanged}/>
                                        </div>
                                    </Row>
                                </Form>
                            }
                        </>
                        :
                        <>
                            {loading?
                                <div className="d-flex flex-column gap-2" style={{width: '90%'}}>
                                    <div className="w-100 d-flex gap-1 flex-column">
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 20rem)'}}
                                        />
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 18rem)'}}
                                        />
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 30rem)'}}
                                        />
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 25rem)'}}
                                        />
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 15rem)'}}
                                        />
                                        <Placeholder animation="wave" className="mx-1 rounded"
                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: 'min(100%, 15rem)'}}
                                        />
                                    </div>
                                    <Placeholder animation="wave" className="mt-1 mb-3 mx-auto rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: '15rem'}}
                                    />
                                    <Placeholder animation="wave" className="m-1 rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '4rem', width: '100%'}}
                                    />
                                </div>
                                :
                                <div className="d-flex flex-column gap-2 w-100 px-3">
                                    <div className="d-flex gap-2">
                                        <h4 className="m-0">Teléfono de contacto:</h4><span className="m-0">{transport.phone_contact}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <h4 className="m-0">Patente del vehículo:</h4><span className="m-0">{transport.patent}</span>
                                    </div>
                                    {transport.starting_place?
                                        <div className="d-flex gap-2">
                                            <h4 className="m-0">Lugar de partida:</h4>
                                            <span className="m-0">{transport.starting_place.street} {transport.starting_place.number}, {city}, {province}, Argentina </span>
                                            <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={()=>setShowMapModal(true)}>
                                                <FontAwesomeIcon icon={faLocationDot}/>
                                            </Button>
                                        </div> 
                                    : null}
                                    <div className="d-flex gap-2">
                                        <h4 className="m-0">Fecha y hora de partida:</h4><span className="m-0">{transport.start_date?mongoDateToLocalDate(transport.start_date): ''} {transport.start_time} hs</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <h4 className="m-0">Responsable:</h4><span className="m-0">{transport.in_charge? transport.in_charge.username: ''}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <h4 className="m-0">Asientos disponibles:</h4><span className="m-0">{getAvailableSpace(transport)}</span>
                                    </div>
                                </div>
                            }
                        </>
                    }
                    {!iAmOwner() && !iAmSubscriber() && !iHaveRequest() && getAvailableSpace(transport) > 0 && !loading? 
                        <div className='d-flex w-100 justify-content-center'>
                            <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1 mt-2" onClick={handleSubscribeTransport}>
                                <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                &nbsp;Suscribirse a transporte
                            </Button>
                        </div>
                    : null}
                    {!iAmOwner() && iAmSubscriber() && !loading?
                        <div className='d-flex w-100 justify-content-center'>
                            <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1 mt-2" onClick={()=>handleUnsubscribeTransport(myUser)}>
                                <FontAwesomeIcon size="lg" icon={faMinusCircle}/>
                                &nbsp;Desuscribirse a transporte
                            </Button>
                        </div>
                    :null}
                    {iAmOwner() && !loading?
                    <div className="d-flex flex-column align-items-start w-100 p-3">
                        <h5 className="text-start">Solicitudes</h5>
                        <div className="transport-request-list">
                            {transport.applications && transport.applications.length?
                                transport.applications.map((application, key)=>(
                                    <div className="transport-request-card" key={key}>
                                        {/* <div className="flex-grow-0">
                                            <img src={application.photo} alt=""/>
                                        </div> */}
                                        <div className="flex-grow-1 d-flex flex-column justify-content-center ms-3">
                                            <h5 className='m-0'>{application.name} {application.lastname}</h5>
                                            <span className='text-muted'>{application.username}</span>
                                        </div>
                                        <div className="d-flex align-items-center pe-3">
                                            <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1 mt-2" title="Responder" onClick={()=>handleReplyRequest(application)}>
                                                <FontAwesomeIcon icon={faReply} style={{fontSize: '1.5rem'}}/>
                                            </Button>
                                        </div>
                                    </div>
                                )) 
                                : 
                                <h5>No hay solicitudes pendientes</h5>
                            }
                        </div>
                    </div> : null}
                    {!loading?
                        <div className="d-flex flex-column align-items-start w-100 p-3">
                            <div className="d-flex gap-3 align-items-center">
                                <h5 className="text-start">Pasajeros</h5>
                                {iAmOwner() && transport.starting_place && props.eventAddress && transport.subscribers && transport.subscribers.length?
                                    <a className="no-decorations mx-auto py-2" href={calculateRoute()} target="_blank">
                                        <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1 mt-2">
                                            <FontAwesomeIcon size="lg" icon={faRoute}/>
                                            &nbsp;Armar ruta en Maps
                                        </Button>
                                    </a>
                                :null
                                }
                            </div>
                            <div className="transport-request-list">
                                {transport.in_charge?
                                    <div className="transport-request-card">
                                        {/* <div className="flex-grow-0">
                                            <img src={transport.in_charge.photo} alt=""/>
                                        </div> */}
                                        <div className="flex-grow-1 d-flex ms-3 gap-3">
                                            <div className="">
                                                <h5 className='m-0'>{transport.in_charge.name} {transport.in_charge.lastname}</h5>
                                                <span className='text-muted'>{transport.in_charge.username}</span>
                                            </div>
                                            <div className=" d-flex align-items-center" title="Dueño del vehículo">
                                                <FontAwesomeIcon icon={faCar} style={{fontSize: '1.5rem', color: 'var(--success-btn-color)'}}/>
                                            </div>
                                        </div>
                                    </div> : null
                                }
                                {transport.subscribers && transport.subscribers.length?
                                    transport.subscribers.map((subscriber, key)=>(
                                        <div className="transport-request-card" key={key}>
                                            {/* <div className="flex-grow-0">
                                                <img src={subscriber.photo} alt=""/>
                                            </div> */}
                                            <div className="flex-grow-1 d-flex flex-column justify-content-center ms-3" onClick={()=>handleViewSubscriber(subscriber)}>
                                                <h5 className='m-0'>{subscriber.name}</h5>
                                                <span className='text-muted'>{subscriber.username}</span>
                                            </div>
                                            {iAmOwner()? <div className="d-flex align-items-center pe-3">
                                                <Button className="delete-btn d-flex" onClick={()=>handleUnsubscribeTransport(subscriber.user_id)} title="Eliminar pasajero">
                                                    <FontAwesomeIcon icon={faTimesCircle}/>
                                                </Button>
                                            </div> : null}
                                        </div>
                                    )) 
                                    : 
                                    null
                                }
                            </div>
                        </div>
                    :null}
                </Modal.Body>
                {modify?
                <Modal.Footer>
                    <Button className="btn-secondary-modal px-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}>
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
                showModal={infoModal.showModal}
                handleCloseModal={()=>{setInfoModal({...infoModal, showModal: false}); props.reloadEvent()}}
                message={infoModal.message}
                img={SuccessPhoneGirl}
            />
            <TransportRequestModal
                showModal={requestModal.showModal}
                handleCloseModal={handleCloseRequestModal}
                transport={requestModal.transport}
                startingPointAddress={transport.starting_place}
                eventAddress={props.eventAddress}
                modify={true}
                event_id={props.event_id}
                user_id={myUser}
                getTransport={getTransport}
            />
            <TransportRequestReplyModal
                showModal={requestReplyModal.showModal}
                noRefresh={requestReplyModal.noRefresh}
                handleCloseModal={handleCloseRequestReplyModal}
                eventAddress={props.eventAddress}
                setReplyModal={setRequestReplyModal}
                request={requestReplyModal.request}
                reply={requestReplyModal.reply}
                transport={transport}
                getTransport={getTransport}
                reloadEvent={props.reloadEvent}
                event_id={props.event_id}
                user_id={myUser}
            />
            <MapModal showModal={showMapModal} handleCloseModal={()=>setShowMapModal(false)} address={transport.starting_place} eventAddress={props.eventAddress}/>
        </>
    )
}
