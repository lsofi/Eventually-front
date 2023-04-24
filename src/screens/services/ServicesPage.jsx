import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Placeholder from "react-bootstrap/Placeholder";
import CloseButton from "react-bootstrap/CloseButton";
import Pagination from "react-bootstrap/Pagination";
import Rating from '@mui/material/Rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faLocationDot, faRotateRight, faUser, faSearch, faHandHoldingMedical } from '@fortawesome/free-solid-svg-icons';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import MapModal from '../../components/modals/MapModal';
import ViewServiceModal from '../../components/modals/ViewServiceModal';
import ServiceConfigModal from '../../components/modals/ServiceConfigModal';
import LoadingModal from '../../components/modals/LoadingModal';
import ModalPassConfirm from '../../components/modals/ModalPassConfirm';
import ServicesAddModal from '../../components/modals/ServicesAddModal';
import ServiceChat from '../../components/chats/ServiceChat';

const axiosApi = axios.create();

export default function ServicesPage() {

    const [ selectedNav, setSelectedNav ] = useState('others');
    const [ serviceFilter, setServiceFilter ] = useState('');
    const [ showServices, setShowServices ] = useState([]);
    const [ filters, setFilters ] = useState({});
    const [ showMapModal, setShowMapModal ] = useState(false);
    const [ selectedService, setSelectedService ] = useState();
    const [ showViewServiceModal, setShowViewServiceModal ] = useState(false);
    const [ showServiceAddModal, setShowServiceAddModal ] = useState(false);
    const [ showServiceConfigModal, setShowServiceConfigModal ] = useState(false);
    const [ showChat, setShowChat ] = useState(false);
    const [ modalLoading, setModalLoading ] = useState(false);
    const [ showConfirmationModal, setShowConfirmationModal ] = useState(false);
    const [ confirmPass, setConfirmPass ] = useState('');
    const [ errors, setErrors ] = useState({});
    const [ showFilters, setShowFilters ] = useState(false);
    const [ filtersCount, setFiltersCount ] = useState(0);
    const [ deleteServiceId , setDeleteServiceId ] = useState(undefined);
    const [ page, setPage ] = useState(1);
    const [ count, setCount ] = useState(68);
    const [ provincias, setProvincias ] = useState();
    const [ municipios, setMunicipios ] = useState();
    const [ municipiosAll, setMunicipiosAll ] = useState();
    const [ serviceTypes, setServiceTypes ] = useState([]);

    const amountPage = 12;

    useEffect(()=>{
        getServices(selectedNav, 1);
        getServiceTypes();
        getProvincias();
        getMunicipiosAll();
    },[])

    const getServices = async (nav, pageNumber = 1) => {
        setModalLoading(prev=>prev+1);
        let filtersString = `skip=${pageNumber}&limit=${amountPage}`;

        if(filters.name) filtersString += `&name=${filters.name}`;;
        if(filters.rating) filtersString += `&rating=${filters.rating}`;
        if(filters.price_min) filtersString += `&priceMin=${filters.price_min}`;
        if(filters.price_max) filtersString += `&priceMax=${filters.price_max}`;
        if(filters.type) filtersString += `&type=${filters.type}`;
        if(filters.province) filtersString += `&provincia=${filters.province}`;
        if(filters.city) filtersString += `&ciudad=${filters.city}`;

        let resServices = []
        try{
            let res;
            if (nav === 'others'){
                res = await axios.get(`../api/service/getServicesWithFilters?${filtersString}`);
                resServices = res.data.services;
                setCount(res.data.count);
            } 
            else {
                res = await axios.get('/api/service/getMyServices')
                resServices = res.data;
            }
        } catch (error) {}
        setShowServices(resServices);
        setModalLoading(prev=>prev-1);
    }

    const getServiceTypes = async () => {
        try{
            const res = await axios.get('../api/service/getServiceTypes');
            setServiceTypes(res.data);
        } catch (error) { console.log(error) }
    }

    const getProvincias = async () => {
        try{
            const provinciasRes = await axiosApi.get(' https://apis.datos.gob.ar/georef/api/provincias');
            const provinciasArr = provinciasRes.data.provincias.sort((provX, provY) => (provX.nombre < provY.nombre? -1 : 1));
            setProvincias(provinciasArr);
        } catch (error) { console.log(error) }
    }

    const getMunicipios = async (province_id) => {
        if (!province_id) {
            setMunicipios([]);
            setFilters(prev => ({...prev, city: undefined}));
            return;
        };
        setModalLoading(prev => prev + 1);
        try{
            const municipiosRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${province_id}&campos=id,nombre&max=1000`);
            const municipiosArr = municipiosRes.data.municipios.sort((munX, munY) => (munX.nombre < munY.nombre? -1 : 1));
            setMunicipios(municipiosArr);
        } catch (error) {}
        setModalLoading(prev => prev - 1);
    }

    const getMunicipiosAll = async (province_id) => {
        setModalLoading(prev => prev + 1);
        try{
            const municipiosRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/municipios?&campos=id,nombre&max=2000`);
            const municipiosArr = municipiosRes.data.municipios.sort((munX, munY) => (munX.id < munY.id? -1 : 1));
            setMunicipiosAll(municipiosArr);
        } catch (error) {}
        setModalLoading(prev => prev - 1);
    }

    const getCityNameById = (id) => {
        if (!municipiosAll) return;
        let start=0, end=municipiosAll.length-1;
        // Iterate while start not meets end
        while (start<=end){
    
            // Find the mid index
            let mid=Math.floor((start + end)/2);
    
            // If element is present at mid, return True
            if (municipiosAll[mid].id === id) return municipiosAll[mid].nombre;
    
            // Else look in left or right half accordingly
            else if (municipiosAll[mid].id < id)
                start = mid + 1;
            else
                end = mid - 1;
        }
    
        return 'Ciudad no especificada';
    }

    const getProvinceNameById = (id) => {
        if (!provincias) return;
        const index = provincias.findIndex(provincia => provincia.id === id);
        return provincias[index].nombre;
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        let value = event.target.value;

        if (['price_min','price_max'].includes(name) && (isNaN(value) ||  value < 0 || value > 99999999999)) return; 
        if (name === 'rating') value = Number(value);

        setFilters(prev => ({...prev, [name]: value}));
    }

    const handleToggleFilters = () => {
        if (showFilters) countFilters();
        setShowFilters(prev => !prev);
    }

    const countFilters = () => {
        const filtersArr = Object.keys(filters);
        const cant = filtersArr.filter(filterKey => (filterKey !== 'name'? filters[filterKey] : false)).length;
        setFiltersCount(cant);
    }

    const getServicesPage = ( pageNumber ) => {
        if (pageNumber === page) return;
        getServices('others', pageNumber);
        setPage(pageNumber);
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrors(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {}
    }

    const handleOnChangeFilter = (event) => {
        const value = event.target.value;
        setServiceFilter(value);
    }

    const handleChangeFilters = (event) => {
        let value = event.target.value;
        const name = event.target.name;

        if (['price_min','price_max'].includes(name) && (isNaN(value) ||  value < 0 || value > 99999999999)) return; 
        if (name === 'rating') value = Number(value);

        setFilters({...filters, [name]:value});
    }

    const handleChangePassword = e => {
        const value = e.target.value;
        setConfirmPass(value);
        if ( !!errors.password) setErrors({...errors, password: null});
    }

    const handleOpenService = (service) => {
        setSelectedService(service);
        setTimeout(()=>{
            if (selectedNav === 'others') setShowViewServiceModal(true);
            else setShowServiceConfigModal(true);
        },0)
    }

    const handleSelectNav = (nav) => {
        setSelectedNav(nav);
        getServices(nav);
    }

    const filter = (service) => {
        return service.name.toLowerCase().includes(serviceFilter.toLowerCase()) ||
            service.providerString.toLowerCase().includes(serviceFilter.toLowerCase()) || serviceFilter === '';
    }

    const findErrors = () => {
        const newErrors = {};
        if (!confirmPass || confirmPass === '') newErrors.password = "Por favor ingrese su contraseña."
        return newErrors;
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

    const onDeleteService = (service) => {
        if (selectedNav !== 'mine') return;
        setDeleteServiceId(service._id);
        setErrors({});
        setShowConfirmationModal(true);
    }

    const handleDeleteService = async (e) => {
        if (selectedNav !== 'mine') return;
        e.preventDefault();
        e.stopPropagation();
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
        // We got errors!
        setErrors(newErrors)
        } else {
            const param = {
                service_id: deleteServiceId,
                password: confirmPass
            };
            setModalLoading(prev=>prev+1);
            try{
                await axios.delete('../api/service/deleteService', {data: param});
                setShowConfirmationModal(false);
                getServices('mine');
                setConfirmPass('');
            } catch (error){
                setResponseErrors(error);
            }
            setModalLoading(prev=>prev-1);
        }
        setDeleteServiceId(undefined);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        getServices('others')
    }

    return (
        <div className="body d-flex flex-column nav-bar-content align-items-center">
            <h2 className='mt-4'>Servicios</h2>
            <div className="d-flex justify-content-end gap-2 align-items-center w-100 px-4">
                { selectedNav === 'mine'  && 
                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={()=>setShowServiceAddModal(true)}>
                    <FontAwesomeIcon size="lg" icon={faHandHoldingMedical}/>
                    &nbsp;Agregar servicio
                </Button>
                }
            </div>
            <Nav className="mt-4 px-5 w-100" variant="tabs" activeKey={selectedNav} onSelect={(selectedKey) => {handleSelectNav(selectedKey)}}>
                    <Nav.Item >
                        <Nav.Link eventKey="others">Todos los servicios</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="mine">Mis servicios</Nav.Link>
                    </Nav.Item>
                </Nav>
            <div className="services-body-container flex-grow-1 w-100">
                <div className="services-container">
                    {selectedNav === 'others'?
                    <>
                        <div className="d-flex justify-content-end align-items-center w-100 gap-2">
                            <Form onSubmit={handleSubmit} className="w-100 d-flex justify-content-end">
                                <div className="home-search-container">
                                    <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                                    <Button className="search-input-btn" onClick={()=>getServices('others')}>
                                        <FontAwesomeIcon icon={faSearch}/>
                                    </Button>
                                </div>
                            </Form>
                            <div className={`home-filters-button  ${showFilters? 'active' : ''}`} onClick={handleToggleFilters}>
                                <TuneRoundedIcon className="black"/>
                                <h5 className="m-0">Filtros</h5>
                                {!showFilters && filtersCount?
                                    <Badge pill>{filtersCount}</Badge> 
                                    : 
                                    null
                                }
                            </div>
                        </div>
                        <div className={`services-filters-card w-100 ${showFilters? 'active':''}`}>
                            <Form onSubmit={handleSubmit} className="p-3 d-flex flex-column gap-2">
                                <Row >
                                    <Col className=" d-flex justify-content-center">
                                        <Button className="btn btn-primary-body py-2" onClick={handleSubmit}>
                                            <FontAwesomeIcon icon={faRotateRight}/>&nbsp;Aplicar filtros
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Form.Group controlId="type">
                                        <Form.Label>Tipo de servicio</Form.Label>
                                        <Form.Select placeholder="Seleccionar tipo de servicio" name="type" value={filters.type} onChange={handleOnChange}>
                                            <option value=""></option>
                                            {serviceTypes.map(type => (
                                                <option value={type.name} key={type._id}>{type.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="province">
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
                                        <Form.Group controlId="city">
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
                                <Row>
                                    <Col md={6}>
                                        <Form.Group controlId="price">
                                            <Form.Label>Precio</Form.Label>
                                            <div className="d-flex">
                                                <Form.Control placeholder="min" name="price_min" value={filters.price_min} onChange={handleOnChange}/>
                                                <span className="mx-1 d-flex align-items-center">-</span>
                                                <Form.Control placeholder='max' name="price_max" value={filters.price_max} onChange={handleOnChange}/>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="d-flex flex-column" controlId="rating">
                                            <Form.Label>Puntuación mínima</Form.Label>
                                            <Rating precision={0.5} name="rating" value={filters.rating} onChange={handleChangeFilters}/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </> 
                    : 
                        <div className="services-search-container">
                            <Form.Control placeholder="Buscar..." name="service-search-filter" value={serviceFilter} onChange={handleOnChangeFilter}/>
                            <Button className="search-input-btn">
                                <FontAwesomeIcon icon={faSearch}/>
                            </Button>
                        </div>
                    }
                    <div className="services-grid w-100">
                        {showServices.filter((service)=>(filter(service))).length? showServices.filter((service)=>(filter(service))).map((service, key) => (
                            <Card key={key} className="w-100">
                                <Card.Header style={{padding: '0', position: 'relative', borderRadius: '2rem 2rem 0 0'}}>
                                    <Card.Img variant="top" src={service.photo? service.photo : 'https://www.voicemailtel.com/wp-content/uploads/2015/09/Customer-service.png'}/>
                                    <Alert style={{bottom: '0.5rem', right: '1rem'}} className="service-type-alert">{service.type}</Alert>
                                    {selectedNav === 'mine' && <CloseButton style={{top: '0.5rem', right: '1rem', position: 'absolute', opacity: '1'}} onClick={()=>onDeleteService(service)}/>}
                                </Card.Header>
                                <Card.Body>
                                    <h3 className="bold">{service.name}</h3>
                                    <div className="d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={faUser}/>
                                        <h5>{service.providerString}</h5>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FontAwesomeIcon icon={faLocationDot}/>
                                        <h5>{service.address.street} {service.address.number}, {getCityNameById(service.address.city)}, {getProvinceNameById(service.address.province)}</h5>
                                    </div>
                                </Card.Body>
                                <Card.Footer className='d-flex align-items-center'>
                                    <div className="d-flex flex-column flex-grow-1">
                                        {service.price? 
                                            <div className="d-flex">
                                                <h5>${service.price}</h5>
                                            </div>
                                        : null}
                                        <div className="d-flex flex-column ">
                                            <div className="d-flex gap-2">
                                                <Rating value={service.rating} precision={0.5} readOnly></Rating>
                                                <span className="m-0">{service.rating}</span>
                                            </div>
                                            {service.numberOfRatings? <span>{service.numberOfRatings} calificaciones</span> : null}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-grow-0">
                                        <Button className="btn btn-primary-body d-flex align-items-center py-1" style={{fontSize: "1.25rem"}} onClick={()=>handleOpenService(service)}>
                                            {selectedNav === 'others'? "Consultar" : "Editar"}
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        )): !modalLoading?
                            <h3>{selectedNav === 'others'? 'No se encontraron servicios.' : 'Todavía no tienes servicios.'}</h3>
                        :
                            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number)=> (
                                <div className="public-event-card gap-1 pb-2" key={number} style={{overflow: 'hidden',borderRadius: '2rem 2rem 0 0'}}>
                                    <Placeholder animation="wave" className="rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '10rem', width: '100%'}}
                                    />
                                    <div className="d-flex flex-column mx-3 align-items-center" style={{width: '100%'}}>
                                        <div className="d-flex gap-1 flex-column w-100">
                                            <Placeholder animation="wave" className=" rounded" 
                                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '5rem'}}
                                            />
                                            <Placeholder animation="wave" className=" rounded" 
                                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '2.5rem'}}
                                            />
                                        </div>
                                    </div>
                                </div> 
                            )) 
                        }
                    </div>
                    {selectedNav === 'others'?
                    <>    
                        <hr className="mx-0 mt-5 mb-2" style={{height: '2px', width: '100%'}}/>
                        <Pagination className='my-3'>
                            {pages.map((number)=>(
                                <Pagination.Item key={number} active={page === number} onClick={()=>getServicesPage(number)}>{number}</Pagination.Item>
                            ))}
                        </Pagination>
                    </> : null}
                </div>
            </div>
        {showChat? 
            <ServiceChat handleCloseChat={()=>setShowChat(false)}/>
        :
            <div className="services-messages-icon" onClick={()=>setShowChat(true)}>
                <FontAwesomeIcon icon={faMessage}/>
            </div>}
        <MapModal showModal={showMapModal} handleCloseModal={()=>setShowMapModal(false)}/>
        <ViewServiceModal 
            showModal={showViewServiceModal} 
            handleCloseModal={()=>{setShowViewServiceModal(false)}}
            service={selectedService}
            setShowChat={()=> setShowChat(true)}
        />
        <ServiceConfigModal 
            showModal={showServiceConfigModal}
            handleCloseModal={()=>{setShowServiceConfigModal(false)}}
            service={selectedService}
            getServices={()=>getServices('mine')}
            setModalLoading={setModalLoading}
        />
        <ServicesAddModal
            showModal={showServiceAddModal}
            handleCloseModal={() => {setShowServiceAddModal(false)}}
            getServices={()=>getServices('mine')}
            title="Agregar Servicio"
            setModalLoading={setModalLoading}
        />
        <LoadingModal showModal={modalLoading}/>
        <ModalPassConfirm
                showModal={showConfirmationModal} 
                handleCancel={()=>setShowConfirmationModal(false)}
                handleConfirm={handleDeleteService}
                title="Eliminar servicio"
                message="¿Está seguro/a de eliminar su servicio?"
                errors={errors.password}
                handleOnChange={handleChangePassword}
        />
        </div>
    )
}
