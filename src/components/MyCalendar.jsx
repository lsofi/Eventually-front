import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
import 'moment/dist/locale/es-mx';
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale('es-mx');
const localizer = momentLocalizer(moment);

const messages = {
    next: ">",
    previous: "<",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    event: 'Tarea',
    date: "Día",
    time: 'Hora',
    allDay: 'Todo el día',
    noEventsInRange: 'No hay tareas en esta fecha'
}

export default function MyCalendar(props) {    
    return (
        <div>
            <Calendar
                localizer={localizer}
                events={props.tasks.map(task => { if (task.start_date) return (
                    {
                        title: task.name,
                        start: new Date(`${task.start_date} ${task.start_time}`), 
                        end: task.end_date? new Date(`${task.end_date} ${task.end_time}`) : new Date(`${task.start_date} ${task.start_time}`),
                        className: task.className? task.className : task.complete? 'calendar-task-completed': 'calendar-task',
                        activity_id: task.activity_id
                    }
                )})}
                style={{ height: "60vh", margin: "1rem 1rem" }}
                defaultView="month"
                messages={messages}
                culture={'es-mx'}
                eventPropGetter={(event) => {return { className: event.className }}}
                onDoubleClickEvent={(event) => {
                    if (event.activity_id) props.handleOpenTask(event);
                    else props.handleCloseModal();
                }}
            />
        </div>
    )
}