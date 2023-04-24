import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingModal from "../../components/modals/LoadingModal";
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InfoModal from '../../components/modals/InfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";
import EventuallySmallLogoDark from "../../resources/images/EventuallySmallLogoDark.png";
import EventuallySmallLogoLight from "../../resources/images/EventuallySmallLogoLight.png";

export default function ServiceInvitationPage() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event_id = urlParams.get('event_id');
    const service_id = urlParams.get('service_id');
    const date_service = urlParams.get('date_service');
    const time_service = urlParams.get('time_service');

    const year = new Date().getFullYear();

    //States
    const [ event, setEvent] = useState();
    const [ service, setService] = useState();
    const [ modalLoading, setModalLoading ] = useState(false);
    const [ showSuccessModal, setShowSuccessModal ] = useState(false);
    const [ successMessage, setSuccessMessage ] = useState(false);
    const [ city, setCity] = useState('');
    const [ province, setProvince] = useState('');
    const [ navigateUrl, setNavigateUrl] = useState('/events');

    const navigate = useNavigate();

    //Gets the event info from the api when the component first loads
    useEffect(()=>{
        // if (!event_id) navigate('/');
        getEvent();
    },[])

    const getEvent = async () => {
                
        setModalLoading(prev=>prev+1); // Acivates the loading modal
        try{
            const resEvent = await axios.get(`../api/event/getEventInfo?event_id=${event_id}`);
            const resService = await axios.get(`../api/service/getService?service_id=${service_id}`);
            //console.log(resService.data);
            setEvent(resEvent.data);
            getLocationNames(resEvent.address);
            setService(resService.data);
        } catch (error){
        }
        setModalLoading(prev=>prev-1); // Deativates the loading modal
    }

    const getLocationNames = async (address) => {
        if (!address) return;
        const {city, province} = await getCityAndProvnice(address);
        setCity(city);
        setProvince(province);
    }

    const handleRespondInvitation = async (accepted) => {
        setModalLoading(prev=>prev+1);
        const params = {
            event_id: event_id,
            accepted: accepted,
            service_id: service_id
        }
        try{
            await axios.put('../api/service/respondConfirmation', params);
            const acceptedMsg = accepted? 'aceptada': 'rechazada';
            if(accepted) setNavigateUrl(`/events/event?event_id=${event_id}`);
            setSuccessMessage(`¡Prestación de servicio ${acceptedMsg} con éxito!`)
            setShowSuccessModal(true);
        } catch ( error ) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    return (
        <div className="body d-flex flex-column invite">
            <div style={{backgroundColor: "var(--card)"}}>
                <img src={EventuallySmallLogoLight} style={{height: "5vh"}} className="m-2"/>
            </div>
            <div className="EventsPage d-flex flex-column align-items-center flex-grow-1">
                <div className="row justify-content-center w-80-sm" style={{ margin: "2rem 0"}}>
                    {event && event.creator? <h2>¡{event.creator.name} {event.creator.lastname} quiere contratar tu servicio "{service.name}" para su evento!</h2> : null}
                </div>
                {event?
                <Card className="event-card-invite w-80-sm">
                    <Card.Header style={{backgroundColor: "var(--card)"}}>
                        <h3>{event.title}</h3>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col sm={12} xl={6}>
                                {event.address? 
                                <Form.Group className="d-flex flex-column" controlId="description">
                                    <Form.Label>Dirección</Form.Label>
                                    <h5 className="d-flex gap-2 align-items-center">
                                        <FontAwesomeIcon icon={faLocationDot}/>
                                        {event.address.street} {event.address.number}, {city}, {province}
                                    </h5>
                                </Form.Group> 
                                : null}
                                <Form.Group className="d-flex flex-column" controlId="description">
                                    <Form.Label>Descripción</Form.Label>
                                    <Form.Control as="textarea" name="description" disabled={true} value={event.description}
                                        rows={5}
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6} xl={3}>
                                <Form.Group className="mb-3" controlId="start_date">
                                    <Form.Label className='m-1'>Fecha de inicio</Form.Label>
                                    <Form.Control name="start_date" value={event.start_date} type="date" disabled={true}/>
                                </Form.Group>
                                {event.end_date? 
                                    <Form.Group className="mb-3" controlId="end_date">
                                        <Form.Label className='m-1'>Fecha de fin</Form.Label>
                                        <Form.Control name="end_date" value={event.end_date} type="date" disabled={true}/>
                                    </Form.Group>
                                :null}
                                <Form.Group className="mb-3" controlId="start_date">
                                    <Form.Label className='m-1'>Fecha de inicio servicio</Form.Label>
                                    <Form.Control name="start_date" value={date_service} type="date" disabled={true}/>
                                </Form.Group>
                            </Col>
                            <Col sm={6} xl={3}>
                                <Form.Group className="mb-3" controlId="start_time">
                                    <Form.Label className='m-1'>Hora de inicio</Form.Label>
                                    <Form.Control name="start_time" value={event.start_time} type="time" disabled={true}/>
                                </Form.Group>
                                {event.end_time? 
                                    <Form.Group className="mb-3" controlId="end_time">
                                        <Form.Label className='m-1'>Hora de fin</Form.Label>
                                        <Form.Control name="end_time" value={event.end_time} type="time" disabled={true}/>
                                    </Form.Group>
                                :null}
                                <Form.Group className="mb-3" controlId="start_time">
                                    <Form.Label className='m-1'>Hora de inicio servicio</Form.Label>
                                    <Form.Control name="start_time" value={time_service} type="time" disabled={true}/>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card> :null}
                <div className="my-4 w-80-sm">
                    <h3>Contestales:</h3>
                    <div className="d-flex justify-content-center m-2 add-button gap-5">
                        <Button className="btn btn-success invitation-btn d-flex px-5" onClick={()=>handleRespondInvitation(true)}>
                            Aceptar
                        </Button>
                        <Button className="btn btn-danger invitation-btn d-flex px-5" onClick={()=>handleRespondInvitation(false)}>
                            Rechazar
                        </Button>
                    </div>
                </div>
            </div>
            <div style={{backgroundColor: "var(--card)"}} className="d-flex flex-column align-items-center mt-5">
                <img src={EventuallySmallLogoLight} style={{height: "5vh"}} className="m-1"/>
                <p>@{year} Argentina</p>
            </div>
            <LoadingModal showModal={modalLoading}/>
            <InfoModal
                showModal={showSuccessModal}
                handleCloseModal={()=>{setShowSuccessModal(false); navigate(navigateUrl)}}
                message={successMessage}
                img={SuccessPhoneGirl}
            />
        </div>
    )
}