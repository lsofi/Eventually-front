import React, { useState, useEffect }  from 'react';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faSearch, faExpand, faCompress, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Badge from 'react-bootstrap/Badge';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

export default function PollsInfoCard( props ) {

    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ listHeight, setListHeight ] = useState(40);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({});

    const helpText = 'En esta tarjeta podrás agregar encuestas para que los participantes las respondan. Sólo podrás modificar las encuestas mientras estas no tengan respuestas.'

    const navigate = useNavigate();

    const getPublishedClass = (published) => {
        if (published === true) return 'success';
        else return 'warning';
    }

    const getPublishedMessage = (published) => {
        if (published === true) return 'Publicada';
        else return 'No publicada';
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getPollsFilters = () => {
        return props.event.polls.filter(poll => {

            let nameFilter = true;

            if (filters.name) nameFilter = poll.name.toLowerCase().includes(filters.name.toLowerCase().trim());

            return true && nameFilter;
        })
    }

    const deletePollConfirmation = (poll) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar la encuesta "${poll.name}" del evento?`,
            poll: poll, 
            show: true}));
    }

    const confirmDeletePoll = () => {
        setDeleteConfirmationModal({show: false});
        props.deletePoll(deleteConfirmationModal.poll);
    }

    const handleCreatePoll = () => {
        navigate(`/events/createPoll?event_id=${props.event.event_id}&event_name=${props.event.title}`)
    }

    const handleOpenPoll = (poll) => {
        if (!props.event.permissions) return;
        if (props.event.permissions.UPDATE_POLL && !poll.has_answers ) navigate(`/events/updatePoll?event_id=${props.event.event_id}&poll_id=${poll.poll_id}&event_name=${props.event.title}`);
        else if (props.event.permissions.UPDATE_POLL && poll.has_answers) navigate(`/events/viewPoll?event_id=${props.event.event_id}&poll_id=${poll.poll_id}&event_name=${props.event.title}`);
        else navigate(`/events/answerPoll?event_id=${props.event.event_id}&poll_id=${poll.poll_id}&event_name=${props.event.title}`);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="list-container-container">
                    <div className='d-flex justify-content-between'>
                        <div className="d-flex gap-3 align-items-center">
                            <h4 className="mb-0">Encuestas</h4>
                            <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                                <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                            </OverlayTrigger>
                            <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                        </div>
                        {props.event.polls && props.modify && !props.event.polls.length && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('polls')}/>: null}
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
                        {props.event.polls && props.event.polls.length? getPollsFilters().map((poll, key) => {
                            return (
                                <Card key={key} className='m-1 participant-info'>
                                    <Card.Body style={{borderRadius: "0.5rem", cursor: 'pointer'}}>
                                        <Row className="px-3">
                                            <Col className='d-flex flex-column justify-content-center flex-grow-1' onClick={()=>handleOpenPoll(poll)}>
                                                <h6 className='m-0'>{poll.name}</h6>
                                                <span>Encuesta de {poll.questions.length} preguntas</span>
                                            </Col>
                                            <Col className="d-flex align-items-center flex-grow-0" onClick={()=>handleOpenPoll(poll)}>
                                                <Badge pill bg={getPublishedClass(poll.visible)} text={poll.visible !== null? "white" : "dark"}>{getPublishedMessage(poll.visible)}</Badge>{' '}
                                            </Col>
                                            {props.modify && props.event.permissions.DELETE_POLL? 
                                            <Col className='col-participant d-flex align-items-center flex-grow-0'>
                                                <Button className="delete-btn d-flex" onClick={()=>deletePollConfirmation(poll)} title="Eliminar encuesta"><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                            </Col> : null}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        })
                        : 
                        <h4 className="mx-3 my-2">No hay encuestas todavía</h4>}
                    </div>
                    {props.modify && props.event.permissions.ADD_SERVICE_TO_EVENT?<div className='d-flex justify-content-center m-2 add-button'>
                        <Button className="btn btn-primary-body btn-add d-flex" onClick={handleCreatePoll}>
                            <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            &nbsp;Agregar encuesta
                        </Button>
                    </div>:null}
                </div>
            </div>
        </CardOrModal>
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar encuesta"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeletePoll}
        />
        </>
    )
}
