import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import { getMyUserId, getMyUserName } from '../../shared/shared-methods.util';
import CloseButton from "react-bootstrap/CloseButton";
import Placeholder from "react-bootstrap/Placeholder";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import TextField from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPlusCircle, faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import RoomAddModal from './RoomAddModal';
import RoomConfigModal from './RoomConfigModal';
import Popover from '@mui/material/Popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import IO from 'socket.io-client';

import defaultChatImg from '../../resources/images/ventana-de-chat.png'


const connectionUrl = ':4443'; //! hay que hacerla variable de entorno
let socket;

export default function EventChat( props ) {

    const [ message, setMessage ] = useState('');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ rooms, setRooms ] = useState(undefined);
    const [ currentRoom, setCurrentRoom ] = useState(undefined);
    const [ messages, setMessages] = useState(undefined);
    const [ showRoomAddModal, setShowRoomAddModal ] = useState(false);
    const [ roomConfigModal, setRoomConfigModal ] = useState({show: false});
    const [ expandRooms, setExpandRooms ] = useState(true);

    const myUser = getMyUserId();
    const myUserName = getMyUserName();
    const openEmojiSelector = Boolean(anchorEl);
    const idEmojiSelector = openEmojiSelector ? 'simple-popover' : undefined;

    const bottomRef = useRef();


    useEffect(()=> {
        const token = localStorage.getItem('token');
        socket = IO(connectionUrl, {
            auth: {
                token: token,
                event_id: props.event_id
            },
        });

        socket.on('rooms', (data) =>  handleReceiveRooms(data));

        socket.on('newRoom', (data) =>  handleReceiveRoom(data));

        socket.on('roomUpdated', (data) =>  handleUpdateRoom(data));

        socket.on('roomDeleted', (data) =>  handleDeleteRoom(data));

        socket.on('roomDeletedId', (data) =>  handleDeleteRoomById(data));

        socket.on('new_message', (data) => handleReceiveMessage(data));

        socket.on('get_messages', (data) => handleReceiveMessages(data));

        return () => socket.disconnect();
    }, []);

    const handleReceiveRooms = (resRooms) => {
        setRooms(resRooms)
    }

    const handleReceiveRoom = (resRoom) => {
        setRooms(prev => ([...prev, resRoom]));
    }

    const handleUpdateRoom = (resRoom) => {
        setRooms(prev => {
            if (prev.findIndex((room) => room.room_id === resRoom.room_id) === -1){
                return [...prev, resRoom];
            } else {
                return prev.map( room => { 
                    if (room.room_id === resRoom.room_id) return resRoom;
                    else return room
                })
            }
        })
        setCurrentRoom(prev => {
            if (prev && prev.room_id && prev.room_id === resRoom.room_id) return resRoom;
            return prev;
        })
    }

    const handleDeleteRoom = (resRoom) => {
        if (rooms && rooms.length > 0) setRooms(prev => (prev.filter(room => room.room_id !== resRoom.room_id)));
    }

    const handleDeleteRoomById = room_id => {
        if (rooms && rooms.length > 0) setRooms(prev => (prev.filter(room => room.room_id !== room_id)));
    }

    const handleAddRoom = () => {
        setShowRoomAddModal(true);
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

    const handleLeaveRoom = () => {
        if (!currentRoom) return;
        setMessages([]);
        socket.emit('leaveRoom', currentRoom.room_id);
        setCurrentRoom(undefined);
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

    const handleOpenRoomConfigModal = () => {
        setRoomConfigModal({show: true, room: {...currentRoom}});
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
                    <div className="chat-window-header pointer" onClick={handleOpenRoomConfigModal}>
                        <img src={currentRoom.photo? currentRoom.photo: defaultChatImg} style={{width: '4rem', height: '4rem', borderRadius: '2rem', objectFit: 'cover'}}/>
                        <div>
                            <h4 className='m-0'>{currentRoom.name}</h4>
                        </div>
                        <FontAwesomeIcon icon={faEllipsisVertical} title="Más información" size="lg"/>
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
                <div className="chat-room-cards-container">
                    <div className="room-cards">
                        {rooms !== undefined?
                            rooms.length? rooms.map((room, key) => (
                            <div key={key} className={`chat-room-card ${currentRoom && room.room_id === currentRoom.room_id? 'active':''}`} onClick={()=>handleJoinRoom(room)}>
                                <img src={room.photo? room.photo : defaultChatImg} style={{height: '3rem', width: '3rem', borderRadius: '1.5rem', objectFit: 'cover'}} />
                                <h5 className='flex-grow-1 m-0 room-name' style={{fontSize: '1rem'}}>{room.name}</h5>
                                {room.notifications > 0 ? <span>{room.notifications}</span> : null}
                            </div>
                        )):
                        null
                        :
                        <>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                            <Placeholder animation="wave" className="m-2 rounded" style={{backgroundColor: 'var(--text-muted)', height: '3rem'}}/>
                        </>}
                    </div>
                    <div className="room-add">
                        { props.permissions.CREATE_CHAT_ROOM_EVENT?
                            <Button className="btn btn-primary-body btn-add d-flex align-items-center justify-content-center m-2 p-2" style={{overflow: 'hidden'}}
                                onClick={()=>handleAddRoom()}>
                                <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                <div className="btn-message">Agregar sala</div>
                            </Button>
                        :null}
                    </div>
                </div>
            </div>
            <RoomAddModal 
                showModal={showRoomAddModal}
                event_id={props.event_id}
                handleCloseModal={()=>setShowRoomAddModal(false)}
                handleOpenModal={()=>setShowRoomAddModal(true)}
                participants={props.participants}
            />
            <RoomConfigModal
                showModal={roomConfigModal.show}
                event_id={props.event_id}
                handleCloseModal={()=>setRoomConfigModal({show: false})}
                handleOpenModal={()=>setRoomConfigModal({...roomConfigModal, show:true})}
                participants={props.participants}
                room={roomConfigModal.room}
                leaveRoom={handleLeaveRoom}
                deleteRoomById={handleDeleteRoomById}
            />
        </div>
    )
}
