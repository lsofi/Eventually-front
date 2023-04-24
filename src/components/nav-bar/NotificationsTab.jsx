import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import IO from 'socket.io-client';

const connectionUrl = ':4443';
let socket;

export default function NotificationsTab() {
    const notificationsMock = [
        {notification_id:1, title: 'Te han invitado a un evento', message: 'Camila Bermejo te ha invitado al evento "Cumpleaños Camila" el día 27/12/2023.', seen: false},
        {notification_id:2, title: 'Se ha cancelado un evento', message: 'El evento "Recibida en febrero se ha cancelado".', seen: false},
        {notification_id:3, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: false},
        {notification_id:4, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: false},
        {notification_id:5, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: false},
        {notification_id:6, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: false},
        {notification_id:7, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: false},
        {notification_id:8, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: true},
        {notification_id:9, title: 'Tienes una nueva solicitud de CarPooling', message: 'Agustín Maubecín te ha enviado una solicitud para tu transporte "Auto Joaquin" en el evento "Fiesta carnaval."', seen: true},
    ]
    
    const [ notifications, setNotifications ] = useState([]);
    const [ showNotificationsTab, setShowNotificationsTab ] = useState(false);

    useEffect(()=>{

        const token = localStorage.getItem('token');
    
        if (!token) return;

        socket = IO(connectionUrl, {
            auth: {
                token: token,
                notifications: true
            },
        });

        socket.on('notificationsOne', (res) => handleReceiveNotification(res));
        socket.on('notificationsAll', (res) => handleReceiveNotificationsAll(res));

        return ()=> {
            socket.removeListener('notificationsOne');
            socket.removeListener('notificationsAll');
            socket.disconnect();
        }
    }, []);

    const handleReceiveNotificationsAll = (notificationsRes) => {
        setNotifications(notificationsRes);
    }

    const handleReceiveNotification = (notificationRes) => {
        toast.info(notificationRes.title);
        setNotifications(prev => [notificationRes, ...prev]);
    }

    const handleDeleteNotification = (notification) => {
        socket.emit('deleteNotification', notification.notification_id);
    }

    const handleViewNotification = (notification) => {
        socket.emit('readNotification', notification.notification_id);
    }

    const handleDeleteAll = () => {
        socket.emit('deleteAllNotifications');
    }

    const handleViewAll = () => {
        socket.emit('readAllNotifications');
    }

    const handleDeleteViewed = () => {
        socket.emit('deleteAllViewNotifications');
    }

    const getNotSeenNotificationsCount = () => {
        return notifications.filter(notification => !notification.seen).length;
    }

    const notificationsCount = getNotSeenNotificationsCount();

    return (
        <div className="position-relative">
            <Button className={`btn btn-notification ${showNotificationsTab?'active':''} ${!notificationsCount?'no-after':''}`} data-count={notificationsCount} onClick={()=>setShowNotificationsTab(prev => !prev)}>
                <FontAwesomeIcon icon={faBell}/>
            </Button>
            {showNotificationsTab?
                <div className="notifications-tab">
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className='mb-0'>Notificaciones</h3>
                        {notifications.length?
                            <div className="no-dropdown-icon">
                                <Dropdown drop="start">
                                    <Dropdown.Toggle style={{background: 'none'}}>
                                        <FontAwesomeIcon icon={faEllipsisVertical} size="lg"/>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                                        <Dropdown.Item onClick={handleDeleteAll}>Eliminar todas</Dropdown.Item>
                                        <Dropdown.Item onClick={handleDeleteViewed}>Eliminar todas las leídas</Dropdown.Item>
                                        <Dropdown.Item onClick={handleViewAll}>Marcar todas como leídas</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        :null}
                    </div>
                    <hr className="mb-2 mt-0 w-100" style={{height: '2px'}}/>
                    <div className="notifications-container">
                        {notifications.length?
                            notifications.sort((x,y)=>x.seen && !y.seen? 1: x.seen === y.seen? 0 : -1).map((notification, index) => (
                                <div className={`notification-card ${!notification.seen? 'not-seen' : ''}`} key={index}>
                                    <h6 className="text-tertiary">{notification.title}</h6>
                                    {notification.href?
                                        <Link to={notification.href[0] === '/'? notification.href : `/events/event?event_id=${notification.href}`} onClick={()=>handleViewNotification(notification)}  className="no-decorations text-title">
                                            <div title={notification.href[0] === '/'? `Ir a invitación` : `Ir a evento`}>{notification.message}</div>
                                        </Link>
                                        :
                                        <div>{notification.message}</div>
                                    }
                                    <div className="no-dropdown-icon dropdown-notification">
                                        <Dropdown drop="start">
                                            <Dropdown.Toggle size="sm" style={{background: 'none'}}>
                                                <FontAwesomeIcon icon={faEllipsisVertical} size="lg"/>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                                                {!notification.seen? <Dropdown.Item onClick={()=>handleViewNotification(notification)}>Marcar como leída</Dropdown.Item> : null}
                                                <Dropdown.Item onClick={()=>handleDeleteNotification(notification)}>Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            ))
                        : <h5 style={{whiteSpace: 'nowrap'}}>¡No tienes notificaciones!</h5>}
                    </div>
                </div>
            :null}
        </div>
    )
}
