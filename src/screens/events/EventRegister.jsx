import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
// import { MuuriComponent, useDrag } from "muuri-react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import BasicInfoCard from "../../components/events/event-info/BasicInfoCard";
import DetailsInfoCard from "../../components/events/event-info/DetailsInfoCard";
import LocationInfoCard from "../../components/events/event-info/LocationInfoCard";
import LoadingModal from "../../components/modals/LoadingModal";
import InfoModal from "../../components/modals/InfoModal";
import TemplatesModal from "../../components/modals/TemplatesModal";

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function EventRegister() {
    
    const [ modalLoading, setModalLoading ] = useState(false);
    const [ showInfoModal, setShowInfoModal ] = useState(false);
    const [ showTemplatesModal, setShowTemplatesModal ] = useState(false);
    const [ event, setEvent ] = useState({type: {}});
    const [ errors, setErrors ] = useState({});
    const [ types, setTypes ] = useState([]);

    useEffect(()=>{
        getTypes();
    },[]);

    const getTypes = async () => {
        try {
            const res = await axios.get('../api/event/getEventTypes');
            setTypes(res.data);
        } catch (error) {}
    }

    const setParams = () => {
        const params = {
            title: event.title,
            start_date: event.start_date,
            start_time: event.start_time,
            type: {
                name: event.type.name,
                is_private: event.type.is_private === 'true'? true: false,
                description: 'Todavía no tenemos esto'
            },
            description: event.description,
        }
        if (event.end_date){
            params.end_date = event.end_date;
            params.end_time = event.end_time;
        }
        if (event.details && event.details.photo) params.photo = event.details.photo;
        if (event.address) params.address = event.address;
        if (event.template) params.template = event.template;

        return params;
    }

    const handleShowModal = () => setShowInfoModal(true);

    const handleCloseModal = () => {
        setShowInfoModal(false);
        navigate('/events');
    }

    const findErrors = () => {
        const eventObj = {...event};
        const newErrors = {};

        if (!eventObj.title || eventObj.title === '' ) newErrors.title = 'Debe ingresar un título.'

        if (!eventObj['start_date'] ) newErrors['start_date'] = 'Debe ingresar una fecha de inicio.'
        if (!eventObj['start_time'] ) newErrors['start_time'] = 'Debe ingresar una hora de inicio.'
        else if ( eventObj.start_date && new Date(eventObj['start_date'] + ' ' + eventObj['start_time']) < new Date()){
            newErrors['start_date'] = 'La fecha y hora de inicio no puede ser menor a la actual.'
            newErrors['start_time'] = 'La fecha y hora de inicio no puede ser menor a la actual.';
        }

        if (eventObj['end_time'] && !eventObj['end_date'] ) newErrors['end_date'] = "Debe ingresar una fecha de fin."
        else if ( eventObj['end_date'] < eventObj['start_date']) newErrors['end_date'] = "La fecha de fin no puede ser menor a la fecha de inicio."
        
        if (eventObj['end_date'] && !eventObj['end_time'] ) newErrors['end_time'] = "Debe ingresar una hora de fin."
        else if ( eventObj['end_date'] === eventObj['start_date'] && eventObj['end_time'] <= eventObj['start_time']) newErrors['end_time'] = "La hora de fin no puede ser menor o igual a la hora de inicio."

        if (!eventObj.description || eventObj.description === '') newErrors.description = "Debe ingresar una descripción del evento.";
        else if (eventObj.description.length > 300) newErrors.description = "La descripción no puede superar los 300 caracteres.";
        
        if (eventObj.type){
            if (!eventObj.type.name || eventObj.type.name === '') newErrors.type = { ...newErrors.type, name : "Debe seleccionar un tipo de evento."};
            if (!eventObj.type.is_private || eventObj.type.is_private === '') newErrors.type = { ...newErrors.type, is_private : "Debe seleccionar la privacidad del evento."};
        }

        return newErrors;
    }

    // Set the errors state properly depending on how many object levels does the response error field have
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

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setEvent({...event, [name]: value});
        if ( !!errors[name] && !(['start_date', 'start_time'].includes(name)) ) setErrors({...errors, [name]: null});
        if ( !!errors[name] && (['start_date', 'start_time'].includes(name)) ) setErrors({...errors, start_date: null, start_time: null});;
        if ( !!errors[name] && (['end_date', 'end_time'].includes(name)) ) setErrors({...errors, end_date: null, end_time: null});
    }


    const handleOnChangeField = (field, e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
        setEvent({...event, [field]: { ...event[field] , [name]: value}});
        if ( errors[field] && !!errors[field][name] ) setErrors({...errors, [field]: { ...errors[field] , [name]: null}});
    }

    const handleConfirm = e => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            setShowTemplatesModal(true);
        }
    };

    const handleSubmit = async (template) => {
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = setParams();
            params.template = template;
            setModalLoading(prev=>prev+1);
            try {
                setErrors({});
                const data = await axios.post('../api/event/createEvent', params);
                //Show modal dialog and navigate to login
                handleShowModal();
            } catch (error) {
                setResponseErrors(error);
                
            }
            setModalLoading(prev=>prev-1);
        }
    }
    
    const navigate = useNavigate();

    return (
        <div className="EventsPage body d-flex flex-column nav-bar-content align-items-center">
            <div className="d-flex flex-column justify-content-center page-body-event mt-3">
                <Breadcrumb>
                    <Breadcrumb.Item onClick={()=>navigate('/events')}>Tus eventos</Breadcrumb.Item>
                    <Breadcrumb.Item>Crear Evento</Breadcrumb.Item>
                </Breadcrumb>
                <h3 className="bold">¡Creemos tu evento soñado!</h3>
                <h6>
                    Ingresá la información requerida señalada con un <span className="text-tertiary">*</span>
                </h6>
                <div className="cards-container mt-4" style={{alignSelf: 'center', minWidth: '60%'}}>
                    <BasicInfoCard event={event} modify={true} register={true} handleOnChange={handleOnChange} handleOnChangeField={handleOnChangeField} errors={errors} types={types}/>
                </div>
            </div>
            <OverlayTrigger key={'submit'} placement={'left'} overlay={<Tooltip id={'tooltip-submit'}>Confirmar</Tooltip>}>
                <Button className="event-submit-button" onClick={handleConfirm}><FontAwesomeIcon icon={faCheck}/></Button>
            </OverlayTrigger>
            <LoadingModal showModal={modalLoading}/>
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={handleCloseModal}
                message="¡Evento registrado con éxito!"
                img={SuccessPhoneGirl}
            />
            <TemplatesModal
                showModal={showTemplatesModal}
                handleCloseModal={()=>setShowTemplatesModal(false)}
                setTemplate={handleSubmit}
                eventType={event.type}
                types={types}
            />
        </div>
    )
}