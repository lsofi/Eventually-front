import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { userIsInArray, getMyUserId } from "../../shared/shared-methods.util"
import Masonry from '@mui/lab/Masonry';
import Button from "react-bootstrap/Button";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faGear, faPlusCircle, faArrowsRotate, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Tooltip from 'react-bootstrap/Tooltip';
import BasicInfoCard from "../../components/events/event-info/BasicInfoCard";
import DetailsInfoCard from "../../components/events/event-info/DetailsInfoCard";
import LocationInfoCard from "../../components/events/event-info/LocationInfoCard";
import GuestsInfoCard from "../../components/events/event-info/GuestsInfoCard";
import OrganizersInfoCard from "../../components/events/event-info/OrganizersInfoCard";
import TasksInfoCard from "../../components/events/event-info/TasksInfoCard";
import ConsumableInfoCard from "../../components/events/event-info/ConsumableInfoCard";
import ExpenseInfoCard from "../../components/events/event-info/ExpensesInfoCard";
import ServiceInfoCard from "../../components/events/event-info/ServiceInfoCard";
import LoadingModal from "../../components/modals/LoadingModal";
import InfoModal from "../../components/modals/InfoModal";
import ModalPassConfirm from "../../components/modals/ModalPassConfirm";
import CardAddModal from "../../components/modals/CardAddModal";
import StateTransitionButton from "../../components/events/StateTransitionButton";
import StateAlert from "../../components/events/StateAlert";
import PermissionsConfigModal from "../../components/modals/PermissionsConfigModal";
import TransportInfoCard from "../../components/events/event-info/TransportInfoCard";
import PollsInfoCard from "../../components/events/event-info/PollsInfoCard";
import RepositoriesInfoCard from "../../components/events/event-info/RepositoriesInfoCard";
import EventChat from "../../components/chats/EventChat";
import YesNoConfirmationModal from "../../components/modals/YesNoConfirmationModal";
import CustomTemplateAddModal from "../../components/modals/CustomTemplateAddModal";

