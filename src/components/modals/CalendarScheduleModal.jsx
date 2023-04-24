import React, {useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/CloseButton';
import MyCalendar from '../MyCalendar';

export default function CalendarScheduleModal( props ) {    
    const tasks = [...props.tasks,
        {
            name: props.event.title,
            start_date: props.event.start_date,
            start_time: props.event.start_time,
            end_date: props.event.end_date,
            end_time: props.event.end_time,
            className: 'calendar-event'
        }
    ]

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} size="lg" className='Modal'>
            <Modal.Header>
                <Modal.Title>Cronograma</Modal.Title>
                <CloseButton onClick={props.handleCloseModal}></CloseButton>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex align-items-start flex-column gap-2 ms-3">
                    <div className="d-flex gap-2 align-items-center">
                        <div style={{width: '1rem', height: '1rem', backgroundColor: 'var(--tertiary)'}}/>
                        <h5 className="m-0">Tareas</h5>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        <div style={{width: '1rem', height: '1rem', backgroundColor: 'var(--primary)'}}/>
                        <h5 className="m-0">Evento</h5>
                    </div>
                </div>
                <MyCalendar tasks={tasks} handleOpenTask={props.handleOpenTask} handleCloseModal={props.handleCloseModal}/>
            </Modal.Body>
        </Modal>
    )
}
