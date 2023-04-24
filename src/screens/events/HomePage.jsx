import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PublicEventCard from '../../components/events/PublicEventCard';
import { mongoDateToLocalDate } from '../../shared/shared-methods.util';
import LoadingModal from '../../components/modals/LoadingModal';
import { Filter9PlusRounded } from '@mui/icons-material';

const axiosApi = axios.create();

export default function HomePage() {

    const [ showFilters, setShowFilters ] = useState(false);
    const [ types, setTypes ] = useState([]);
    const [ events, setEvents ] = useState();
    const [ provincias, setProvincias ] = useState();
    const [ municipios, setMunicipios ] = useState();
    const [ loading, setLoading ] = useState(0);
    const [ filters, setFilters ] = useState({});
    const [ filtersCount, setFiltersCount] = useState(0);
    const [ page, setPage ] = useState(1);
    const [ count, setCount ] = useState(0);

    const amountPage = 12;

    useEffect(()=>{
        getTypes();
        getEvents();
        getProvincias();
    }, [])

    const navigate = useNavigate();

    const getEvents = async () => {
        setLoading(prev => prev + 1);
        try {
            const res = await axios.get(`../api/event/getPublicEvents?skip=0&limit=${amountPage}`)
            setEvents(res.data.eventsFormatted);
            setCount(res.data.count);
            setPage(1);
        } catch (error) {}
        setLoading(prev => prev - 1);
    }

    const getTypes = async () => {
        try {
            const res = await axios.get('../api/event/getEventTypes');
            setTypes(res.data);
        } catch (error) {}
    }

    const getProvincias = async () => {
        try{
            const provinciasRes = await axiosApi.get(' https://apis.datos.gob.ar/georef/api/provincias');
            setProvincias(provinciasRes.data.provincias);
        } catch (error) { console.log(error) }
    }

    const getMunicipios = async (province_id) => {
        if (!province_id) {
            setMunicipios([]);
            setFilters(prev => ({...prev, city: undefined}));
            return;
        };
        setLoading(prev => prev + 1);
        try{
            const municipiosRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${province_id}&campos=id,nombre&max=1000`);
            const municipiosArr = municipiosRes.data.municipios.sort((munX, munY) => (munX.nombre < munY.nombre? -1 : 1));
            setMunicipios(municipiosArr);
        } catch (error) {}
        setLoading(prev => prev - 1);
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getPages = () => {
        const cantPages = Math.ceil(count / amountPage);
        const arr = [];
        for (let index = 0; index < cantPages; index++) {
            arr.push(index + 1);
        }
        return arr
    }

    const pages = getPages();

    const countFilters = () => {
        const filtersArr = Object.keys(filters);
        const cant = filtersArr.filter(filterKey => (filterKey !== 'name'? filters[filterKey] : false)).length;
        setFiltersCount(cant);
    }

    const handleToggleFilters = () => {
        if (showFilters) countFilters();
        setShowFilters(prev => !prev);
    }

    const handleSearch = async (pageNumber = 1) => {
        setLoading(prev => prev + 1);
        setPage(pageNumber? pageNumber : 1);
        let filtersString = `skip=${pageNumber}&limit=${amountPage}`;

        if(filters.name) filtersString += `&nombre=${filters.name.trim()}`;
        if(filters.time) filtersString += `&hora=${filters.time}`
        if(filters.date) filtersString += `&fecha=${filters.date}`
        if(filters.type) filtersString += `&tipo=${filters.type}`
        if(filters.province) filtersString += `&provincia=${filters.province}`
        if(filters.city) filtersString += `&ciudad=${filters.city}`

        try {
            const res = await axios.get(`../api/event/getPublicEvents?${filtersString}`);
            setEvents(res.data.eventsFormatted);
            setCount(res.data.count);
        } catch ( error ) { console.log(error)}


        setLoading(prev => prev - 1)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSearch();
    }

    return (
        <div className="body d-flex flex-column nav-bar-content align-items-center">
            <h2 className='mt-4'>¡Explorá eventos públicos!</h2>
            <div className="w-md d-flex justify-content-end align-items-center w-80-sm gap-2 mt-3">
                <Form onSubmit={handleSubmit} className="w-100 d-flex justify-content-end">
                    <div className="home-search-container">
                        <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                        <Button className="search-input-btn" onClick={()=>handleSearch()} title="Buscar">
                            <FontAwesomeIcon icon={faSearch}/>
                        </Button>
                    </div>
                </Form>
                <div className={`home-filters-button  ${showFilters? 'active' : ''}`} onClick={handleToggleFilters}>
                    <TuneRoundedIcon className="black"/>
                    <h5 className="m-0">Filtros</h5>
                    {!showFilters && filtersCount?
                        <Badge pill>{filtersCount}</Badge> : null
                    }
                </div>
            </div>
            <div className={`home-filters-card w-80-sm ${showFilters? 'active':''}`}>
                <Form onSubmit={handleSubmit} className="p-3">
                    <Row >
                        <Col className=" d-flex justify-content-center">
                            <Button className="btn btn-primary-body py-2" onClick={handleSubmit}>
                                <FontAwesomeIcon icon={faRotateRight}/>&nbsp;Aplicar filtros
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Form.Group controlId="type">
                            <Form.Label>Tipo de evento</Form.Label>
                            <Form.Select placeholder="Seleccionar tipo de servicio" name="type" value={filters.type}
                                        onChange={handleOnChange}>
                                <option value=""></option>
                                {types && types.length?
                                    types.map((type, key)=>(
                                        <option key={key} value={type.name}>{type.name}</option>
                                    ))
                                    : null
                                }
                            </Form.Select>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="" controlId="date">
                                    <Form.Label className='m-1'>Fecha</Form.Label>
                                    <Form.Control name="date" type="date" placeholder='Seleccionar fecha de evento' value={filters.date}
                                                    onChange={handleOnChange}
                                    />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="" controlId="time">
                                    <Form.Label className='m-1'>Hora</Form.Label>
                                    <Form.Control name="time" type="time" placeholder='Seleccionar hora de evento' value={filters.time}
                                                    onChange={handleOnChange}
                                    />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group as={Col} controlId="province">
                                <Form.Label>Provincia</Form.Label>
                                <Form.Select name="province" onChange={(e)=>{handleOnChange(e);getMunicipios(e.target.value)}} value={filters.province}>
                                    <option value={''}></option>
                                    {provincias && provincias.length? provincias.map((provincia, key)=> (
                                        <option key={key} value={provincia.id}>{provincia.nombre}</option>
                                    )): null}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group as={Col} controlId="city">
                                <Form.Label>Localidad</Form.Label>
                                <Form.Select name="city" onChange={handleOnChange} value={filters.city}>
                                    <option value={''}></option>
                                    {municipios && municipios.length? municipios.map((municipio, key)=>(
                                        <option key={key} value={municipio.id}>{municipio.nombre}</option>
                                    )) : <option value={''}>Debe elegir una provincia primero...</option>}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </div>
            <div className="public-events-card-container w-80-sm">
                {events?
                        events.map((event, key) => {
                            return (
                                <Link to={`/events/event?event_id=${event.event_id}`} key={key} className="no-decorations">
                                    <PublicEventCard
                                        title={event.title}
                                        place={event.address_alias? event.address_alias : 'No especificado'}
                                        type={event.type? event.type.name: ""}
                                        time={event.start_time? `${event.start_time} hs` : '-'}
                                        date={event.start_date? mongoDateToLocalDate(event.start_date): '-'}
                                        img={event.photo? event.photo: "https://business.twitter.com/content/dam/business-twitter/insights/may-2018/event-targeting.png.twimg.1920.png"}
                                    />
                                </Link>
                            );
                        })
                :   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number)=> (
                        <PublicEventCard key={number} placeholder />
                    )) 
                }
            </div>
            {events && !events.length? 
                <h3 className="mt-5">No se han encontrado eventos con los filtros ingresados</h3>
                : null
            }
            {events && events.length?
            <>
                <hr className="mx-0 mt-5 mb-2 w-80-sm" style={{height: '2px'}}/>
                <Pagination className='my-3'>
                    {pages.map((number)=>(
                        <Pagination.Item key={number} active={page === number} onClick={()=>handleSearch(number)}>{number}</Pagination.Item>
                    ))}
                </Pagination>
            </> : null}
            <LoadingModal showModal={loading}/>
        </div>
    )
}
