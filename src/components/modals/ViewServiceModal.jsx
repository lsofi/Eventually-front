import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMapLocation, faUser, faPhone, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import Alert from 'react-bootstrap/Alert';
import ServiceAddToEventModal from './ServiceAddToEventModal';
import { getCityAndProvnice } from '../../services/map.service';
import MapModal from './MapModal';

export default function ViewServiceModal( props ){

    const [ service, setService ] = useState({...props.service});
    const [ showAddToEventModal, setShowAddToEventModal ] = useState(false);
    const [ loading, setLoading] = useState(0);
    const [ cityAndProvince, setCityAndProvince ] = useState({city: '', province: ''});
    const [ showMapModal, setShowMapModal ] = useState(false);

    useEffect(()=>{
        if (!props.showModal) return;
        setService(props.service)
        getLocationNames();
    },[props.showModal])

    const getLocationNames = async () => {
        setCityAndProvince(await getCityAndProvnice(props.service.address));
    }

    const getService = async () => {
        setLoading(prev=>prev+1);
        setService({name: props.service.name});
        if (props.event_id && props.service.service_id){
            try{
                const res = await axios.get(`../api/service/getService?service_id=${props.service.service_id}`);
                const resService = res.data;
                setService(resService);
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }

    const handleStartChat = async () => {
        const params = {
            service_id: props.service._id
        }
        setLoading(prev => prev + 1)
        try {
            await axios.post(`../api/chats/startConversationWithProvider`, params)
            props.handleCloseModal();
            props.setShowChat();
        } catch (error){
            console.log(error)
        }
        setLoading(prev => prev - 1)
    }

    return (
        <>
        {service && <Modal show={props.showModal} onHide={props.handleCloseModal} style={{zIndex: '9999'}}>
            <Modal.Header className='p-0' style={{borderBottom: 'none', position: 'relative'}}>
                <img src={service.photo? service.photo : 'https://www.voicemailtel.com/wp-content/uploads/2015/09/Customer-service.png'} style={{borderRadius: '2rem 2rem 0 0', width: '100%', opacity: '0.6', objectFit: 'cover'}}/>
                <Alert style={{position: 'absolute', bottom: '0.5rem', right: '1rem'}} className="service-type-alert">{service.type}</Alert>
            </Modal.Header>
            <Modal.Body className="view-service-modal-body d-flex flex-column gap-3">
                <h3 className="bold">{service.name}</h3>
                {service.description && <p>{service.description}</p>}
                {service.availability && <h5>Disponibilidad</h5>}
                {service.availability && <p className="ms-3">{service.availability}</p>}
                <h5>Contacto</h5>
                {service.provider && <h5 className="ms-3"><FontAwesomeIcon className="me-2" icon={faUser}/>{service.providerString}</h5>}
                {service.contact_number && <div className="d-flex gap-3 ms-3">
                    <h5 className="m-0"> <FontAwesomeIcon className="me-2" icon={faPhone}/>Teléfono</h5>
                    <p className="m-0">{service.contact_number}</p>
                </div>}
                {service.contact_email &&<div className="d-flex gap-3 ms-3">
                    <h5 className="m-0"> <FontAwesomeIcon className="me-2" icon={faEnvelope}/>Correo</h5>
                    <p className="m-0">{service.contact_email}</p>
                </div>}
                {service.address? 
                <>
                    <h5>Dirección</h5>

                    <div className="d-flex gap-2 align-items-center">
                        <p className="ms-3 mb-0">
                            <FontAwesomeIcon className="me-1" icon={faLocationDot}/> 
                            {service.address.street}&nbsp;{service.address.number}, {cityAndProvince? cityAndProvince.city : ''}, {cityAndProvince? cityAndProvince.province : ''}
                        </p>
                        <Button className="btn btn-primary-body btn-add d-flex align-items-center py-2" onClick={()=>setShowMapModal(true)}>
                                <FontAwesomeIcon icon={faMapLocation}/>
                        </Button>
                    </div> 
                </>: null}
                {service.price? <div className="d-flex gap-3">
                    <h5 className="m-0">Precio</h5>
                    <p className="m-0">${service.price}</p>
                </div> : null}
            </Modal.Body>
            <Modal.Footer className='d-flex align-items-center'>
                <Button className="btn btn-primary-body d-flex align-items-center py-1" disabled={loading} onClick={handleStartChat} style={{fontSize: "1.2rem"}}>
                    {!loading? 'Iniciar chat': 'Cargando...'}
                </Button>
                <Button className="btn btn-primary-body d-flex align-items-center py-1" onClick={() => {props.handleCloseModal(); setShowAddToEventModal(true)}} style={{fontSize: "1.2rem"}}>
                    Agregar a Evento
                </Button>
                {/* <Button className="btn btn-primary-body d-flex align-items-center py-1" style={{fontSize: "1.2rem"}}>
                    Enviar mensaje
                </Button> */}
            </Modal.Footer>
        </Modal>}
        <ServiceAddToEventModal
            service={service}
            showModal={showAddToEventModal}
            handleCloseModal={() => {setShowAddToEventModal(false)}}
        />
        <MapModal showModal={showMapModal} handleCloseModal={()=>setShowMapModal(false)} address={service.address}/>
        </>
    );
}