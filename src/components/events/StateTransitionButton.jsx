import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';

export default function StateTransitionButton( props ) {

    const [ loading, setLoading ] = useState(false);

    const handleStartEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            if (['created', 'delayed'].includes(props.event.state)) await axios.put('../api/event/startEvent', params);
            if (props.event.state === 'suspended') await axios.put('../api/event/resumeEvent', params);
            props.reloadEvent();
        } catch (errors) {

        }
        setLoading(prev=>prev-1);
    }

    const handleDelayEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/delayEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }

    const handleEndEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/endEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }

    const handleEndPostEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/endPostEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }

    const handleSuspendEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/suspendEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }
    
    const handleCancelEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/cancelEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }
    
    const handleReorganizeEvent = async () => {
        const params = {event_id: props.event.event_id};
        setLoading(prev=>prev+1);
        try{
            await axios.put('../api/event/reorganizeEvent', params);
            props.reloadEvent();
        } catch (errors) {
            
        }
        setLoading(prev=>prev-1);
    }

    if(!props.event.state || !['created', 'delayed', 'ongoing', 'suspended','postEvent'].includes(props.event.state)) return (
        <></>
    )

    return (
        <Dropdown as={ButtonGroup} style={{...props.style}}>
            {loading? 
                    <Button variant="primary">Cargando...</Button> : null}
            {!loading && (props.event.state === 'created' && props.eventOnTime() || props.event.state === 'delayed')?
                    <Button variant="primary" onClick={handleStartEvent}>Iniciar Evento</Button> : null}
            {!loading && props.event.state === 'created' && !props.eventOnTime()?
                    <Button variant="primary" onClick={handleStartEvent}>Iniciar Evento</Button> : null}
            {!loading && props.event.state === 'ongoing'?
                    <Button variant="primary" onClick={handleEndEvent}>Terminar Evento</Button> : null}
            {!loading && props.event.state === 'postEvent'?
                    <Button variant="primary" onClick={handleEndPostEvent}>Finalizar PostEvento</Button> : null}
            {!loading && props.event.state === 'suspended'?
                    <Button variant="primary" onClick={handleReorganizeEvent}>Reorganizar Evento</Button> : null}

            <Dropdown.Toggle variant="primary" id="dropdown-split-basic" disabled={props.event.state === 'postEvent'} />

            <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                {['created'].includes(props.event.state) && !props.eventOnTime()?
                    <Dropdown.Item onClick={handleDelayEvent}>Retrasar evento</Dropdown.Item> : null}
                {['suspended'].includes(props.event.state)?
                    <Dropdown.Item onClick={handleStartEvent}>Iniciar Evento</Dropdown.Item> : null}
                {['created', 'delayed', 'ongoing'].includes(props.event.state)?
                    <Dropdown.Item onClick={handleSuspendEvent}>Suspender Evento</Dropdown.Item> : null}
                {['created', 'delayed', 'ongoing', 'suspended'].includes(props.event.state)?
                    <Dropdown.Item onClick={handleCancelEvent}>Cancelar Evento</Dropdown.Item> : null}
            </Dropdown.Menu>
        </Dropdown>
    )
}
