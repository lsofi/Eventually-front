import React, { useState, useEffect }  from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faCalendarAlt, faClipboardCheck, faExpand, faCompress, faSearch, faInfoCircle, faUserTie } from '@fortawesome/free-solid-svg-icons';
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import TaskAddModal from '../../modals/TaskAddModal';
import TaskConfigModal from '../../modals/TaskConfigModal';
import CalendarScheduleModal from '../../modals/CalendarScheduleModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

export default function TasksInfoCard(props) {

    const [ showTaskAddModal, setShowTaskAddModal ] = useState(false); // Maneja el estado para mostrar el modal de agregar la tarea.
    const [ taskConfigModal, setTaskConfigModal ] = useState({show:false});
    const [ showCalendarScheduleModal, setShowCalendarScheduleModal ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ selectedTask, setSelectedTask ] = useState({});
    const [ listHeight, setListHeight ] = useState(40);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters] = useState({});

    const helpText = "En esta tarjeta podrás agregar tareas tanto para la organización previa del evento, como para las actividades que se realizarán en el evento. Podrás asignar responsables, una fecha y hora de inicio, una fecha y hora de fin y también podrás crear una lista de ítems necesarios para cumplir con la tarea."

    const getCheckListCompletionLabel = (task) => {
        const denum = task.checklist.length;
        let cant = task.checklist.filter(check=> check.completed).length;

        return `${cant}/${denum}`;
    }

    const getCheckListCompletion = (task) => {
        const denum = task.checklist.length;
        let cant = task.checklist.filter(check=> check.completed).length;

        return (cant/denum)*100;
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const toggleIsOwnFilter = () => {
        setFilters(prev => ({...prev, isOwn: !prev.isOwn}));
    }

    const getTasksFilters = () => {

        const state = filters.state === 'true'? true : false;
        
        return props.event.tasks.filter(task => {

            let nameFilter = true;
            let stateFilter = true;
            let isOwnFilter = true;

            if (filters.name) nameFilter = task.name.toLowerCase().includes(filters.name.toLowerCase().trim());
            if (filters.state) stateFilter = task.complete == state || !task.complete && !state;
            if (filters.isOwn) isOwnFilter = task.isOwn;

            return true && nameFilter && stateFilter && isOwnFilter;
        })
    }

    const handleOpenTask = (task) => {
        setTaskConfigModal({show: true, task: task})
    }

    const deleteTaskConfirmation = (task) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar la actividad "${task.name}" del evento?`,
            task: task, 
            show: true}));
    }

    const confirmDeleteTask = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteTask(deleteConfirmationModal.task);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className='d-flex justify-content-between'>
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Tareas</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon 
                            icon={cardOrModalShow? faCompress : faExpand} 
                            title={cardOrModalShow? 'Comprimir' : 'Expandir'} 
                            className="expand-icon" 
                            onClick={()=>{setCardOrModalShow(prev => !prev); setFilters({})}}
                        />
                    </div>
                    {props.event.tasks && props.modify && props.event.tasks.length === 0? 
                        props.event.permissions.DELETE_EVENT? <CloseButton onClick={()=>props.handleOnRemove('tasks')}/>: null
                        :
                    props.event.tasks && props.event.tasks.length ?
                        <Button className="btn btn-primary-body py-1 align-items-center d-flex" onClick={()=>setShowCalendarScheduleModal(true)}>
                            <FontAwesomeIcon size="lg" icon={faCalendarAlt}/>
                            &nbsp;Ver cronograma
                        </Button> : null}
                </div>
                <hr className="mx-0 my-1" style={{height: '2px'}}/>
                { cardOrModalShow?
                    <div>
                        <Form>
                            <Row>
                                <Col lg={8} className="d-flex align-items-center gap-2">
                                    <div className="home-search-container w-100">
                                        <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                                        <Button className="search-input-btn">
                                            <FontAwesomeIcon icon={faSearch}/>
                                        </Button>
                                    </div>
                                    <OverlayTrigger key={'isOwn'} placement={'bottom'} overlay={<Tooltip id={'tooltip-isOwn'}>Tareas propias</Tooltip>}>
                                        <FontAwesomeIcon style={{cursor: 'pointer', color: filters.isOwn? 'var(--primary)' : 'var(--text-title'}} 
                                                    icon={faUserTie} onClick={toggleIsOwnFilter}/>
                                    </OverlayTrigger>
                                </Col>
                                <Col lg={4}>
                                    <Form.Group className="d-flex gap-3 py-1 align-items-center">
                                        <Row className="w-100 m-0">
                                            <Col lg={3} md={12} className="d-flex align-items-center">
                                                <Form.Label className="m-0">Estado</Form.Label>
                                            </Col>
                                            <Col lg={9} md={12}>
                                                <Form.Select value={filters.state} name="state" onChange={handleOnChange}>
                                                    <option value=""></option>
                                                    <option value={true}>Completada</option>
                                                    <option value={false}>Pendiente</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                : null}
                <div className="list-container-container">
                    <div className="list-container" style={{maxHeight: `${listHeight}rem`}}>
                        {/*Si se muestra la card pero no tiene tareas, me indica que no hay tareas todavía*/}
                        {!props.event.tasks || props.event.tasks.length === 0? <p>No hay tareas todavía</p>:null}
                        {/*Si el evento ya tiene tareas, las muestra*/}
                        {props.event.tasks? getTasksFilters().map((task) => {
                            return (
                                <Card key={task.activity_id} className='m-1 participant-info'>
                                    <Card.Body style={{borderRadius: "0.5rem"}}>
                                        <div className="d-flex justify-content-between align-items-center" style={{gap: "1rem"}}>
                                            <div className="d-flex align-items-center p-1 justify-content-between" style={{flexGrow: "1"}} onClick={() => handleOpenTask(task)}>
                                                    <div>
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <h4 className='mb-0'>{task.name}</h4>
                                                            {task.isOwn? 
                                                                <OverlayTrigger key={'isOwn-card'} placement={'bottom'} overlay={<Tooltip id={'tooltip-isOwn-card'}>Eres responsable de esta tarea</Tooltip>}>
                                                                    <FontAwesomeIcon style={{color: 'var(--primary)'}} icon={faUserTie}/>
                                                                </OverlayTrigger>
                                                            : null}
                                                        </div>
                                                        {task.checklist? 
                                                            <>
                                                                <FontAwesomeIcon icon={faClipboardCheck} size="xs"/> {getCheckListCompletionLabel(task)} 
                                                            </>: null}
                                                    </div>
                                                <Badge pill bg={task.complete? "success": "warning"} text={task.complete? "white": "dark"}>{task.complete? "Completada": "Pendiente"}</Badge>
                                            </div>
                                            {props.modify && (props.event.permissions.DELETE_ACTIVITY || props.event.permissions.DELETE_OWN_ACTIVITY && task.isOwn) ? 
                                                <Button className="delete-btn mx-2 d-flex" onClick={()=>deleteTaskConfirmation(task)}><FontAwesomeIcon icon={faTimesCircle}/></Button> 
                                            :null}
                                        </div>
                                        {task.checklist? <ProgressBar now={getCheckListCompletion(task)} variant={getCheckListCompletion(task) == 100? "success" : null}/>: null}
                                    </Card.Body>
                                </Card>
                            );
                        }): null}
                    </div>
                    {/* Si el evento está en modo modificar, se muestra el botón para agregar una tarea, que abre el modal para agregar una tarea */}
                    {props.modify && props.event.permissions.CREATE_ACTIVITY ?
                        <div className='d-flex justify-content-center m-2 add-button'>
                            <Button className="btn btn-primary-body btn-add d-flex" onClick={()=>setShowTaskAddModal(true)}>
                                <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                &nbsp;Agregar tarea
                            </Button>
                        </div>
                        : 
                        null
                    }
                </div>
            </div>
        </CardOrModal>
        <TaskAddModal 
            showModal={showTaskAddModal}
            title="Agregar Tarea"
            handleCloseModal={()=>{setShowTaskAddModal(false)}}
            reloadEvent={props.reloadEvent}
            event_id={props.event.event_id}
            participants={props.participants}
            permissions={props.event.permissions}
        />
        <TaskConfigModal 
            showModal={taskConfigModal.show}
            task={taskConfigModal.task}
            modify={props.modify}
            handleCloseModal={()=>{setTaskConfigModal({show:false})}}
            participants={props.participants}
            reloadEvent={props.reloadEvent}
            event_id={props.event.event_id}
            permissions={props.event.permissions}
        />
        <CalendarScheduleModal
            showModal={showCalendarScheduleModal}
            handleCloseModal={()=>setShowCalendarScheduleModal(false)}
            tasks={props.event.tasks}
            event={props.event}
            handleOpenTask={handleOpenTask}
        />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar tarea"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteTask}
        />
        </>
    );
}