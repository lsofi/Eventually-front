import React, {useState} from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import CloseButton from 'react-bootstrap/CloseButton';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faSearch, faExpand, faCompress, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import Button from "react-bootstrap/Button";
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import { mongoDateToLocalDate } from "../../../shared/shared-methods.util";
import TransportConfigModal from '../../modals/TransportConfigModal';
import TransportAddModal from '../../modals/TransportAddModal';
import CardOrModal from '../../CardOrModal';

export default function TransportInfoCard( props ) {

    const [ showTransportAddModal, setShowTransportAddModal ] = useState(false);
    const [ transportConfigModal, setTransportConfigModal ] = useState({show: false});
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ listHeight, setListHeight ] = useState(40);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({});

    const helpText = 'En esta tarjeta podrás gestionar transportes. Los participantes podrán agregar transportes que vayan y vuelvan del evento para que el resto de los participantes se suscriban.';

    const getAvailableSpace = (transport) => {
        const subscribersCount = transport.subscribers && transport.subscribers.length? transport.subscribers.length : 0;
        if (!transport.available_seats || subscribersCount > transport.available_seats) return 0;
        return transport.available_seats - subscribersCount;
    }

    const handleOpenTransport = (transport) => {
        setTransportConfigModal({show: true, transport: transport})
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getTranportsFilters = () => {
        return props.event.transports.filter(transport => {

            let nameFilter = true;

            if (filters.name) nameFilter = transport.name.toLowerCase().includes(filters.name.toLowerCase().trim());

            return true && nameFilter;
        })
    }
    
    const deleteTransportConfirmation = (transport) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar el transporte "${transport.name}" del evento?`,
            transport: transport, 
            show: true}));
    }

    const confirmDeleteTransport = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteTransport(deleteConfirmationModal.transport);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="d-flex justify-content-between">
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Car pooling</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                    </div>
                    {props.event.transports && props.modify && props.event.transports.length === 0 && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('transports')}/>: null}
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
                <div className="list-container-container">
                        {!props.event.transports || !props.event.transports.length? <p>No hay transportes todavía</p>:null}
                        <div className="grid-container list-container" style={{maxHeight: `${listHeight}rem`}}>
                            {props.event.transports && props.event.transports.length? getTranportsFilters().map((transport, key) => {
                                return (
                                    <Card key={key} className="m-1 transport-info">
                                        <Card.Body className="p-2 w-100">
                                            <div style={{display: "flex", justifyContent: "flex-end",}}>
                                                {props.modify && (props.event.permissions.DELETE_TRANSPORT || props.event.permissions.DELETE_OWN_TRANSPORT && transport.isOwn)? 
                                                    <Button className="delete-btn d-flex " onClick={()=>deleteTransportConfirmation(transport)} title="Eliminar transporte">
                                                        <FontAwesomeIcon icon={faTimesCircle}/>
                                                    </Button> :null}
                                            </div>
                                            <div className="d-flex flex-column" onClick={()=>handleOpenTransport(transport)}>
                                                <h4>{transport.name}</h4>
                                                <div className="d-flex justify-content-center">
                                                    <div className={'transport-space-alert ' + (getAvailableSpace(transport) > 0? 'success' : 'danger')}>
                                                        {getAvailableSpace(transport)}
                                                        <AirlineSeatReclineNormalIcon/>
                                                    </div>
                                                </div>
                                                
                                                <p className="m-0">{transport.description && transport.description.length > 30? transport.description.substring(0,30) + "..." : transport.description}</p>
                                                <p className="m-0">{transport.patent}</p>
                                                <p className="m-0">Partida: {mongoDateToLocalDate(transport.start_date)} {transport.start_time} hs</p>
                                                {transport.starting_place.alias? <p className="m-0">Desde: {transport.starting_place.alias}</p> : null}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                );
                            }): null}
                        </div>
                        <div className="d-flex justify-content-center m-2 add-button gap-2">
                            {props.modify && props.event.permissions.CREATE_TRANSPORT ?<Button className="btn btn-primary-body btn-add d-flex" onClick={()=>setShowTransportAddModal(true)}>
                                <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                &nbsp;Agregar transporte
                            </Button> : null}
                        </div>
                </div>
            </div>
        </CardOrModal>
        <TransportAddModal
            showModal={showTransportAddModal}
            event_id={props.event.event_id}
            eventAddress={props.event.address}
            handleCloseModal={()=>setShowTransportAddModal(false)}
            handleOpenModal={()=>setShowTransportAddModal(true)}
            reloadEvent={props.reloadEvent}
            permissions={props.event.permissions}
        />
        <TransportConfigModal 
            showModal={transportConfigModal.show}
            transport={transportConfigModal.transport}
            modify={props.modify}
            event_id={props.event.event_id}
            eventAddress={props.event.address}
            handleCloseModal={()=>setTransportConfigModal(prev => ({show:false, transport: prev.transport}))}
            handleOpenModal={()=>setTransportConfigModal(prev => ({show:true, transport: prev.transport}))}
            reloadEvent={props.reloadEvent}
            permissions={props.event.permissions}
        />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar transporte"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteTransport}
        />
        </>
    )
}
