import React, { useState, useEffect } from "react";
import './EventsPage.css';
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Nav from "react-bootstrap/Nav";
import axios from "axios";
import LoadingModal from "../../components/modals/LoadingModal";
import SearchInput from "../../components/SearchInput";
import EventCard from "../../components/events/EventCard";
import { mongoDateToLocalDate } from "../../shared/shared-methods.util";

import GuestFirstEventLight from "../../resources/images/GuestFirstEventLight.png";
import GuestFirstEventDark from "../../resources/images/GuestFirstEventDark.png";
import LoadingNotebook from "../../resources/images/LoadingNotebook.png";
import OrganizerFirstEventLight from "../../resources/images/OrganizerFirstEventLight.png"
import OrganizerFirstEventDark from "../../resources/images/OrganizerFirstEventDark.png"
import ServiceProviderFirstEventDark from "../../resources/images/ServiceProviderFirstEventDark.png"
import ServiceProviderFirstEventLight from "../../resources/images/ServiceProviderFirstEventLight.png"


export default function EventsPage() {

    const darkMode = document.body.classList.contains('dark');

    const [ events, setEvents ] = useState([]);
    const [ showEvents, setShowEvents ] = useState([]);
    const [ modalLoading, setModalLoading ] = useState(0);
    const [ selectedFilter, setSelectedFilter] = useState('creator');
    const [ bgImageURL, setBgImageURL ] = useState(OrganizerFirstEventLight);

    const navigate = useNavigate();

    useEffect(()=>{
        const getEvents = async () => {
            setModalLoading(prev=>prev+1);
            try{
                const res = await axios.get('../api/event/getMyEvents');
                const myEvents = res.data;
                setEvents(myEvents);
                setShowEvents(filterMyEvents('creator', myEvents));
            } catch (error) {
            
            }
            setModalLoading(prev=>prev-1);
        }
        getEvents();
    },[]);

    const filterMyEvents = (selectedRole, eventsToFilter) => {
        setSelectedFilter(selectedRole);
        const filteredEvents = eventsToFilter.filter(event => event.role == selectedRole).map((event) => { return event.event });
        return filteredEvents;
    }

    const selectBGImage = (key) => {
        switch(key){
            case ('creator'):
                setBgImageURL(darkMode? OrganizerFirstEventDark : OrganizerFirstEventLight)
                break;
            case ('organizer'):
                setBgImageURL(darkMode? OrganizerFirstEventDark : OrganizerFirstEventLight)
                break;
            case ('guest'):
                setBgImageURL(darkMode? GuestFirstEventDark : GuestFirstEventLight)
                break;
            case ('service'):
                setBgImageURL(darkMode? ServiceProviderFirstEventDark : ServiceProviderFirstEventLight)
                break;
        }
    }

    return (
        <div className="EventsPage body d-flex flex-column nav-bar-content align-items-center">
            <div className="row justify-content-center" style={{ margin: "2rem 0" }}>
                <h2>Mis eventos</h2>
            </div>
            <div className="d-flex flex-column justify-content-center page-body">
                <div className="d-flex flex-row justify-content-end">
                    {/* <SearchInput width="40%" height="2.5rem"/> */}
                    {selectedFilter === 'creator' && <Button className="btn btn-primary-body py-2" onClick={()=>navigate('/events/newevent')}><FontAwesomeIcon icon={faPlus}/> Crear Evento</Button>}
                </div>
                <Nav className="mt-4" variant="tabs" activeKey={selectedFilter} onSelect={(selectedKey) => {setShowEvents(filterMyEvents(selectedKey, events)), selectBGImage(selectedKey)}}>
                    <Nav.Item >
                        <Nav.Link eventKey="creator">Creados por mí</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="organizer">Organizados por mí</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="guest">En los que soy invitado</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="service">En los que soy proveedor</Nav.Link>
                    </Nav.Item>
                </Nav>
                <div className="eventlist-cards-container">
                    {
                    showEvents.length === 0?
                    modalLoading? 
                    [1, 2, 3, 4].map(number => (
                        <div className="event-card" key={number} style={{ overflow: 'hidden'}}>
                            <Placeholder animation="wave" className="rounded img"
                                style={{ backgroundColor: 'var(--text-ultra-muted)'}}
                            />
                            <div className="d-flex flex-column mx-3" style={{ width: '100%' }}>
                                <div className="d-flex justify-content-between flex-wrap" style={{ gap: '1rem' }}>
                                    <div className="d-flex gap-2 align-items-center mb-1 flex-wrap">
                                        <Placeholder animation="wave" className="rounded "
                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '7rem' }}
                                        />
                                        <Placeholder animation="wave" className="rounded"
                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '5rem' }}
                                        />
                                    </div>
                                    <Placeholder animation="wave" className="rounded"
                                        style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '7rem' }}
                                    />
                                </div>
                                <hr className="mx-0 my-1" style={{ height: '2px' }} />
                                <div className="fields-grid flex-wrap mt-2 mx-2 text-muted gap-2">
                                    <Placeholder animation="wave" className=" rounded"
                                        style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '50%'}}
                                    />
                                    <Placeholder animation="wave" className=" rounded"
                                        style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '50%' }}
                                    />
                                    <Placeholder animation="wave" className=" rounded"
                                        style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '50%' }}
                                    />
                                    <Placeholder animation="wave" className=" rounded"
                                        style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '50%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                    :
                    <div className="d-flex justify-content-center">
                        <img src={bgImageURL} className={selectedFilter !== 'creator'? '' : ''} style={{maxWidth:'500px'}}/>
                    </div>
                    :
                    showEvents.map((event, key) => {
                        return (
                            <Link to={`event?event_id=${event.event_id}`} key={event.event_id} className="no-decorations">
                                <EventCard
                                    title={event.title}
                                    state={event.state}
                                    place={event.address_alias? event.address_alias : 'No especificado'}
                                    type={event.type? event.type.name: ""}
                                    isPrivate={event.type? event.type.is_private : ""}
                                    time={event.start_time? `${event.start_time} hs` : '-'}
                                    date={event.start_date? mongoDateToLocalDate(event.start_date): '-'}
                                    img={event.photo? event.photo: "https://business.twitter.com/content/dam/business-twitter/insights/may-2018/event-targeting.png.twimg.1920.png"}
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
            <LoadingModal showModal={modalLoading}/>
        </div>
    )
}