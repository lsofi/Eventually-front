import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faSearch, faExpand, faCompress, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import UserAddModal from '../../modals/UserAddModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

import DefaultProfilePhotoDog from "../../../resources/images/DefaultProfilePhotoDog.png"

export default function OrganizersInfoCard(props) {
    
    const [ showUserAdd, setShowUserAdd ] = useState(false);
    const [ loadingState, setLoadingState ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ userAdd, setUserAdd ] = useState({});
    const [ errors, setErrors ] = useState({})
    const [ listHeight, setListHeight ] = useState(20);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({});

    const helpText = 'En esta tarjeta podrás gestionar organizadores del evento para que te ayuden a organizarlo. Podrás configurar sus permisos y los de los otros participantes desde la configuración del evento.'

    const findErrors = () => {
        const newErrors = {};
        // if (!userAdd.user || userAdd.user === '') newErrors.user = "Por favor ingrese el nombre de usuario o email del organizador."
        //TODO Averiguar por qué no se manejan errores acá
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

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getOrganizersFilters = () => {
        return props.event.organizers.filter(organizer => {

            let nameFilter = true;

            if (filters.name) nameFilter = organizer.username.toLowerCase().includes(filters.name.toLowerCase().trim());

            return true && nameFilter;
        })
    }

    const handleOnCancel = () => {
        setShowUserAdd(false);
        setUserAdd({});
        setErrors({});
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
            setLoadingState(true)
            try{
                const params = { event_id: props.event.event_id};
                if (userAdd.user.includes('@')) params.email = userAdd.user;
                else params.username = userAdd.user;
                const res = await axios.post('../api/event/registerOrganizers', params);
                if (res.data.errors && res.data.errors.length > 0){
                    setErrors({user: res.data.errors[0]});
                } else {
                    setShowUserAdd(false);
                    props.reloadEvent();
                    setShowUserAdd(false);
                }
            } catch (error){
                setResponseErrors(error);
            }
            setLoadingState(false);
        }
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

    const deleteOrganizerConfirmation = (organizer) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar a ${organizer.name} ${organizer.lastname} como organizador/a del evento?`,
            organizer: organizer, 
            show: true}));
    }

    const confirmDeleteOrganizer = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteOrganizer(deleteConfirmationModal.organizer);
    }

    const handleOnChangeUser = (username) =>{
        const name = "user";
        const value = username;

        setUserAdd({[name]: value});
        setErrors({});
    }
    
    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="list-container-container">
                    <div className='d-flex justify-content-between'>
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Organizadores</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                    </div>
                        {props.event.organizers && props.modify && props.event.organizers.length === 0 && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('organizers')}/>: null}
                    </div>
                    <hr className="mx-0 my-1" style={{height: '2px'}}/>
                    { cardOrModalShow?
                    <div>
                        <Form>
                            <div className="home-search-container w-100">
                                <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                                <Button className="search-input-btn">
                                    <FontAwesomeIcon icon={faSearch}/>
                                </Button>
                            </div>
                        </Form>
                    </div>
                    : null}
                    <div className="list-container" style={{maxHeight: `${listHeight}rem`}}>
                        {props.event.creator?
                        <Card className='m-1 participant-info'>
                            <Card.Body style={{borderRadius: "0.5rem"}}>
                                <Row className="px-3">
                                    <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                        <div className={`${props.event.creator.subscriptionType === 'premium'? 'premium-subscription-img-container img-outline-sm':''}`} 
                                            title={`${props.event.creator.subscriptionType === 'premium'? 'Usuario premium':''}`}>
                                            <img src={props.event.creator.profile_photo? props.event.creator.profile_photo : DefaultProfilePhotoDog} className="organizer-photo m-0"></img>
                                        </div>
                                    </Col>
                                    <Col className='col-participant flex-grow-1'>
                                        <h6 className='m-0'>{props.event.creator.username}</h6>
                                        <span>{props.event.creator.name + ' ' + props.event.creator.lastname}</span>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card> : null}
                        {props.event.organizers? getOrganizersFilters().map((organizer, key) => {
                            return (
                                <Card key={key} className='m-1 participant-info'>
                                    <Card.Body style={{borderRadius: "0.5rem"}}>
                                        <Row className="px-3">
                                            <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                <div className={`${organizer.subscriptionType === 'premium'? 'premium-subscription-img-container img-outline-sm':''}`}
                                                    title={`${organizer.subscriptionType === 'premium'? 'Usuario premium':''}`}>
                                                    <img src={organizer.profile_photo? organizer.profile_photo : DefaultProfilePhotoDog} className="organizer-photo m-0"></img>
                                                </div>
                                            </Col>
                                            <Col className='col-participant flex-grow-1'>
                                                <h6 className='m-0'>{organizer.username}</h6>
                                                <span>{organizer.name + ' ' + organizer.lastname}</span>
                                            </Col>
                                            {props.modify && props.event.permissions.DELETE_ORGANIZER? <Col className='col-participant d-flex align-items-center flex-grow-0'>
                                                <Button className="delete-btn d-flex" title="Eliminar organizador" onClick={()=>deleteOrganizerConfirmation(organizer)}><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                            </Col> : null}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        }): null}
                    </div>
                    {props.modify && props.event.permissions.REGISTER_ORGANIZER?<div className='d-flex justify-content-center m-2 add-button'>
                        <Button className="btn btn-primary-body btn-add d-flex" onClick={()=> setShowUserAdd(true)}>
                            <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            &nbsp;Agregar organizador
                        </Button>
                    </div>:null}
                </div>
            </div>
        </CardOrModal>
        <UserAddModal 
            showModal={showUserAdd} 
            handleCancel={handleOnCancel}
            handleConfirm={handleOnConfirm}
            handleOnChange={handleOnChangeUser}
            loading={loadingState}
            errors={errors.user}
            title="Agregar organizador"
            message="Ingresá el nombre de usuario o el email del organizador a agregar"
            />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar organizador"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteOrganizer}
        />    
        </>
    );
} 