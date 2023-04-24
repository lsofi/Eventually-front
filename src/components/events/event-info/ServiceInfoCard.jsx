import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faInfoCircle, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Alert from "react-bootstrap/Alert";
import { mongoDateToLocalDate } from '../../../shared/shared-methods.util';
import Badge from 'react-bootstrap/Badge';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';
import InfoModal from '../../modals/InfoModal';
import Rating from '@mui/material/Rating';
import { cardActionAreaClasses } from '@mui/material';

import SuccessPhoneGirl from "../../../resources/images/SuccessPhoneGirl.png";

export default function ServiceInfoCard( props ) {

    const [ listHeight, setListHeight ] = useState(40);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ infoModal, setInfoModal ] = useState({show: false});

    const helpText = 'En esta tarjeta podrás gestionar los servicios contratados para el evento.';

    const navigate = useNavigate();

    const getResponseClass = (accepted) => {
        if (accepted === true) return 'success';
        else if (accepted === false) return 'danger';
        else return 'warning';
    }

    const getResponseMessage = (accepted) => {
        if (accepted === true) return 'Confirmó';
        else if (accepted === false) return 'No aceptó';
        else return 'No respondió';
    }

    const deleteServiceConfirmation = (service) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar el servicio "${service.name}" del evento?`,
            service: service, 
            show: true}));
    }

    const confirmDeleteService = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteService(deleteConfirmationModal.service);
    }

    const handleRateService = async (e, service) => {
        const value = e.target.value;
        if (isNaN(value)) return;
        const params = {
            rate: Number(value),
            service_id: service.service_id,
            event_id: props.event.event_id
        }
        props.setModalLoading(prev => prev + 1);
        try {
            await axios.post('../api/service/qualifyService', params);
            setInfoModal({show: true, message: `¡Servicio ${service.name} calificado con éxito!`})
        } catch (error) {}
        props.setModalLoading(prev => prev - 1);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="list-container-container">
                    <div className='d-flex justify-content-between'>
                        <div className="d-flex gap-3 align-items-center">
                            <h4 className="mb-0">Servicios</h4>
                            <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                                <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                            </OverlayTrigger>
                            <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                        </div>
                        {props.event.services && props.modify && props.event.services.length === 0 && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('services')}/>: null}
                    </div>
                    <hr className="mx-0 my-1" style={{height: '2px'}}/>
                    <div className="list-container" style={{maxHeight: `${listHeight}rem`}}>
                        {props.event.services && props.event.services.length? props.event.services.map((service, key) => {
                            return (
                                <Card key={key} className='m-1 participant-info'>
                                    <Card.Body style={{borderRadius: "0.5rem", position: "relative"}}>
                                        <Row className="px-3">
                                            <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                <img src={service.photo? service.photo : "https://www.voicemailtel.com/wp-content/uploads/2015/09/Customer-service.png"} className="organizer-photo m-0"></img>
                                            </Col>
                                            <Col className='d-flex flex-column justify-content-center flex-grow-1'>
                                                <div>
                                                    <h6 className='m-0'>{service.name}</h6>
                                                    {/* <span><FontAwesomeIcon icon={faUser}/> {service.providerString}</span> */}
                                                    <span>{mongoDateToLocalDate(service.date_service) + ' ' + service.time_service}</span>
                                                </div>
                                                {props.event.state ==='postEvent' && service.accepted? 
                                                    <div>
                                                        <OverlayTrigger key={'rating'} placement={'right'} overlay={<Tooltip id={'tooltip-rating'}>Calificá este servicio</Tooltip>}>
                                                            <Rating className="rating-service-event" precision={0.5} value={service.rating_event} disabled={!!service.rating_event} onChange={(e)=>handleRateService(e, service)}/>
                                                        </OverlayTrigger>
                                                    </div>
                                                : null}
                                            </Col>
                                            <Col className="d-flex align-items-center flex-grow-0 pe-0">
                                                <Alert className="service-type-alert-info">{service.type}</Alert>
                                            </Col>
                                            <Col className="d-flex align-items-center flex-grow-0 ">
                                                <Badge pill bg={getResponseClass(service.accepted)} text={service.accepted !== null? "white" : "dark"}>{getResponseMessage(service.accepted)}</Badge>{' '}
                                            </Col>
                                        </Row>
                                        {props.modify && props.event.permissions.DELETE_SERVICE_TO_EVENT? 
                                            <Button 
                                                className="delete-btn d-flex"
                                                title="Eliminar servicio de evento"
                                                style={{position: 'absolute', top: '0.5rem', right: '0.5rem'}} 
                                                onClick={()=>deleteServiceConfirmation(service)}
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle}/>
                                            </Button>
                                        :null}
                                    </Card.Body>
                                </Card>
                            );
                        }): 
                        props.event.services && !props.event.services.length?
                            <p>No hay servicios todavía</p>
                        :null}
                    </div>
                    {props.modify && props.event.permissions.ADD_SERVICE_TO_EVENT?<div className='d-flex justify-content-center m-2 add-button'>
                        <Button className="btn btn-primary-body btn-add d-flex" onClick={()=> navigate('/services')}>
                            <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            &nbsp;Agregar servicio
                        </Button>
                    </div>:null}
                </div>
            </div>
        </CardOrModal>
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar servicio"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteService}
        />
        <InfoModal
            showModal={infoModal.show}
            message={infoModal.message}
            handleCloseModal={()=>{setInfoModal({show: false}); props.reloadEvent();}}
            img={SuccessPhoneGirl}
        />
        </>
    )
}
