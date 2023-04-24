import React, { useState }  from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faUser, faExpand, faCompress, faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from "react-bootstrap/Popover";
import Tooltip from 'react-bootstrap/Tooltip';
import UserAddModal from '../../modals/UserAddModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

import DefaultProfilePhotoDog from "../../../resources/images/DefaultProfilePhotoDog.png"

export default function GuestsInfoCard(props) {
    
    const [ showUserAdd, setShowUserAdd ] = useState(false);
    const [ loadingState, setLoadingState ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ userAdd, setUserAdd ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ listHeight, setListHeight ] = useState(20);
    const [ inviteLink, setInviteLink ] = useState('');
    const [ loadingInviteLink, setLoadingInviteLink ] = useState(false);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({})

    const helpText = 'En esta tarjeta podrás gestionar los invitados del evento, puedes invitar usuarios ingresando su nombre de usuario o su dirección de correo, o también puedes generar un link de invitación para que los usuarios se unan al evento como invitados.';

    const findErrors = () => {
        const newErrors = {};
        if (!userAdd.user || userAdd.user === '') newErrors.guests = "Por favor ingrese el nombre de usuario o email del invitado."
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

    const handleOnCancel = () => {
        setShowUserAdd(false);
        setUserAdd({});
        setErrors({});
        setInviteLink('');
    }

    const getInviteLink = async () => {
        try{
            setLoadingInviteLink(true);
            const res = await axios.get(`../api/event/generateInvitationLink?event_id=${props.event.event_id}`)
            const resData = res.data;
            setInviteLink(resData);
        } catch(error){
        }
        setLoadingInviteLink(false)
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const setFilterResponse = (response) => {
        setFilters(prev => ({...prev, response: response}));
    }

    const getGuestsStatus = () => {
        const guests = props.event.guests;
        const total = guests.length;
        let accepted = 0;
        let declined = 0;
        let noResponse = 0;

        guests.forEach(guest => {
            if (guest.accepted === true) accepted += 1;
            else if (guest.accepted === false) declined += 1;
            else noResponse += 1;
        })

        return [total, accepted, declined, noResponse]
    }

    const guestsStatus = getGuestsStatus();

    const getGuestsFilters = () => {

        const response = filters.response === 'Sin respuesta'? null : filters.response === 'true'? true : false;
        
        return props.event.guests.filter(guest => {
            let nameFilter = true;
            let responseFilter = true;

            if (filters.name) nameFilter = `${guest.name} ${guest.lastname}`.toLowerCase().includes(filters.name.toLowerCase().trim());
            if (filters.response) responseFilter = guest.accepted == response;

            return true && nameFilter && responseFilter
        })
    }

    const handleOnConfirm = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        }
        else {
            setLoadingState(true);
            try{
                const params = { event_id: props.event.event_id};
                if (userAdd.user.includes('@')) params.email = userAdd.user;
                else params.username = userAdd.user;
                const res = await axios.post('../api/guest/registerGuest', params);
                if (res.data.errors && res.data.errors.length > 0){
                    setErrors({user: res.data.errors[0]});
                } else {
                    setShowUserAdd(false);
                    setInviteLink('');
                    props.reloadEvent();
                }
            } catch (error){
                setResponseErrors(error);
            }
            setLoadingState(false);
        }
    }

    const deleteGuestConfirmation = (guest) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar a ${guest.name} ${guest.lastname} como invitado/a del evento?`,
            guest: guest, 
            show: true}));
    }

    const confirmDeleteGuest = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteGuest(deleteConfirmationModal.guest);
    }

    const getResponseClass = (accepted) => {
        if (accepted === true) return 'success';
        else if (accepted === false) return 'danger';
        else return 'warning';
    }

    const getResponseMessage = (accepted) => {
        if (accepted === true) return 'Asistirá';
        else if (accepted === false) return 'No asistirá';
        else return 'No respondió';
    }

    const handleOnChangeUser = (username) =>{
        const name = "user";
        const value = username;
        setUserAdd({[name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const verifyEventStatus = () => {
        if (['created', 'ongoing', 'delayed'].includes(props.event.state)) return true;
        return false
    }
    

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className='d-flex justify-content-between'>
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Invitados</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>{setCardOrModalShow(prev => !prev); setFilters({})}}/>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                        {props.event.guests && props.event.guests.length?
                            <>
                                <OverlayTrigger key={'total'} placement={'bottom'} overlay={<Tooltip id={'tooltip-total'}>Invitaciones totales</Tooltip>}>
                                    <div className='d-flex gap-1 align-items-center pointer' style={{color: 'var(--text-title)'}} onClick={()=> setFilterResponse(undefined)}>
                                        <FontAwesomeIcon icon={faUser}/>
                                        {guestsStatus[0]}
                                    </div>
                                </OverlayTrigger>
                                <OverlayTrigger key={'accepted'} placement={'bottom'} overlay={<Tooltip id={'tooltip-accepted'}>Aceptadas</Tooltip>}>
                                    <div className='d-flex gap-1 align-items-center pointer' style={{color: 'var(--success-btn-color)'}}  onClick={()=> setFilterResponse('true')}>
                                        <FontAwesomeIcon icon={faUser}/>
                                        {guestsStatus[1]}
                                    </div>
                                </OverlayTrigger>
                                <OverlayTrigger key={'declined'} placement={'bottom'} overlay={<Tooltip id={'tooltip-declined'}>Rechazadas</Tooltip>}>
                                    <div className='d-flex gap-1 align-items-center pointer' style={{color: 'var(--danger-btn-color)'}}  onClick={()=> setFilterResponse('false')}>
                                        <FontAwesomeIcon icon={faUser}/>
                                        {guestsStatus[2]}
                                    </div>
                                </OverlayTrigger>
                                <OverlayTrigger key={'noAnswer'} placement={'bottom'} overlay={<Tooltip id={'tooltip-noAnswer'}>Sin respuesta</Tooltip>}>
                                    <div className='d-flex gap-1 align-items-center pointer' title='Sin respuesta' style={{color: '#ffc107'}}  onClick={()=> setFilterResponse('Sin respuesta')}>
                                        <FontAwesomeIcon icon={faUser}/>
                                        {guestsStatus[3]}
                                    </div>
                                </OverlayTrigger>
                            </>
                        : null}
                        {props.event.guests && props.modify && props.event.guests.length === 0 && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('guests')}/>: null}
                    </div>
                </div>
                <hr className="mx-0 my-1" style={{height: '2px'}}/>
                { cardOrModalShow?
                    <div>
                        <Form>
                            <Row>
                                <Col lg={8}>
                                    <div className="home-search-container w-100">
                                        <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                                        <Button className="search-input-btn">
                                            <FontAwesomeIcon icon={faSearch}/>
                                        </Button>
                                    </div>
                                </Col>
                                <Col lg={4}>
                                    <Form.Group className="d-flex gap-3 py-1 align-items-center">
                                        <Row className="w-100 m-0">
                                            <Col lg={3} md={12} className="d-flex align-items-center">
                                                <Form.Label className="m-0">Estado</Form.Label>
                                            </Col>
                                            <Col lg={9} md={12}>
                                                <Form.Select value={filters.response} name="response" onChange={handleOnChange}>
                                                    <option value=""></option>
                                                    <option value={true}>Aceptada</option>
                                                    <option value={false}>Rechazada</option>
                                                    <option value={null}>Sin respuesta</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                : null}
                <div className="list-container-container">
                    <div className="list-container" style={{maxHeight: `${listHeight}rem`}}>
                        {props.event.guests && props.event.guests.length === 0? <p>No hay invitados todavía</p>:null}
                        {props.event.guests? getGuestsFilters().map((guest, key) => {
                            return (
                                <Card key={key} className='m-1 participant-info'>
                                    <Card.Body style={{borderRadius: "0.5rem"}}>
                                        <Row className='px-3'>
                                            <Col className='d-flex align-items-center col-participant m-0 flex-grow-0'>
                                                <div className={`${guest.subscriptionType === 'premium'? 'premium-subscription-img-container img-outline-sm':''}`}
                                                    title={`${guest.subscriptionType === 'premium'? 'Usuario premium':''}`}>
                                                    <img src={guest.profile_photo? guest.profile_photo : DefaultProfilePhotoDog} className="organizer-photo m-0"></img>
                                                </div>
                                            </Col>
                                            <Col className='col-participant flex-grow-1'>
                                                <h6 className='m-0'>{guest.userName}</h6>
                                                <span>{guest.name + ' ' + guest.lastname}</span>
                                            </Col>
                                            <Col className='col-participant d-flex align-items-center flex-grow-0'>
                                                <Badge pill bg={getResponseClass(guest.accepted)} text={guest.accepted !== null? "white" : "dark"}>{getResponseMessage(guest.accepted)}</Badge>{' '}
                                            </Col>
                                            {props.modify && props.event.permissions.DELETE_GUEST? <Col className='col-participant d-flex align-items-center flex-grow-0'>
                                                <Button className="delete-btn d-flex" title="Eliminar invitado" onClick={()=>deleteGuestConfirmation(guest)}><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                            </Col>: null}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        }): null}
                    </div>
                    {props.modify && (props.event.permissions.REGISTER_GUEST || props.event.permissions.GENERATE_INVITATION_LINK) && verifyEventStatus()?<div className='d-flex justify-content-center m-2 add-button'>
                        <Button className="btn btn-primary-body btn-add d-flex" onClick={()=>setShowUserAdd(true)}>
                            <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            &nbsp;Agregar invitado
                        </Button>
                    </div>: null}
                </div>
            </div>
        </CardOrModal>
        <UserAddModal
            showModal={showUserAdd} 
            handleInviteLink={getInviteLink}
            handleCancel={handleOnCancel}
            handleConfirm={handleOnConfirm}
            handleOnChange={handleOnChangeUser}
            loading={loadingState}
            loadingLink={loadingInviteLink}
            errors={errors.guests}
            inviteLink={inviteLink}
            showInviteLink={true}
            title="Agregar invitado"
            message="Ingresá el nombre de usuario o el email del invitado a agregar"
            permissions={props.event.permissions}
            eventTitle={props.event.title}
            />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar invitado"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteGuest}
        />
        </>
    );
} 