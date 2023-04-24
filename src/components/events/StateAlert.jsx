import React from "react";
import Alert from 'react-bootstrap/Alert';

export default function StateAlert( props ){
    
    const getVariant = (state) => {
        if (['created', 'ongoing', 'postEvent', 'finalized'].includes(state)) return 'success';
        if (['delayed', 'suspended'].includes(state)) return 'warning';
        return 'danger';
    }

    const getStateName = (state) => {
        if (state === 'created') return 'En Organización';
        if (state === 'delayed') return 'Demorado';
        if (state === 'ongoing') return 'En curso';
        if (state === 'suspended') return 'Suspendido';
        if (state === 'postEvent') return 'En Post Evento';
        if (state === 'finalized') return 'Finalizado';
        if (state === 'canceled') return 'Cancelado';
        return 'Evento sin Estado';
    }
    
    return (
        <Alert variant={getVariant(props.state)}>{getStateName(props.state)}</Alert>
    )
}