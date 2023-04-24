import React from "react";
import Badge from 'react-bootstrap/Badge';

export default function StatePill( props ){
    
    const getVariant = (state) => {
        if (['created', 'ongoing', 'postEvent', 'finalized'].includes(state)) return 'success';
        if (['delayed', 'suspended'].includes(state)) return 'warning';
        return 'danger';
    }

    const getPillText = (state)=>{
        if (getVariant(state) === "warning") return "dark";
        else return "white";
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
        <Badge pill bg={getVariant(props.state)} text={getPillText(props.state)}>{getStateName(props.state)}</Badge>
    )
}