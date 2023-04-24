import React, {useState, useEffect} from 'react';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import CloseButton from "react-bootstrap/CloseButton";
import Spinner from "react-bootstrap/Spinner";
import Nav from "react-bootstrap/Nav";
import Placeholder from 'react-bootstrap/Placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export default function PermissionsConfigModal( props ) {

    const [ loading, setLoading ] = useState(false);
    const [ loadingUser, setLoadingUser] = useState(false);
    const [ key, setKey ] = useState('users');
    const [ roleKey, setRoleKey ] = useState('organizer')
    const [ user_id, setUser_id ] = useState(undefined);
    const [ userFilter, setUserFilter ] = useState('');
    const [ newRolePermissions, setNewRolePermissions ] = useState({});
    const [ newUserPermissions, setNewUserPermissions ] = useState({});
    const [ rolePermissions, setRolePermissions ] = useState({});
    const [ userPermissions, setUserPermissions ] = useState({});
    const [ expandUsers, setExpandUsers ] = useState(true);

    useEffect(()=>{
        if (!props.showModal) return;
        setKey('roles');
        setRolePermissions({ORGANIZER: props.event.ORGANIZER, GUEST: props.event.GUEST, SERVICE: props.event.SERVICE})
    },[props.showModal])

    const roles = [
        {name: 'Organizador', id: 'organizer'}, 
        {name: 'Invitado', id: 'guest'}, 
        {name: 'Proveedor de Servicios', id: 'service'}
    ];

    const permissions = [
        {id: 'DELETE_EVENT', name: 'Eliminar evento', description: 'Puede eliminar el evento permanentemente.'},
        {id: 'UPDATE_EVENT', name: 'Modificar evento', description: 'Puede modificar la información básica y la ubicación del evento.'},
        {id: 'UPDATE_EVENT_STATE', name: 'Actualizar estado del evento', description: 'Puede actualizar los estados del evento.'},
        {id: 'SAVE_PHOTO_EVENT', name: 'Modificar foto de evento', description: 'Puede modificar la foto del evento.'},
        {id: 'VIEW_ORGANIZERS', name: 'Ver organizadores', description: 'Puede ver los organizadores.'},
        {id: 'REGISTER_ORGANIZER', name: 'Agregar organizadores', description: 'Puede agregar organizadores.'},
        {id: 'DELETE_ORGANIZER', name: 'Eliminar organizadores', description: 'Puede eliminar organizadores.'},
        {id: 'REGISTER_GUEST', name: 'Agregar invitados', description: 'Puede agregar invitados.'},
        {id: 'GENERATE_INVITATION_LINK', name: 'Generar enlace de invitación', description: 'Puede generar un enlace de invitación al evento.'},
        {id: 'DELETE_GUEST', name: 'Eliminar invitados', description: 'Puede eliminar invitados.'},
        {id: 'VIEW_ALL_TASKS', name: 'Ver todas las tareas', description: 'Puede ver todas las tareas del evento.'},
        {id: 'VIEW_OWN_TASK', name: 'Ver tareas propias', description: 'Puede ver sólo las tareas en las que es responsable.'},
        {id: 'CREATE_ACTIVITY', name: 'Agregar tareas', description: 'Puede agregar cualquier tipo de tareas.'},
        {id: 'DELETE_ACTIVITY', name: 'Eliminar tareas', description: 'Puede eliminar cualquier tarea.'},
        {id: 'DELETE_OWN_ACTIVITY', name: 'Eliminar tarea propia', description: 'Puede eliminar las tareas en las que es responsable.'},
        {id: 'REGISTER_IN_CHARGE_ACTIVITY', name: 'Agregar responsable de tarea', description: 'Puede agregar un responsable a las tareas.'},
        {id: 'DELETE_IN_CHARGE_ACTIVITY', name: 'Eliminar responsable de tarea', description: 'Puede eliminar al responsable de cualquier tarea.'},
        {id: 'COMPLETE_ACTIVITY', name: 'Finalizar tarea', description: 'Puede marcar como finalizada cualquier tarea.'},
        {id: 'COMPLETE_OWN_ACTIVITY', name: 'Finalizar tarea propia', description: 'Puede marcar como finalizadas las tareas en las que es responsable.'},
        {id: 'UPDATE_ACTIVITY', name: 'Modificar tarea', description: 'Puede modificar cualquier tarea.'},
        {id: 'UPDATE_OWN_ACTIVITY', name: 'Modificar tarea propia', description: 'Puede modificar tareas en las que es responsable.'},
        {id: 'VIEW_CONSUMABLES', name: 'Ver consumibles', description: 'Puede ver todos los consumibles.'},
        {id: 'CREATE_CONSUMABLE', name: 'Agregar consumible', description: 'Puede agregar consumibles.'},
        {id: 'DELETE_CONSUMABLE', name: 'Eliminar consumible', description: 'Puede eliminar los consumibles.'},
        {id: 'UPDATE_CONSUMABLE', name: 'Modificar consumible', description: 'Puede modificar los consumibles.'},
        {id: 'SUBSCRIBE_TO_CONSUMABLE', name: 'Suscribirse a consumible', description: 'Puede suscribirse a los consumibles.'},
        {id: 'UNSUBSCRIBE_TO_CONSUMABLE', name: 'Desuscribirse a consumible', description: 'Puede desuscribirse a los consumibles que estaba suscrito.'},
        {id: 'VIEW_ALL_EXPENSES', name: 'Ver todos los gastos', description: 'Puede ver todos los gastos.'},
        {id: 'VIEW_OWN_EXPENSES', name: 'Ver gastos propios', description: 'Puede ver sólo los gastos en los que es responsable.'},
        {id: 'VIEW_EXPENSES_REVIEW', name: 'Ver resumen de gastos', description: 'Puede ver su propio resumen de gastos personales.'},
        {id: 'COMPLETE_TRANSACTION', name: 'Marcar transacción cómo completada', description: 'Puede marcar una transacción en la cual le deben como completada.'},
        {id: 'VIEW_TOTAL_EXPENSES_REVIEW', name: 'Ver resumen total de gastos', description: 'Puede ver el resumen total de todos los gastos.'},
        {id: 'CREATE_EXPENSE', name: 'Agregar gastos', description: 'Puede agregar gastos.'},
        {id: 'UPDATE_EXPENSE', name: 'Modificar gastos', description: 'Puede modificar cualquier gasto.'},
        {id: 'UPDATE_OWN_EXPENSE', name: 'Modificar gastos propios', description: 'Puede modificar los gastos en los que sea responsable.'},
        {id: 'UPDATE_EXPENSE_SUBSCRIBERS_LIST', name: 'Modificar lista de suscriptores de gastos', description: 'Puede modificar la lista de suscriptores de cualquier gasto.'},
        {id: 'UPDATE_OWN_EXPENSE_SUBSCRIBERS_LIST', name: 'Modificar lista de suscriptores de gastos propios', description: 'Puede modificar la lista de suscriptores de los gastos en los que sea responsable.'},
        {id: 'DELETE_EXPENSE', name: 'Eliminar gasto', description: 'Puede eliminar cualquier gasto.'},
        {id: 'DELETE_OWN_EXPENSE', name: 'Eliminar gasto propio', description: 'Puede eliminar los gastos en los que es responsable.'},
        {id: 'SPLIT_EXPENSES', name: 'Dividir gastos', description: 'Puede hacer la división de gastos para generar los reportes.'},
        {id: 'DELETE_SERVICE_TO_EVENT', name: 'Eliminar servicio', description: 'Puede eliminar un servicio del evento.'},
        {id: 'ADD_SERVICE_TO_EVENT', name: 'Agregar servicio', description: 'Puede agregar un servicio a un evento.'},
        {id: 'CREATE_TRANSPORT', name: 'Crear transporte', description: 'Puede crear un transporte.'},
        {id: 'UPDATE_TRANSPORT', name: 'Modificar transporte', description: 'Puede modificar cualquier transporte.'},
        {id: 'DELETE_TRANSPORT', name: 'Eliminar transporte', description: 'Puede eliminar cualquier transporte.'},
        {id: 'UPDATE_OWN_TRANSPORT', name: 'Modificar transporte propio', description: 'Puede modificar aquellos transportes que haya creado.'},
        {id: 'ACCEPT_SUBSCRIBER_TO_TRANSPORT', name: 'Aceptar solicitud de transporte', description: 'Puede aceptar una solicitud para su transporte.'},
        {id: 'SUBSCRIBE_TO_TRANSPORT', name: 'Suscribirse a transporte', description: 'Puede enviar una solicitud de transporte.'},
        {id: 'UNSUBSCRIBE_TO_TRANSPORT', name: 'Desuscribirse a transporte', description: 'Puede eliminar su suscripción de transporte.'},
        {id: 'CREATE_CHAT_ROOM_EVENT', name: 'Crear sala de chat', description: 'Puede crear una sala de chat para el evento.'},
        {id: 'CREATE_FILE_REPOSITORY', name: 'Crear carpeta de archivos', description: 'Puede crear una carpeta de archivos para el evento.'},
        {id: 'VIEW_FILES', name: 'Ver carpeta de archivos', description: 'Puede ver la carpeta de archivos del evento.'},
        {id: 'DELETE_FILE_REPOSITORY', name: 'Eliminar carpeta de archivos', description: 'Puede eliminar la carpeta de archivos del evento.'},
        {id: 'SAVE_FILE', name: 'Subir archivos', description: 'Puede subir archivos a la carpeta de archivos del evento.'},
        {id: 'DELETE_FILE', name: 'Eliminar archivo', description: 'Puede eliminar un archivo de la carpeta de archivos del evento.'},
        {id: 'CREATE_PHOTO_ALBUM', name: 'Crear álbum de fotos', description: 'Puede crear un álbum de fotos para el evento.'},
        {id: 'VIEW_PHOTOS', name: 'Ver álbum de fotos', description: 'Puede ver el álbum de fotos del evento.'},
        {id: 'DELETE_PHOTO_ALBUM', name: 'Eliminar álbum de fotos', description: 'Puede eliminar el álbum de fotos del evento.'},
        {id: 'DELETE_PHOTO', name: 'Eliminar foto', description: 'Puede eliminar una foto del álbum de fotos del evento.'},
        {id: 'SAVE_PHOTO', name: 'Subir fotos', description: 'Puede subir fotos al álbum de fotos del evento.'},
        {id: 'CREATE_REPOSITORY_OR_ALBUM', name: 'Crear álbum de fotos o carpeta de archivos', description: 'Puede crear un álbum de fotos o una carpeta de archivos para el evento.'},
        {id: 'CREATE_POLL', name: 'Crear encuesta', description: 'Puede crear una encuesta para el evento.'},
        {id: 'UPDATE_POLL', name: 'Modificar encuesta', description: 'Puede modificar encuestas del evento.'},
        {id: 'DELETE_POLL', name: 'Eliminar encuesta', description: 'Puede eliminar una encuesta del evento.'},
        {id: 'RESPOND_POLL', name: 'Responder encuesta', description: 'Puede responder encuestas.'},
        {id: 'UPDATE_PERMISSIONS', name: 'Modificar permisos', description: 'Puede modificar los permisos.'},
        {id: 'REMOVE_ME_FROM_EVENT', name: 'Abandonar evento', description: 'Puede abandonar el evento.'},

    ];

    const handleOnChange = (event) => {
        const value = event.target.value;
        setUserFilter(value.trim());
    }

    const handleChangeRole = async (role) => {
        await handleSubmitRolePermission()
        setNewRolePermissions({});
        setRoleKey(role);
    }

    const handleOnChangePermission = (event) => {
        const checked = event.target.checked;
        const value = event.target.value;
        const name = event.target.name;
        if (key === 'users'){
            setNewUserPermissions({...newUserPermissions, [name]: checked});
            setUserPermissions({...userPermissions, [name]: checked})
        }
        else {
            setNewRolePermissions({...newRolePermissions, [name]: checked});
            setRolePermissions({...rolePermissions, [value.toUpperCase()]: {...rolePermissions[value.toUpperCase()], [name]: checked}});
        }
    }

    const filter = (participant) => {
        return (participant.username.toLowerCase().includes(userFilter.toLowerCase()) || userFilter === '') && participant.user_id !== props.event.creator.user_id;
    }

    const handleChangeKey = async (newKey) => {
        if (key === 'roles') {
            await handleSubmitRolePermission()
            setNewRolePermissions({});
            setKey(newKey);
        } else {
            await handleSubmitUserPermissions()
            setUser_id(undefined);
            setKey(newKey);

        }
    }

    const handleChangeUser = async (user_id) => {
        setLoadingUser(true);
        await handleSubmitUserPermissions()
        setUser_id(user_id);
        try{
            const res = await axios.get(`../api/permissions/getUserPermissions?event_id=${props.event_id}&user_id=${user_id}`)
            setNewUserPermissions({});
            setUserPermissions(res.data);
        } catch (error) {}      
        setLoadingUser(false);
    }

    const handleConfirm = async () => {
        if (key === 'roles') {
            await handleSubmitRolePermission();
            setNewRolePermissions({});
            props.reloadEvent()
        } else {
            await handleSubmitUserPermissions()
            setNewUserPermissions({});
            props.reloadEvent();
        }
        props.handleCloseModal();
    }

    const handleSubmitRolePermission = async () => {
        if (isEmpty(newRolePermissions)) return;
        setLoading(prev=>prev+1);
        const params = {role: roleKey, event_id: props.event_id, permissions: newRolePermissions}
        try{
            await axios.put('../api/event/udpateRolePermissions', params)
        } catch (error){}
        setLoading(prev=>prev-1);
    }

    const handleSubmitUserPermissions = async () => {
        if (isEmpty(newUserPermissions)) return;
        setLoadingUser(true);
        const params = {user_id: user_id, event_id: props.event_id, permissions: newUserPermissions}
        try{
            await axios.put('../api/event/updateParticipantsPermissions', params)
        } catch (error){}
        setLoadingUser(false);
    }

    const toggleExpandUsers = () => {
        setExpandUsers(prev => !prev);
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size="lg" >
            <Modal.Header>
                <Modal.Title>Editar permisos</Modal.Title>
                <CloseButton onClick={props.handleCloseModal}></CloseButton>
            </Modal.Header>
            <Modal.Body className="mx-2">
                <Nav className="permissions-nav" variant="tabs" defaultActiveKey="roles" onSelect={(selectedKey) => handleChangeKey(selectedKey)}>
                    <Nav.Item >
                        <Nav.Link eventKey="roles">Por Rol</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="users">Por Usuario</Nav.Link>
                    </Nav.Item>
                </Nav>
                {loading? 
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-3">
                        <Spinner as="span" animation="border" role="status" aria-hidden="true"/>
                        <h1>Cargando...</h1>
                    </div> : null}
                {!loading && key === 'roles' ? 
                    <div className="mt-2">
                        <Accordion onSelect={(role)=>handleChangeRole(role)}>
                            {roles.map((role, key) => (
                                <Accordion.Item eventKey={role.id} key={key} className="mt-4 mx-0">
                                    <Accordion.Header>
                                        {role.name}
                                    </Accordion.Header>
                                    <Accordion.Body style={{overflowY: 'auto', maxHeight: '55vh'}}>
                                        <Form className="d-flex flex-column gap-3">
                                            {permissions.map((permission, key) => (
                                                <Form.Group controlId={role.id+'_'+permission.id} key={key}>
                                                    <div className='d-flex justify-content-between align-items-center' style={{marginLeft: '1rem'}}>
                                                        <div className="d-flex flex-column">
                                                            <Form.Label className='m-0'>{permission.name}</Form.Label>
                                                            <label htmlFor={role.id+'_'+permission.id}>{permission.description}</label>
                                                        </div>
                                                        <Form.Check type="switch" id={role.id+'_'+permission.id} name={permission.id} value={role.id} 
                                                            checked={rolePermissions[role.id.toUpperCase()]? rolePermissions[role.id.toUpperCase()][permission.id]: false}
                                                            style={{fontSize: '1.5rem'}} onChange={handleOnChangePermission}/>
                                                    </div>
                                                </Form.Group>
                                            ))}
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>
                : null}
                {!loading && key === 'users' ?
                    <div>
                        <Form.Group className='mx-5 mt-2 mb-4'>
                            <Form.Label>Buscar usuario</Form.Label>
                            <Form.Control type="title" placeholder="" maxLength={50} value={userFilter} onChange={handleOnChange}/>
                        </Form.Group>
                        <div className="mt-2 d-flex" style={{maxHeight: '65vh'}}>
                            <div className="d-flex flex-column align-items-end">
                                <Button className="user-bars reset-btn mx-1" onClick={toggleExpandUsers}><FontAwesomeIcon icon={faBars}/></Button>
                                <div className={`px-2 permissions-user-tab ${expandUsers? 'active': ''}`}>
                                    {props.participants.filter((participant) => (filter(participant))).length?
                                    props.participants.filter((participant) => (filter(participant)))
                                    .map((participant, key) => (
                                        <div key={key} onClick={()=>handleChangeUser(participant.user_id)} style={{minWidth:  "10rem", cursor: "pointer"}}>
                                            <h5 style={user_id === participant.user_id? {color: "var(--tertiary)"}: null}>@{participant.username}</h5>
                                        </div>
                                    )): <h5 className="text-center mt-4">No se encontraron usuarios</h5>}
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-grow-1" style={{overflowY: 'auto'}}>
                                <Form className="gap-3">
                                    {loadingUser? 
                                            [0,1,2,3,4,6,7,8].map(index=>(
                                                <div key={index} className="d-flex align-items-center px-2">
                                                    <div className="d-flex flex-column flex-grow-1">
                                                        <Placeholder animation="wave" className="m-1 rounded" 
                                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '10rem'}}
                                                        />
                                                        <Placeholder animation="wave" className="m-1 rounded" 
                                                            style={{backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '80%'}}
                                                        />
                                                    </div>
                                                    <Placeholder animation="wave" className="m-1" 
                                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '3rem', borderRadius: '1rem'}}
                                                    />
                                                </div>
                                            ))
                                    : 
                                        <>
                                        {user_id? permissions.map((permission, key) => (
                                            <Form.Group controlId={user_id+'_'+permission.id} key={key}>
                                                <div className='d-flex justify-content-between align-items-center' style={{marginLeft: '1rem'}}>
                                                    <div className="d-flex flex-column">
                                                        <Form.Label className='m-0'>{permission.name}</Form.Label>
                                                        <label htmlFor={user_id+'_'+permission.id}>{permission.description}</label>
                                                    </div>
                                                    <Form.Check type="switch" id={user_id+'_'+permission.id} name={permission.id} value={user_id} 
                                                        checked={userPermissions[permission.id]}
                                                        style={{fontSize: '1.5rem'}} onChange={handleOnChangePermission}/>
                                                </div>
                                            </Form.Group>
                                            )) : <h4 className='text-center mt-4'>Seleccione un usuario</h4>}
                                        </>}                      
                                </Form>
                            </div>
                        </div>
                    </div>
                : null}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                    Cancelar
                </Button>                    
                <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
