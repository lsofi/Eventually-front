import React, { useState, useEffect, useTransition } from "react";
import './EventsPage.css';
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPlus, faListUl, faSearch} from '@fortawesome/free-solid-svg-icons';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Nav from "react-bootstrap/Nav";
import axios from "axios";
import Form from "react-bootstrap/Form";
import LoadingModal from "../../components/modals/LoadingModal";
import SearchInput from "../../components/SearchInput";
import EventCard from "../../components/events/EventCard";
import { mongoDateToLocalDate } from "../../shared/shared-methods.util";
import { Row, Col } from "react-bootstrap";
import moment, { Moment } from "moment";
import { TextField } from "@mui/material";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from "@mui/x-date-pickers";

import { Pagination } from "react-bootstrap";

import PastEventsDark from "../../resources/images/PastEventsDark.png";
import PastEventsLight from "../../resources/images/PastEventsLight.png";

export default function EventHistory() {

    const darkMode = document.body.classList.contains('dark');

    const [ page, setPage ] = useState(1);
    const amountPerPage = 10;

    const [ events, setEvents ] = useState([]);
    const [ eventFilters, setEventFilters ] = useState({role: 'creator', dateFrom: moment().startOf('month'), dateTo: moment().endOf('month')});
    const [ showFilters, setShowFilters ] = useState(false);
    const [ titleFilter, setTitleFilter ] = useState("");
    const [ modalLoading, setModalLoading ] = useState(0);
    const [ customDateFrom, setCustomDateFrom ] = useState(moment().startOf('month'));
    const [ customDateTo, setCustomDateTo ] = useState(moment().endOf('month'));
    const [ customFilterActive, setCustomFilterActive ] = useState(false);
    const [ quiet, setQuiet ] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        getEvents(page, amountPerPage);
    }, [eventFilters]);
    
    const getEvents = async (pageNumber, amountPage) => {
        setPage(pageNumber);
        setModalLoading(prev => prev+1);

        let queryFilters = `skip=${pageNumber}&limit=${amountPage}`;
        queryFilters += `&dateFrom=${eventFilters.dateFrom.format('YYYY-MM-DD')}`;
        queryFilters += `&dateTo=${eventFilters.dateTo.format('YYYY-MM-DD')}`;
        queryFilters += `&role=${eventFilters.role}`;
        queryFilters += `&quiet=${quiet}`;
        if(titleFilter) queryFilters += `&name=${quiet}`;

        try {
            //console.log(eventFilters);
            //console.log('Start date nuevo:', eventFilters.dateFrom.format())
            //console.log('EndDate nuevo', eventFilters.dateTo.format())
            //console.log(quiet)
            const res = await axios.get(`../api/event/getEventsHistorialWithFilters?${queryFilters}`);
            const myEvents = res.data;
            setEvents(myEvents);
            setQuiet(false);
        } catch (error) {
            setEvents([]);
            //console.log(error.message)
        }
        setModalLoading(prev => prev-1);
    }

    const getEventsPage = ( pageNumber ) => {
        if (pageNumber === page) return;
        getEvents(pageNumber, amountPerPage);
    }

    const getPages = () => {
        const cantPages = Math.ceil(events.length / amountPerPage);
        const arr = [];
        for (let index = 0; index < cantPages; index++) {
            arr.push(index + 1);
        }
        return arr
    }

    const pages = getPages();

    const handleOnTitleFilterChange = (e) => {
        const filter = e.target.value.toLowerCase();
        //console.log(filter);
        setTitleFilter(filter);
    }

    const handleSelectRole = (event) => {
        const selectedRole = event.target.value;
        changeRoleFilter(selectedRole)
    }

    const handleSelectDateFilter = (event) => {
        const selectedDateFilter = event.target.value;
        { if (selectedDateFilter !== "custom") { changeDateFilter(selectedDateFilter) } else { setCustomFilterActive(true) } }
    }

    const filterEventsByName = (titleFilter) => {
        let filteredEvents;
        if (!titleFilter) return events;
        else {
            filteredEvents = events.filter(event => event.title.toLowerCase().includes(titleFilter));
            return filteredEvents;
        }
    }

    const changeDateFilter = (selectedDateFilter) => {
        let startDate, endDate;
        let isCustomFilterActive = false;

        switch(selectedDateFilter) {
            case 'present-month':
                startDate = moment().startOf('month');
                endDate = moment().endOf('month');
                break;

            case 'previous-month':
                startDate = moment().subtract(1, 'months').startOf('month');
                endDate = moment().subtract(1, 'months').endOf('month');
                break;

            case 'present-year':
                startDate = moment().startOf('year');
                endDate = moment().endOf('year');
                break;
            
            case 'custom':
                startDate = customDateFrom;
                endDate = customDateTo;
                isCustomFilterActive = true;
                break;
        }
        setCustomFilterActive(isCustomFilterActive);
        setCustomDateFrom(startDate);
        setCustomDateTo(endDate);

        setEventFilters({...eventFilters, dateFrom: startDate, dateTo: endDate});
    }

    const changeRoleFilter = (selectedRole) => {
        setEventFilters({...eventFilters, role: selectedRole})
    }

    let showEvents = filterEventsByName(titleFilter);

    return (
        <div className="EventsPage body d-flex flex-column nav-bar-content align-items-center">
            <div className="row justify-content-center" style={{ margin: "2rem 0" }}>
                <h2>Historial de Eventos</h2>
            </div>
            <div className="event-history d-flex flex-row w-100 justify-content-center px-sm-4 page-body">
                <div className="d-flex flex-column justify-content-center align-items-start page-body">
                    <div className="d-flex justify-content-end align-items-center w-100 gap-2 mb-3">
                        <Form className="w-100 d-flex justify-content-end">
                            <div className="home-search-container">
                                <Form.Control placeholder="Buscar..." name="event-search-filter" autoComplete="off" value={titleFilter} onChange={handleOnTitleFilterChange} />
                                <Button className="search-input-btn" onClick={() => setEventFilters({...eventFilters, name: titleFilter})}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </div>
                        </Form>
                        <div className={`home-filters-button  ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(prev => !prev)}>
                            <TuneRoundedIcon className="black" />
                            <h5 className="m-0">Filtros</h5>
                        </div>
                    </div>
                    <div className={`home-filters-card w-100 m-0 ${showFilters ? 'active' : ''}`}>
                        <Form className="p-3 d-flex flex-column gap-2">
                            <Row>
                                <Col lg={6}>
                                    <div className="d-flex flex-column">
                                        <Form.Group controlId="role">
                                            <Form.Label>En los que fuiste</Form.Label>
                                            <Form.Select name="role" onChange={handleSelectRole}>
                                                <option selected value="creator" key={'creator'}>Creador</option>
                                                <option value="organizer" key={"organizer"}>Organizador</option>
                                                <option value="guest" key={"guest"}>Invitado</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col lg={6}>
                                    <div className="d-flex flex-column">
                                        <Form.Group controlId="date">
                                            <Form.Label>Fecha</Form.Label>
                                            <Form.Select name="date" onChange={handleSelectDateFilter}>
                                                <option selected value="present-month" key={"present-month"}>Este mes</option>
                                                <option value="previous-month" key={"previous-month"}>Mes pasado</option>
                                                <option value="present-year" key={"present-year"}>Este año</option>
                                                <option value="custom" key={"custom"}>Personalizado</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="d-flex flex-row my-3 gap-2">
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <MobileDatePicker
                                                className="filter-date"
                                                label="Desde"
                                                disabled={!customFilterActive}
                                                value={customDateFrom}
                                                maxDate={customDateTo}
                                                onChange={(newValue) => {
                                                    setCustomDateFrom(newValue);
                                                    //setEventFilters({...eventFilters, dateFrom: newValue});
                                                }}
                                                renderInput={(params) => <TextField style={{ width: "10rem" }} size="small" {...params} />}
                                            />
                                        </LocalizationProvider>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <MobileDatePicker
                                                className="filter-date"
                                                label="Hasta"
                                                disabled={!customFilterActive}
                                                value={customDateTo}
                                                minDate={customDateFrom}
                                                //maxDate={moment()}
                                                onChange={(newValue) => {
                                                    setCustomDateTo(newValue);
                                                    //setEventFilters({...eventFilters, dateTo: newValue});
                                                }}
                                                renderInput={(params) => <TextField style={{ width: "10rem" }} size="small" {...params} />}
                                            />
                                        </LocalizationProvider>
                                        <Button disabled={!customFilterActive} className="btn btn-secondary-modal" onClick={() => changeDateFilter('custom')}>
                                            Aplicar fechas
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className="EventsPage body eventlist-cards-container w-100 align-items-center" style={{minHeight:'60vh'}}>
                        {showEvents.length === 0 ?
                            modalLoading ?
                                [1, 2, 3, 4].map(number => (
                                    <div className="event-card w-100" key={number} style={{ overflow: 'hidden'}}>
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
                                <img src={darkMode? PastEventsDark : PastEventsLight} className="img-muted" style={{ width: '100%', maxWidth:'500px' }} />
                            
                            :
                            showEvents.map((event, key) => {
                                return (
                                    <Link to={`/events/event?event_id=${event.event_id}`} key={event.event_id} className="no-decorations w-100">
                                        <EventCard
                                            state={event.state}
                                            title={event.title}
                                            place={event.address_alias ? event.address_alias : 'No especificado'}
                                            type={event.type ? event.type.name : ""}
                                            isPrivate={event.type ? event.type.is_private : ""}
                                            time={event.start_time ? event.start_time : '-'}
                                            date={event.start_date ? mongoDateToLocalDate(event.start_date) : '-'}
                                            img={"https://business.twitter.com/content/dam/business-twitter/insights/may-2018/event-targeting.png.twimg.1920.png"}
                                        />
                                    </Link>
                                );
                            })}
                    </div>
                    <hr className="mx-0 mt-5 mb-2" style={{height: '2px', width: '100%'}}/>
                    <div className='d-flex flex-row justify-content-center align-items-center w-100'>
                        <Pagination className='my-1'>
                            {pages.map((number)=>(
                                <Pagination.Item key={number} active={page === number} onClick={()=>getEventsPage(number)}>{number}</Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                </div>
            </div>
            <LoadingModal showModal={modalLoading} />
        </div>
    )
}