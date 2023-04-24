import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './chat.css';
import { getMyUserId, getMyUserName } from '../../shared/shared-methods.util';
import CloseButton from "react-bootstrap/CloseButton";
import Placeholder from "react-bootstrap/Placeholder";
import Button from "react-bootstrap/Button";
import Dropdown from 'react-bootstrap/Dropdown';
import TextField from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Popover from '@mui/material/Popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { toast } from 'react-toastify';
import IO from 'socket.io-client';

import YesNoConfirmationModal from '../modals/YesNoConfirmationModal';
import LoadingModal from '../modals/LoadingModal';

import defaultChatImg from '../../resources/images/ventana-de-chat.png'


const connectionUrl = ':4443'; //! hay que hacerla variable de entorno
let socket;

export default function ServiceChat( props ) {

    const [ message, setMessage ] = useState('');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ rooms, setRooms ] = useState(undefined);
    const [ currentRoom, setCurrentRoom ] = useState(undefined);
    const [ messages, setMessages] = useState(undefined);
    const [ expandRooms, setExpandRooms ] = useState(true);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ loading, setLoading ] = useState(0);

    const myUser = getMyUserId();
    const myUserName = getMyUserName();
    const openEmojiSelector = Boolean(anchorEl);
    const idEmojiSelector = openEmojiSelector ? 'simple-popover' : undefined;

    const bottomRef = useRef();

    useEffect(()=> {
        const token = localStorage.getItem('token');
        socket = IO(connectionUrl, {
            auth: {
                token: token
            }
        });

        socket.on('rooms', (data) =>  handleReceiveRooms(data))

        socket.on('new_message', (data) => handleReceiveMessage(data));
        
        socket.on('get_messages', (data) => handleReceiveMessages(data));

        return () => socket.disconnect()
    }, []);

    const handleReceiveRooms = (resRooms) => {
        setRooms(resRooms)
    }

    const handleReceiveMessages = resMessages => {
        if (!resMessages) return;
        setMessages(resMessages)
    }

    const handleReceiveMessage = resMessage => {
        setMessages(prev => {
            if (prev) return [resMessage, ...prev];
            return [resMessage];
        });
    }

    const handleJoinRoom = (room) => {
        setMessages([]);
        if (currentRoom) socket.emit('leaveRoom', currentRoom.room_id);
        socket.emit('joinRoom', room.room_id);
        setCurrentRoom(room);
    }

    const handleOnChangeMessage = (event) =>{
        let value = event.target.value;
        if (value === '\n') return;
        setMessage(value);
    }

    const handleOpenEmojiSelector = (event) => {
        setAnchorEl(event.target);
    };

    const handleCloseEmojiSelector = () => {
        setAnchorEl(null);
    }

    const handleAddEmoji = (emoji) => {
        setMessage(prev => prev + emoji.native);
    }

    const handleSendMessage = () => {
        const checkerMessage = message.replace(/(\r\n|\n|\r)/gm, "");
        if (!checkerMessage) return;
        const newMessage = {
            sender: myUser, 
            username: myUserName , 
            message: message, 
            seen: false,
        };
        setMessage('');
        
        socket.emit('createMessageService', {room: currentRoom.room_id, message: newMessage});
    }

    const handleKeyDown = (event) => {
        if(!event.shiftKey && event.keyCode == 13){
            handleSendMessage();
        }
    }

    const handleConfirmDeleteRoom = () => {
        setDeleteConfirmationModal({show: true, title: 'Eliminar sala de chat', message: `¿Está seguro/a de eliminar la sala "${currentRoom.name}"?`, callback: confirmDeleteRoom});
    }

    const confirmDeleteRoom = async () => {
        setDeleteConfirmationModal({show: false});
        setLoading(prev => prev + 1);
        try {
            const params = {
                room_id: currentRoom.room_id,
            }
            await axios.delete('../api/chats/deleteServiceChat', {data: params});
            toast.info(`Has eliminado la sala "${currentRoom.name}"`);
            handleDeleteRoomById(currentRoom.room_id);
        } catch (error) {console.log(error);}
        setLoading(prev => prev - 1);
        setCurrentRoom(undefined);
    }

    const handleDeleteRoomById = room_id => {
        if (rooms && rooms.length > 0) setRooms(prev => (prev.filter(room => room.room_id !== room_id)));
    }


    const isOwnMessage = message => {
        return message.sender === myUser;
    }

    const toggleExpandRooms = () => {
        setExpandRooms(prev => !prev);
    }

    return (
        <div className="services-chat-container">
            {currentRoom?
            <div className="chat-window-container" onClick={()=>setExpandRooms(false)}>
                    <div className="chat-window-header justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <img src={currentRoom.photo? currentRoom.photo: defaultChatImg} style={{width: '4rem', height: '4rem', borderRadius: '2rem', objectFit: 'cover'}}/>
                            <div>
                                <h4 className='m-0'>{currentRoom.name}</h4>
                                {currentRoom.writing?<span>Escribiendo...</span>: null}
                            </div>
                        </div>
                        <div className="no-dropdown-icon dropdown-chat">
                            <Dropdown drop="start">
                                <Dropdown.Toggle size="sm" style={{background: 'none'}}>
                                    <FontAwesomeIcon icon={faEllipsisVertical} size="lg"/>
                                </Dropdown.Toggle>
                                <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                                    <Dropdown.Item onClick={()=>handleConfirmDeleteRoom()}>Eliminar sala de chat</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                <div className='chat-window-body'>
                    {messages && messages.length? 
                    messages.map((message, key) => (
                        <div key={key} className={isOwnMessage(message)? 'own-chat-message' : 'other-chat-message'}>
                            <div className="user-name-message">@{message.username}</div>
                            <div className="chat-message-globe">{message.message}</div>
                            <div className="chat-message-timestamp">{message.sentAt}</div>
                        </div>
                    )): null}
                    <div ref={bottomRef}/>
                </div>
                <div className='chat-window-footer'>
                    <div className='d-flex w-100 gap-2 align-items-center'>
                        {/* <EmojiPicker onEmojiClick={handleAddEmoji} emojiStyle='native'/> */}
                        <button onClick={handleOpenEmojiSelector} style={{border: 'none', backgroundColor: 'rgba(0,0,0,0)'}}>
                            <InsertEmoticonIcon style={{color: 'var(--text-title)'}}/>
                        </button>
                        <Popover
                            id={idEmojiSelector}
                            anchorEl={anchorEl}
                            onClose={handleCloseEmojiSelector}
                            open={openEmojiSelector}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}>
                            {/* <EmojiPicker onEmojiClick={handleAddEmoji} emojiStyle='native'/> */}
                            <Picker data={data} onEmojiSelect={handleAddEmoji} previewPosition={'none'}/>
                        </Popover>
                        <TextField placeholder="Escribe un mensaje" className="chat-input" name="message" value={message} onKeyDown={handleKeyDown} onChange={handleOnChangeMessage} multiline fullWidth maxRows={5}/>
                        <Button className="send-msg-btn" onClick={handleSendMessage}>
                            <FontAwesomeIcon icon={faPaperPlane} style={{fontSize: '1rem'}}/>
                        </Button>
                    </div>
                </div>
            </div>
            : 
            <div className="chat-window-container align-items-center justify-content-center">
                <h4>Debes seleccionar un chat para comenzar</h4>
            </div>}
            <div className={`rooms-window-container ${expandRooms? 'active': ''}`}>
                <div className='d-flex justify-content-between flex-row-reverse pe-3 py-2'>
                    <CloseButton onClick={()=>{props.handleCloseChat(); socket.disconnect()}}/>
                    <Button className="chat-bars reset-btn mx-1" onClick={toggleExpandRooms}><FontAwesomeIcon icon={faBars}/></Button>
                </div>
                <div className="d-flex flex-column flex-grow-1 chat-room-cards-container">
                    <div className="room-cards">
                        {rooms !== undefined?
                            rooms.length? rooms.map((room, key) => (
                            <div key={key} className={`chat-room-card ${currentRoom && room.room_id === currentRoom.room_id? 'active':''}`} onClick={()=>handleJoinRoom(room)}>
                                <img src={room.photo? room.photo : defaultChatImg} style={{height: '3rem', width: '3rem', borderRadius: '1.5rem', objectFit: 'cover'}} />
                                <div className="room-name flex-grow-1">
                                    <h5 className='m-0' style={{fontSize: '1rem'}}>{room.name}</h5>
                                    {room.service_name != room.name? <span>{room.service_name}</span> : null}
                                </div>
                                {room.notifications > 0 ? <span>{room.notifications}</span> : null}
                            </div>
                        )):
                        <span className='m-2'>No tienes chats todavía, puedes iniciar uno al consultar un servicio</span>
                        :
                        <>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                        </>}
                    </div>
                </div>
            </div>
            <YesNoConfirmationModal
                showModal={deleteConfirmationModal.show}
                title={deleteConfirmationModal.title}
                message={deleteConfirmationModal.message}
                handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
                handleConfirm={deleteConfirmationModal.callback}
            />
            <LoadingModal 
                showModal={loading}
            />
        </div>
    )
}