import Error404 from "../../resources/images/404Error.png";
import LoadingNotebook from "../../resources/images/LoadingNotebook.png";
import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function EventConfig() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event_id = urlParams.get('event_id'); // Saves the param from the URL

    const location = useLocation();

    //States
    const [ event, setEvent] = useState();
    const [ initialEvent, setInitialEvent ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ modify, setModify ] = useState(false);
    const [ modalLoading, setModalLoading ] = useState(false);
    const [ showInfoModal, setShowInfoModal ] = useState(false);
    const [ showConfirmationModal, setShowConfirmationModal ] = useState(false);
    const [ showPermissionsConfigModal, setShowPermissionsConfigModal ] = useState(false);
    const [ showCardAddModal, setShowCardAddModal ] = useState(false);
    const [ confirmPass, setConfirmPass ] = useState('');
    const [ participants, setParticipants ] = useState([]);
    const [ myExpensesSummary, setMyExpensesSummary ] = useState(undefined);
    const [ totalExpensesSummary, setTotalExpensesSummary ] = useState(undefined);
    const [ types, setTypes ] = useState([]);
    const [ changedBasic, setChangedBasic ] = useState(false);
    const [ changedAddress, setChangedAddress ] = useState(false);
    const [ showChat, setShowChat ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState(false);
    const [ customTemplateAddModal, setCustomTemplateAddModal ] = useState({show: false, personalTemplate: true});
    const [ modifyByState, setModifyByState ] = useState(false);

    const myUserId = getMyUserId();
    const adminUserIds = [
        '6372b7a27ae64ed5293953e0',
        '6372bfc40217358bcd1eff29',
        '6372c29061ebe736d08bb5c3',
        '6372c2fcb3212a30a442f77a',
        '63730189a47ab77455eda399',
        '6374182ea77d3e0b84476a40'
    ]

    //Gets the event info from the api when the component first loads
    useEffect(()=>{
        getEvent();
    },[])

    useEffect(()=>{
        getEvent();
    },[location])


    const getEvent = async () => {
        
        setModalLoading(prev=>prev+1); // Acivates the loading modal
        try{
            const resEventPromise = axios.get(`../api/event/getEvent?event_id=${event_id}`);
            const resTotalSummaryPromise = axios.get(`../api/expense/getExpensesSummary?event_id=${event_id}`);
            const resSummaryPromise = axios.get(`../api/expense/getExpensesSummaryXGuest?event_id=${event_id}`);
            const resTypesPromise = axios.get('../api/event/getEventTypes');

            const resTypes = await resTypesPromise;
            const resTotalSummary = await resTotalSummaryPromise;
            const resSummary = await resSummaryPromise;
            const res = await resEventPromise;
            
            const resEvent = getEventJson(res.data);
            setEvent(resEvent); 
            setInitialEvent(resEvent);
            
            setMyExpensesSummary(resSummary.data);
            setTotalExpensesSummary(resTotalSummary.data);
            
            setTypes(resTypes.data);

            getParticipants(resEvent);
        } catch (error){
            console.log(error);
        }
        setModalLoading(prev=>prev-1); // Deativates the loading modal
    }


    const getExpensesSummary = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const resSummaryPromise = axios.get(`../api/expense/getExpensesSummaryXGuest?event_id=${event_id}`);
            const resTotalSummaryPromise = axios.get(`../api/expense/getExpensesSummary?event_id=${event_id}`);

            const resSummary = await resSummaryPromise;
            const resTotalSummary = await resTotalSummaryPromise;

            setMyExpensesSummary(resSummary.data);
            setTotalExpensesSummary(resTotalSummary.data);
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getGuests = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/guest/getGuests?event_id=${event.event_id}`);
            const resGuests = res.data;
            const eventAux = {...event, guests: resGuests[0].guests};
            setEvent(eventAux);
            setInitialEvent(eventAux);
            getParticipants(eventAux);
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getOrganizers = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/event/getEventOrganizers?event_id=${event.event_id}`);
            const resOrganizers = res.data.organizers;
            setEvent({...event, organizers: resOrganizers});
            setInitialEvent({...event, organizers: resOrganizers});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getTasks = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/activity/getEventActivities?event_id=${event.event_id}`);
            const resTask = res.data;
            setEvent({...event, tasks: resTask.activities});
            setInitialEvent({...event, tasks: resTask.activities});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getConsumables = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/consumable/getEventConsumables?event_id=${event.event_id}`);
            const resConsumable = res.data;
            setEvent({...event, consumables: resConsumable});
            setInitialEvent({...event, consumables: resConsumable});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getExpenses = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/expense/getEventExpenses?event_id=${event.event_id}`);
            const resExpense = res.data;
            setEvent({...event, expenses: resExpense});
            setInitialEvent({...event, expenses: resExpense});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getTransports = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/transport/getEventTransports?event_id=${event.event_id}`);
            const resTransports = res.data;
            setEvent({...event, transports: resTransports.transports});
            setInitialEvent({...event, transports: resTransports.transports});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getPolls = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/poll/getEventPolls?event_id=${event.event_id}`);
            const resExpense = res.data;
            setEvent({...event, polls: resExpense.polls});
            setInitialEvent({...event, polls: resExpense.polls});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getServices = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/service/getEventServices?event_id=${event.event_id}`);
            const resServices = res.data;
            console.log(resServices)
            setEvent({...event, services: resServices.services});
            setInitialEvent({...event, services: resServices.services});
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const getPermissions = async () => {
        setModalLoading(prev=>prev+1);
        try {
            const res = await axios.get(`../api/event/getAllPermissionsInEvent?event_id=${event.event_id}`);
            const resPermissions = res.data;
            const newEvent = {
                ...event, 
                CREATOR: resPermissions.CREATOR,
                ORGANIZER: resPermissions.ORGANIZER,
                GUEST: resPermissions.GUEST,
                SERVICE: resPermissions.SERVICE,
                permissions: resPermissions.role_permissions,
            }
            setEvent(newEvent);
            setInitialEvent(newEvent);
        } catch (error) {
            
        }
        setModalLoading(prev=>prev-1);
    }

    const navigate = useNavigate();

    // Converts card json to DTO
    const getEventDTOBasic = () => {
        const params = {
            title: event.title,
            start_date: event.start_date,
            start_time: event.start_time,
            event_id: event.event_id,
            type: {
                name: event.type.name,
                is_private: event.type.is_private,
            }
        }

        params.description = event.description;

        if (event.end_date){
            params.end_date = event.end_date;
            params.end_time = event.end_time;
        }

        return params;
    }

    // Converts DTO to card json
    const getEventJson = (resEvent) => {
        //console.log(resEvent);
        const eventJson = {
            event_id: event_id,
            title: resEvent.title,
            start_date: resEvent.start_date,
            start_time: resEvent.start_time,
            creator: resEvent.creator,
            type: resEvent.type,
            state: resEvent.state,
            ORGANIZER: resEvent.ORGANIZER,
            GUEST: resEvent.GUEST,
            SERVICE: resEvent.SERVICE,
            permissions: resEvent.role_permissions,
        }
        eventJson.permissions = { ...eventJson.permissions, CREATE_REPOSITORY_OR_ALBUM: eventJson.permissions.CREATE_FILE_REPOSITORY || eventJson.permissions.CREATE_PHOTO_ALBUM }
        
        if (resEvent.end_date) eventJson.end_date = resEvent.end_date;
        if (resEvent.end_time) eventJson.end_time = resEvent.end_time;
        if (resEvent.description) eventJson.description = resEvent.description;
        if (resEvent.photo) eventJson.photo = resEvent.photo;
        if (resEvent.address) eventJson.address = resEvent.address;
        if (resEvent.guests) eventJson.guests = resEvent.guests;
        if (resEvent.organizers) eventJson.organizers = resEvent.organizers;
        if (resEvent.activities) eventJson.tasks = resEvent.activities;
        if (resEvent.consumables) eventJson.consumables = resEvent.consumables;
        if (resEvent.expenses) eventJson.expenses = resEvent.expenses;
        if (resEvent.services) eventJson.services = resEvent.services;
        if (resEvent.transports) eventJson.transports = resEvent.transports;
        if (resEvent.polls) eventJson.polls = resEvent.polls;
        if (resEvent.photo_album) eventJson.photo_album = resEvent.photo_album;
        if (resEvent.files_repository) eventJson.files_repository = resEvent.files_repository;
        if (resEvent.photo_album || resEvent.files_repository) eventJson.repositories = true;

        if ((eventJson.tasks && !eventJson.tasks.length) && !eventJson.permissions.CREATE_ACTIVITY) eventJson.tasks = undefined;
        if ((eventJson.expenses && !eventJson.expenses.length) && !eventJson.permissions.CREATE_EXPENSE) eventJson.expenses = undefined;
        if ((eventJson.consumables && !eventJson.consumables.length) && !eventJson.permissions.CREATE_CONSUMABLE) eventJson.consumables = undefined;
        if ((eventJson.polls && !eventJson.polls.length) && !eventJson.permissions.CREATE_POLL) eventJson.polls = undefined;
        if ((eventJson.services && !eventJson.services.length) && !eventJson.permissions.ADD_SERVICE_TO_EVENT) eventJson.services = undefined;
        if ((eventJson.transports && !eventJson.transports.length) && !eventJson.permissions.CREATE_TRANSPORT) eventJson.transports = undefined;

        setModifyByState(eventJson.state && !['canceled', 'finalized'].includes(eventJson.state));
        return eventJson;
    }

    const getParticipants = (eventAux) => {
        const participants = [];
        if(!eventAux) return;
        if (eventAux.guests) eventAux.guests.forEach(guest => {if(guest.accepted) participants.push(guest)});
        if (eventAux.organizers) eventAux.organizers.forEach(organizer => {if(!userIsInArray(organizer, participants)) participants.push(organizer)});
        if(!userIsInArray(eventAux.creator, participants)) participants.push(eventAux.creator);
        setParticipants(participants);
    }

    const toggleModify = () => setModify(!modify);
    const handleCancelConfirmationModal = () => setShowConfirmationModal(false);

    const eventOnTime = () => {
        const eventTime = new Date(event.start_date + ' ' + event.start_time);
        return eventTime > new Date();
    }

    const handleResetBasic = () => {
        setEvent( prev => ({...prev, 
            title: initialEvent.title,
            start_date: initialEvent.start_date,
            start_time: initialEvent.start_time,
            type: {
                name: initialEvent.type.name,
                is_private: initialEvent.type.is_private === 'true'? true : false,
                description: 'Todavía no tenemos esto'
            },
            description: initialEvent.description
        }));
        toggleModify();
        setErrors({});
        setChangedBasic(false);
        // setChangedAddress(false);
    }

    const handleResetAddress = () => {
        setEvent( prev => ({...prev, address: initialEvent.address}));
        toggleModify();
        setErrors({});
        // setChangedBasic(false);
        setChangedAddress(false);
    }

    const handleShowModal = () => setShowInfoModal(true);

    const handleCloseModal = () => {
        setShowInfoModal(false);
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        setChangedBasic(true);
    
        setEvent({...event, [name]: value})
        if ( !!errors[name] && !(['start_date', 'start_time'].includes(name)) ) setErrors({...errors, [name]: null});
        if ( !!errors[name] && (['start_date', 'start_time'].includes(name)) ) setErrors({...errors, start_date: null, start_time: null});;
        if ( !!errors[name] && (['end_date', 'end_time'].includes(name)) ) setErrors({...errors, end_date: null, end_time: null});
    }

    const handleOnChangeField = (field, e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if ('type' === field) setChangedBasic(true);
        if ('address' === field) setChangedAddress(true);

    
        setEvent({...event, [field]: { ...event[field] , [name]: value}});
        if ( errors[field] && !!errors[field][name] ) setErrors({...errors, [field]: { ...errors[field] , [name]: null}});
    }

    const handleSetAddress = address => {
        setEvent(prev => ({...prev, address: address}));
        setChangedAddress(true);
    }

    const handleOnChangeFile = (field, file) => {
        const name = file.name;
        const value = file.value;

        setEvent({...event, [field]: {...event[field], [name]: value}});
        if ( errors[field] && !!errors[field][name] ) setErrors({...errors, [field]: { ...errors[field] , [name]: null}});
    }

    const handleOnChangePhoto = photo => {
        setEvent({...event, photo: photo})
    }

    // It is used to confirm password for certain actions that require confimation
    const handleChangePassword = e => {
        const value = e.target.value;
        setConfirmPass(value);
        if ( !!errors.password) setErrors({...errors, password: null});
    }

    const handleOnAddFields = (fields) => {
        let newFields = {}
        fields.forEach(field => {
            if (['expenses', 'consumables', 'guests', 'organizers', 'tasks', 'transports'].includes(field.name)) newFields = {...newFields, [field.name]: []}
            else if (['photo'].includes(field.name)) newFields = {...newFields, [field.name]: null};
            else newFields = {...newFields, [field.name]: {}}
        })
        setEvent({...event, ...newFields});
    }

    const handleOnAddArray = (field) =>{
        setEvent({...event, [field]: []})
    }

    const handleOnRemove = (field) => {
        const currentEvent = {...event};
        delete currentEvent[field];
        setEvent(currentEvent);
    }


    const findErrors = () => {
        const eventObj = {...event};
        const password = confirmPass;
        const newErrors = {};

        if ( (!password || password === '') && showConfirmationModal) newErrors.password = 'Por favor ingrese su contraseña para continuar.';

        if (!modify) return newErrors; // Does not check for other errors if the event is not being modified

        if (!eventObj.title || eventObj.title === '' ) newErrors.title = 'Debe ingresar un título.'

        if (!eventObj['start_date'] ) newErrors['start_date'] = 'Debe ingresar una fecha de inicio.'
        if (!eventObj['start_time'] ) newErrors['start_time'] = 'Debe ingresar una hora de inicio.'
        else if ( eventObj.star_date && new Date(eventObj['start_date'] + ' ' + eventObj['start_time']) < new Date()){
            newErrors['start_date'] = 'La fecha y hora de inicio no puede ser menor a la actual.'
            newErrors['start_time'] = 'La fecha y hora de inicio no puede ser menor a la actual.';
        }

        if (eventObj['end_time'] && !eventObj['end_date'] ) newErrors['end_date'] = "Debe ingresar una fecha de fin."
        else if ( eventObj['end_date'] < eventObj['start_date']) newErrors['end_date'] = "La fecha de fin no puede ser menor a la fecha de inicio."
        
        if (eventObj['end_date'] && !eventObj['end_time'] ) newErrors['end_time'] = "Debe ingresar una hora de fin."
        else if ( eventObj['end_date'] === eventObj['start_date'] && eventObj['end_time'] <= eventObj['start_time']) newErrors['end_time'] = "La hora de fin no puede ser menor o igual a la hora de inicio."

        if (!eventObj.description || eventObj.description === '') newErrors.description = "Debe ingresar una descripción del evento.";
        else if (eventObj.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres.";

        if (!eventObj.type.name || eventObj.type.name === '') newErrors.type = {...newErrors.type, name: "Debe seleccionar un tipo de evento."};
        if (!eventObj.type.is_private && eventObj.type.is_private === '') newErrors.type =  {...newErrors.type, is_private: "Debe seleccionar la privacidad del evento."};
        
        return newErrors;
    }

    const findErrorsLocation = () => {
        const eventObj = {...event};
        const newErrors = {};
        if (eventObj.address){
            if (eventObj.address.alias && eventObj.address.alias.length > 50) newErrors.address = {...newErrors.address, alias: "El alias no puede superar los 50 caracteres."};

            if (!eventObj.address.province || eventObj.address.province === '') newErrors.address = {...newErrors.address, province: "Debe seleccionar una provincia."};

            if (!eventObj.address.city || eventObj.address.city === '') newErrors.address = {...newErrors.address, city: "Debe seleccionar una localidad."};

            if (!eventObj.address.street || event.address.street === '') newErrors.address = {...newErrors.address, street: "Debe ingresar una calle."};
            else if (eventObj.address.street.length > 30) newErrors.address = {...newErrors.address, street: "La calle no puede superar los 30 caracteres."};

            if (!eventObj.address.number || event.address.number === '') newErrors.address = {...newErrors.address, number: "Debe ingresar una altura."};
            else if (eventObj.address.number.length > 5) newErrors.address = {...newErrors.address, number: "La altura no puede superar los 5 dígitos."};
            else if (eventObj.address.number <= 0) newErrors.address = {...newErrors.address, number: "La altura debe ser un número mayor a 0"};
            else if (!Number.isInteger(parseFloat(eventObj.address.number))) newErrors.address = {...newErrors.address, number: "La altura debe ser un número entero"};
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

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
        // We got errors!
        setErrors(newErrors)
        } else {
            const param = {
                event_id: event.event_id,
                password: confirmPass
            };
            try{
                setModalLoading(prev=>prev+1);
                await axios.delete('../api/event/deleteevent', {data: param});
                setShowConfirmationModal(false);
                setConfirmPass('');
                navigate('/events');
            } catch (error){
                setResponseErrors(error);
            }
            setModalLoading(prev=>prev-1);
        }
    }

    const handleDeleteGuest = async guest => {
        const param = {
            event_id: event.event_id,
            guest_id: guest.user_id,
            accepted: guest.accepted
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/guest/deleteguest', {data: param});
            getGuests();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleExitEvent = async () => {
        const param = {
            event_id: event.event_id,
            guest_id: getMyUserId(),
            accepted: true
        }
        try {
            setDeleteConfirmationModal(false);
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/guest/deleteguest', {data: param});
            navigate('/events');
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteOrganizer = async organizer => {
        const param = {
            event_id: event.event_id,
            organizer_id: organizer.user_id,
            accepted: organizer.accepted
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/event/deleteOrganizer', {data: param});
            getOrganizers();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteTask = async task => {
        const param = {
            event_id: event.event_id,
            activity_id: task.activity_id,
            //creator: event.
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/activity/deleteActivity', {data: param});
            getTasks();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteConsumable = async consumable => {
        const param = {
            event_id: event.event_id,
            consumable_id: consumable.consumable_id,
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/consumable/deleteConsumable', {data: param});
            getConsumables();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteExpense = async expense => {
        const param = {
            event_id: event.event_id,
            expense_id: expense.expense_id,
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/expense/deleteExpense', {data: param});
            getExpenses();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteService = async service => {
        const param = {
            event_id: event.event_id,
            service_id: service.service_id,
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/service/deleteServiceToEvent', {data: param});
            getServices();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeleteTransport = async transport => {
        const param = {
            event_id: event.event_id,
            transport_id: transport.transport_id,
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/transport/deleteTransport', {data: param});
            getTransports();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleDeletePoll = async poll => {
        const param = {
            event_id: event.event_id,
            poll_id: poll.poll_id,
        }
        try {
            setModalLoading(prev=>prev+1);
            await axios.delete('../api/poll/deletePoll', {data: param});
            getPolls();
        } catch (error) {}
        setModalLoading(prev=>prev-1);
    }

    const handleSubmitBasic = async e => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = getEventDTOBasic();
            if (initialEvent.end_date && !params.end_date) {
                params.end_date = null;
                params.end_time = null;
            }
            try {
                setModalLoading(prev=>prev+1);
                setErrors({});
                //Get the api data
                await axios.put('../api/event/updateEvent', params);
                getEvent();
                //Show modal dialog and navigate to login
                handleShowModal();
                setChangedBasic(false);
            } catch (error) {
                
                if (error.response) setResponseErrors(error);

            }
            setModalLoading(prev=>prev-1);
        }
    };

    const handleSubmitAddress = async e => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrorsLocation()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {address: event.address, event_id: event_id};
            params.address.number = Number(params.address.number);
            try {
                setModalLoading(prev=>prev+1);
                setErrors({});
                //Get the api data
                const res = await axios.put('../api/event/updateEvent', params);
                getEvent(res.data[0]);
                //Show modal dialog and navigate to login
                handleShowModal();
                setChangedAddress(false);
            } catch (error) {
                
                if (error.response) setResponseErrors(error);

            }
            setModalLoading(prev=>prev-1);
        }
    };


    return (
        <div className="EventsPage body d-flex flex-column nav-bar-content justify-content-center align-items-center">
            <div className="d-flex flex-column align-items-center page-body-event mt-3">
                <Breadcrumb className="w-100">
                    <Breadcrumb.Item>
                        <Link to="/events" className="no-decorations">
                            Mis eventos
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item onClick={()=>getEvent()}>Evento</Breadcrumb.Item>
                </Breadcrumb>
                {event? 
                <>
                <div className="d-flex justify-content-between w-100">
                    <div className="d-flex gap-3 align-items-center" style={{flexWrap: 'wrap'}}>
                        <div className="d-flex gap-3 align-items-center">
                            <h3 className="bold" style={{maxWidth: '30rem', minWidth: '15rem'}}>{event.title}</h3>
                            {event.creator.subscriptionType === 'premium'?
                                <div className="premium-event-indicator" title="Evento Premium"></div>
                            :null}
                        </div>
                        <StateAlert state={event.state}/>
                        {event.permissions && event.permissions.UPDATE_EVENT_STATE? 
                            <StateTransitionButton
                                event={event}
                                eventOnTime={eventOnTime}
                                reloadEvent={getEvent}
                                style={{minWidth: '8rem'}}
                            />
                        : null}
                    </div>
                    
                    {!['canceled', 'finalized'].includes(event.state)?
                    <div className="d-flex align-items-end me-2" style={{gap:'0.5rem'}}>
                        {/* <OverlayTrigger key={'delete'} placement={'left'} overlay={<Tooltip id={'tooltip-delete'}>Eliminar Evento</Tooltip>}>
                            <Button className="event-delete-button"<FontAwesomeIcon icon={faXmarkCircle}/></Button>
                        </OverlayTrigger> */}
                        <OverlayTrigger key={'addModule'} placement={'left'} overlay={<Tooltip id={'tooltip-submit'}>Recargar evento</Tooltip>}>
                            <FontAwesomeIcon icon={faArrowsRotate} onClick={()=>getEvent()} style={{fontSize: '1.5rem', color: 'var(--text-title)', marginBottom: '0.5rem', cursor: 'pointer'}}/>
                        </OverlayTrigger>
                        {event.permissions && event.permissions.DELETE_EVENT? 
                            <Dropdown>
                                <Dropdown.Toggle style={{fontSize: '1.3rem'}}>
                                    <FontAwesomeIcon icon={faGear} size="lg"/>
                                </Dropdown.Toggle>

                                <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                                    <Dropdown.Item onClick={()=>setShowPermissionsConfigModal(true)}>Editar permisos</Dropdown.Item>
                                    <Dropdown.Item onClick={()=>setShowConfirmationModal(true)}>Eliminar evento</Dropdown.Item>
                                    <Dropdown.Item onClick={()=>setCustomTemplateAddModal({show: true, personalTemplate: true})}>Subir plantilla</Dropdown.Item>
                                    { adminUserIds.includes(myUserId)?
                                        <>
                                            <Dropdown.Divider></Dropdown.Divider>
                                            <Dropdown.Item onClick={()=>setCustomTemplateAddModal({show: true, personalTemplate: false})}>Subir plantilla General</Dropdown.Item>
                                        </>
                                    :null}
                                </Dropdown.Menu>
                            </Dropdown>
                            :
                            <OverlayTrigger key={'exit'} placement={'bottom'} overlay={<Tooltip id={'tooltip-exit'}>Abandonar evento</Tooltip>}>
                                <Button className="btn btn-primary-body mb-1 py-1" onClick={()=>setDeleteConfirmationModal(true)}>
                                    <FontAwesomeIcon size="lg" icon={faArrowRightFromBracket}/>
                                </Button>
                            </OverlayTrigger>
                        }
                    </div>:null}
                </div>
                <Masonry columns={{xs: 1, lg: 2, xl: 3}} spacing={2} className="mt-3 mb-5 w-100">
                    <BasicInfoCard event={event} modify={event.permissions.UPDATE_EVENT && modifyByState}  register={false} handleOnChange={handleOnChange} handleOnChangeField={handleOnChangeField} errors={errors} types={types} handleOnSubmit={handleSubmitBasic} handleReset={handleResetBasic} changedBasic={changedBasic}/>
                    {event.photo !== undefined? <DetailsInfoCard event={event} modify={event.permissions.SAVE_PHOTO_EVENT && modifyByState} reloadEvent={getEvent} setModify={setModify} handleOnChange={handleOnChangeField} errors={errors} handleOnRemove={handleOnRemove} handleOnChangeFile={handleOnChangeFile}  setModalLoading={setModalLoading} handleOnChangePhoto={handleOnChangePhoto}/> : null}
                    {event.address? <LocationInfoCard event={event} modify={event.permissions.UPDATE_EVENT} handleOnChange={handleOnChangeField} errors={errors} handleOnRemove={handleOnRemove} handleOnSubmit={handleSubmitAddress} handleReset={handleResetAddress} handleSetAddress={handleSetAddress} changedAddress={changedAddress}/>: null}
                    {event.guests? <GuestsInfoCard event={event} modify={modifyByState} handleOnChange={handleOnChangeField} errors={errors} handleOnRemove={handleOnRemove} reloadEvent={getGuests} deleteGuest={handleDeleteGuest}/> : null}
                    {event.organizers? <OrganizersInfoCard event={event} modify={modifyByState} handleOnChange={handleOnChangeField} errors={errors} handleOnRemove={handleOnRemove} reloadEvent={getEvent} deleteOrganizer={handleDeleteOrganizer}/> : null}
                    {event.tasks? <TasksInfoCard event={event} modify={modifyByState} errors={errors} handleOnRemove={handleOnRemove} reloadEvent={getTasks} deleteTask={handleDeleteTask} participants={participants}/> : null}
                    {event.consumables? <ConsumableInfoCard event={event} modify={modifyByState} errors={errors} handleOnRemove={handleOnRemove} reloadEvent={getConsumables} deleteConsumable={handleDeleteConsumable}/> : null}
                    {event.expenses? <ExpenseInfoCard event={event} modify={modifyByState} errors={errors} handleOnRemove={handleOnRemove} setModalLoading={setModalLoading}
                                    reloadEvent={getExpenses} deleteExpense={handleDeleteExpense} myExpensesSummary={myExpensesSummary} totalExpensesSummary={totalExpensesSummary} getExpensesSummary={getExpensesSummary} participants={participants}/> : null}
                    {event.services? <ServiceInfoCard event={event} modify={modifyByState} reloadEvent={getServices} deleteService={handleDeleteService} setModalLoading={setModalLoading}/>  : null}
                    {event.transports? <TransportInfoCard event={event} modify={modifyByState} reloadEvent={getTransports} handleOnRemove={handleOnRemove} deleteTransport={handleDeleteTransport}/> : null}
                    {event.polls? <PollsInfoCard event={event} modify={modifyByState} reloadEvent={getPolls} handleOnRemove={handleOnRemove} deletePoll={handleDeletePoll}/> : null}
                    {event.repositories? <RepositoriesInfoCard event={event} modify={modifyByState} reloadEvent={getEvent}/> : null}
                    {!['canceled', 'finalized'].includes(event.state)?
                    <div className="d-flex justify-content-center py-5">
                        <OverlayTrigger key={'addModule'} placement={'bottom'} overlay={<Tooltip id={'tooltip-submit'}>Agregar tarjeta</Tooltip>}>
                            <Button className="btn btn-primary-body btn-add-card" onClick={()=>setShowCardAddModal(true)}>
                                <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            </Button>
                        </OverlayTrigger>
                    </div>: null}
                </Masonry>
                </>
                :<>
                    <h1>{modalLoading? "Cargando evento...": "Hubo un error al cargar el evento"}</h1>
                    <img src={modalLoading? LoadingNotebook : LoadingNotebook} alt="" />
                </> 
                }
            </div>
            {showChat? 
                <EventChat handleCloseChat={()=>setShowChat(false)} event_id={event.event_id} permissions={event.permissions} participants={participants}/>
                :
                <div className="services-messages-icon" onClick={()=>setShowChat(true)}>
                    <FontAwesomeIcon icon={faMessage}/>
                </div>}
            <LoadingModal showModal={modalLoading}/>
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={handleCloseModal}
                message="¡Evento modificado con éxito!"
                img={SuccessPhoneGirl}
            />
            <ModalPassConfirm
                showModal={showConfirmationModal} 
                handleCancel={handleCancelConfirmationModal}
                handleConfirm={handleDelete}
                title="Eliminar evento"
                message="¿Está seguro/a de eliminar su evento?"
                errors={errors.password}
                handleOnChange={handleChangePassword}
            />
            <PermissionsConfigModal 
                showModal={showPermissionsConfigModal}
                handleCloseModal={()=>setShowPermissionsConfigModal(false)}
                participants={participants}
                event_id={event? event_id : null}
                event={event}
                reloadEvent={getPermissions}
            />
            <CardAddModal
                showModal={showCardAddModal}
                handleCloseModal={()=>setShowCardAddModal(false)}
                properties={event? Object.keys(event): []}
                handleAddFields={handleOnAddFields}
                permissions={event? event.permissions: {}}
            />
            <CustomTemplateAddModal
                showModal={customTemplateAddModal.show}
                handleCancel={()=> setCustomTemplateAddModal({show: false})}
                personalTemplate={customTemplateAddModal.personalTemplate}
                event={event}
                title="Guardar plantilla personalizada"
            />
            <YesNoConfirmationModal
                showModal={deleteConfirmationModal}
                title="Abandonar evento"
                message="¿Estás seguro/a de que quieres abandonar este evento? No podrás acceder nuevamente."
                handleCloseModal={()=>setDeleteConfirmationModal(false)}
                handleConfirm={handleExitEvent}
            />
        </div>
    )
}
