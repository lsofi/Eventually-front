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
import InfoModal from './InfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faPlusCircle, faMinusCircle, faTimesCircle, faCar, faLocationDot} from '@fortawesome/free-solid-svg-icons';
import LocationForm from '../LocationForm';
import { getCoordinates, getCityAndProvnice } from '../../services/map.service';
import { getMyUserId, mongoDateToLocalDate } from '../../shared/shared-methods.util';
import MapModal from './MapModal';
import { Toast } from 'react-bootstrap';
import moment from 'moment';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function TransportAddModal( props ) {

    const [ transport, setTransport ] = useState({});
    const [ infoModal, setInfoModal ] = useState({showModal: false});
    const [ addressChanged, setAddressChanged ] = useState(false);
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ showMapModal, setShowMapModal ] = useState(false);
    
    const myUser = getMyUserId();
    
    useEffect(()=>{
        setTransport({});
        setErrors({});
    },[props.showModal]);
    
    const findErrors = () => {
        let newErrors = {};

        const patenteViejaRegEx = /^[A-Z]{3}[\d]{3}$/;
        const patenteNuevaRegEx = /^[A-Z]{2}[\d]{3}[A-Z]{2}$/;
        const telephoneRegEx = /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/;

        if (!transport.name || transport.name === '') newErrors.name = "Debe ingresar un nombre."
        if (transport.name && transport.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."
        
        if (!transport.description || transport.description === '') newErrors.description = "Debe ingresar una descripción."
        if (transport.description && transport.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres."
        
        if (transport.available_seats == undefined) newErrors.available_seats = "Debe ingresar un número de asientos."
        if (transport.available_seats && isNaN(transport.available_seats)) newErrors.available_seats = "La cantidad de asientos ingresada debe ser un número."
        if (transport.available_seats != undefined && !isNaN(transport.available_seats) && transport.available_seats <= 0) newErrors.available_seats = "La cantidad de asientos ingresada debe ser un número positivo."

        if (!transport.phone_contact || transport.phone_contact === '') newErrors.phone_contact = "Debe ingresar un número de teléfono."
        else if (transport.phone_contact && transport.phone_contact.length > 16) newErrors.phone_contact = "El número de teléfono no puede superar los 16 caracteres."
        else if (!transport.phone_contact.match(telephoneRegEx)) newErrors.phone_contact = "Por favor ingrese un número de teléfono válido."

        if (!transport.patent || transport.patent === '') newErrors.patent = "Debe ingresar una patente del vehículo."
        else if (!transport.patent.match(patenteViejaRegEx) && !transport.patent.match(patenteNuevaRegEx)) newErrors.patent = "Por favor ingrese una patente con formato correcto AAA000 o AA000AA."

        //Errores de la ubicación

        if (!transport.starting_place || (transport.starting_place && (!transport.starting_place.province || transport.starting_place.province === ''))) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, province: "Debe seleccionar una provincia."}};
        if (!transport.starting_place || (transport.starting_place && (!transport.starting_place.city || transport.starting_place.city === ''))) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, city: "Debe seleccionar una ciudad."}};
        if (!transport.starting_place || (transport.starting_place && (!transport.starting_place.street || transport.starting_place.street === ''))) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, street: "Debe ingresar una calle."}};
        if (!transport.starting_place || (transport.starting_place && (!transport.starting_place.number || transport.starting_place.number === ''))) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "Debe ingresar una altura."}};

        if (transport.starting_place && transport.starting_place.street && transport.starting_place.street.length > 30) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, street: "El nombre de la calle no puede superar los 30 caracteres."}};
        if (transport.starting_place && transport.starting_place.number && transport.starting_place.number.length > 5) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "La altura no puede superar los 5 dígitos."}};
        if (transport.starting_place && transport.starting_place.number && transport.starting_place.number <= 0) newErrors = {...newErrors, starting_place: { ...newErrors.starting_place, number: "La altura debe ser un número mayor a 0."}};
        if (transport.starting_place && transport.starting_place.number && !Number.isInteger(parseFloat(transport.starting_place.number))) newErrors = {...newErrors, starting_place: { ...newErrors.address, number: "La altura debe ser un número entero."}};

        //Errores de la fecha
        if(!transport.start_date) newErrors.start_date = "Debe ingresar una fecha de partida."
        if(!transport.start_time) newErrors.start_time = "Debe ingresar una hora de partida."
        if (transport.start_date && transport.start_time){
            if(moment(`${transport.start_date} ${transport.start_time}`).isBefore(moment())) newErrors.start_date_time = "La fecha y hora de partida no puede ser menor a la fecha y hora actual."
        }
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

        if (name === 'patent') value = value.toUpperCase();

        setTransport({...transport, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
        if ( (name === "start_date" || "start_time") && !!errors.start_date_time ) setErrors({...errors, start_date_time: null})

    }

    const handleOnChangeAddress = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        console.log("Transporte con cambio de dirección", {...transport, starting_place: {...transport.starting_place, [name]: value}})
        setTransport({...transport, starting_place: {...transport.starting_place, [name]: value}});
        if ( !!errors.starting_place && !!errors.starting_place[name] ) setErrors({...errors, starting_place:{...errors.starting_place, [name]: null}});
        setAddressChanged(true);
    }

    const handleOnChangeAmount = (e) => {
        const value = e.target.value;
        if (isNaN(value)) return;
        if (value >= 0 && value < 100) setTransport({...transport, available_seats: Number(value)});
        if ( !!errors.available_seats ) setErrors({...errors, available_seats: null});
    }

    const handleSetAddress = (address) => {
        setTransport(prev => ({...prev, starting_place: address}));
        if ( !!errors.starting_place) setErrors({...errors, starting_place: null})
        setAddressChanged(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(transport);
        // get our new errors
        const newErrors = findErrors();
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
            console.log("Errores", newErrors)
        } else {
            setLoading(prev=>prev+1);
            const params = {
                ...transport,
                event_id: props.event_id,
            }
            if (addressChanged) params.starting_place.coordinates = transport.starting_place? JSON.stringify(await getCoordinates(transport.starting_place)): '';
            try {
                await axios.post('../api/transport/createTransport', params);
                props.handleCloseModal();
                setInfoModal({showModal: true, message: '¡Transporte creado con éxito!'});
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
                        <Modal.Title>Agregar Transporte</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    <Form style={{ width: '90%' }} onSubmit={handleSubmit}>
                        <Row>
                            <Col xs={12} md={8}>
                                <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                                    <Form.Label>Nombre <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control 
                                        isInvalid={!!errors.name} 
                                        placeholder="" 
                                        name="name" autoComplete="off"
                                        value={transport.name} 
                                        maxLength={50} 
                                        onChange={handleOnChange} 
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={4}>
                                <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                                    <Form.Label>Asientos disponibles <span className="text-tertiary">*</span></Form.Label>
                                    <div className="d-flex">
                                        <Form.Control 
                                            type="text" autoComplete="off" 
                                            isInvalid={!!errors.available_seats} 
                                            placeholder="" 
                                            name="available_seats"
                                            value={transport.available_seats}  
                                            onChange={handleOnChangeAmount}
                                            style={{ borderRadius: "0.5rem" }} 
                                        />
                                    </div>
                                    <span className="text-danger mt-1" style={{ fontSize: '0.9rem' }}>{errors.available_seats}</span>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-2 d-flex flex-column" controlId="description">
                            <Form.Label>Descripción del transporte <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control 
                                as="textarea"
                                isInvalid={!!errors.description}
                                placeholder=""
                                name="description"
                                value={transport.description}
                                onChange={handleOnChange}
                                maxLength={500}
                            />
                            <Form.Text className="text-end">{transport.description ? transport.description.length : 0} de 500</Form.Text>
                            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex flex-column" controlId="phone_contact">
                            <Form.Label className="mb-0">Número de contacto <span className="text-tertiary">*</span></Form.Label>
                            <span className="text-muted">Sin espacios ni caracteres especiales</span>
                            <Form.Control 
                                isInvalid={!!errors.phone_contact} 
                                placeholder="" 
                                name="phone_contact"
                                value={transport.phone_contact} 
                                maxLength={16} 
                                onChange={handleOnChange}
                            />
                            <Form.Control.Feedback type="invalid">{errors.phone_contact}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex flex-column mb-3" controlId="patent">
                            <Form.Label className="mb-0">Patente del vehículo <span className="text-tertiary">*</span></Form.Label>
                            <span className="text-muted">Sin espacios ni caracteres especiales</span>
                            <Form.Control 
                                isInvalid={!!errors.patent}
                                placeholder=""
                                name="patent"
                                value={transport.patent}
                                maxLength={7}
                                onChange={handleOnChange}
                            />
                            <Form.Control.Feedback type="invalid">{errors.patent}</Form.Control.Feedback>
                        </Form.Group>
                        <Row className="d-flex align-items-start">
                            <Col xs={6} md={6}>
                                <Form.Group className="mb-2" controlId="start_date">
                                    <Form.Label className='m-1'>Fecha de partida <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control 
                                        name="start_date" 
                                        isInvalid={!!errors.start_date}
                                        value={transport.start_date}
                                        type="date"
                                        onChange={handleOnChange}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.start_date}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={6} md={6}>
                                <Form.Group className="mb-2" controlId="start_time">
                                    <Form.Label className='m-1'>Hora de partida <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control 
                                        name="start_time" 
                                        isInvalid={!!errors.start_time}
                                        value={transport.start_time}
                                        type="time"
                                        onChange={handleOnChange}>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <span className="text-danger" style={{fontSize: '0.9rem'}}>{errors.start_date_time}</span>
                        </Row>
                        <Row>
                            <h4>Lugar de partida</h4>
                            <div className="px-3 pt-0 pb-4">
                                <LocationForm 
                                    address={transport.starting_place}
                                    errors={errors.starting_place}
                                    handleOnChange={handleOnChangeAddress}
                                    modify={true}
                                    handleSetAddress={handleSetAddress}
                                    eventAddress={props.eventAddress}
                                    changedAddress={true}
                                />
                            </div>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                        Cancelar
                    </Button>
                    {!loading 
                    ?
                        <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
                            Agregar
                        </Button> 
                    :
                        <Button className="btn-primary-modal px-3" disabled>
                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />&nbsp;Cargando...
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
            <InfoModal
                showModal={infoModal.showModal}
                handleCloseModal={() => { setInfoModal({ ...infoModal, showModal: false }); props.reloadEvent() }}
                message={infoModal.message}
                img={SuccessPhoneGirl}
            />
            <MapModal 
                showModal={showMapModal} 
                handleCloseModal={() => setShowMapModal(false)} 
                address={transport.starting_place}
            />
        </>
    )
}
