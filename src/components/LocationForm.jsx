import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import MapModal from './modals/MapModal';

const axiosApi = axios.create();

export default function LocationForm( props ) {

    const [ provincias, setProvincias ] = useState([]);
    const [ municipios, setMunicipios ] = useState([]);
    const [ showMapModal, setShowMapModal ] = useState(false);

    useEffect(()=>{
        getProvincias();
        if (props.address && props.address.province) getMunicipios(props.address.province);
    }, []);

    const getProvincias = async () => {
        try{
            const provinciasRes = await axiosApi.get(' https://apis.datos.gob.ar/georef/api/provincias');
            const provinciasArr = provinciasRes.data.provincias.sort((provX, provY) => (provX.nombre < provY.nombre? -1 : 1));
            setProvincias(provinciasArr);
        } catch (error) {}
    }

    const getMunicipios = async (province_id) => {
        if (!province_id) {
            setMunicipios([]);
            return;
        };
        try{
            const municipiosRes = await axiosApi.get(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${province_id}&campos=id,nombre&max=1000`);
            const municipiosArr = municipiosRes.data.municipios.sort((munX, munY) => (munX.nombre < munY.nombre? -1 : 1));
            setMunicipios(municipiosArr);
        } catch (error) {}
    }

    const setAddress = (address) => {
        getMunicipios(address.province);
        props.handleSetAddress(address);
    }

    return (
        <Form onSubmit={(e)=>{e.preventDefault(), e.stopPropagation()}}>
            <Form.Group className="mb-2" controlId="formGridAddress1">
                <Form.Label>Referencia (Alias)</Form.Label>
                <Form.Control isInvalid={ props.errors? !!props.errors.alias : false } maxLength={50} placeholder="" name="alias" disabled={!props.modify} 
                            value={props.address? props.address.alias : ''} onChange={(e)=>props.handleOnChange(e)}/>
                <Form.Control.Feedback type="invalid">{props.errors? props.errors.alias : ''}</Form.Control.Feedback>
            </Form.Group>
            <Row className="mb-2">
                <Form.Group as={Col} controlId="province">
                    <Form.Label>Provincia {props.changedAddress?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Select isInvalid={ props.errors? !!props.errors.province : false } placeholder="" name="province" disabled={!props.modify} 
                            value={props.address? props.address.province : ''} onChange={(e)=>{props.handleOnChange(e); getMunicipios(e.target.value)}} >
                        <option value={''}>Elegí su provincia...</option>
                        {provincias.length? provincias.map((provincia, key)=> (
                            <option key={key} value={provincia.id}>{provincia.nombre}</option>
                        )): null}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{props.errors? props.errors.province : ''}</Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className="mb-2">
                <Form.Group as={Col} controlId="city">
                    <Form.Label>Localidad {props.changedAddress?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Select isInvalid={ props.errors? !!props.errors.city : false } placeholder="" name="city" disabled={!props.modify} 
                            value={props.address? props.address.city : ''} onChange={(e)=>props.handleOnChange(e)} >
                        <option value={''}>Elegí su localidad...</option>
                        {municipios.length? municipios.map((municipio, key)=>(
                            <option key={key} value={municipio.id}>{municipio.nombre}</option>
                        )) : <option value={''}>Debe elegir una provincia primero...</option>}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{props.errors? props.errors.city : ''}</Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className="mb-2">
                <Col xs={12} md={8}>
                    <Form.Group className="mb-1" controlId="street">
                        <Form.Label>Calle {props.changedAddress?<span className="text-tertiary">*</span>:null}</Form.Label>
                        <Form.Control isInvalid={ props.errors? !!props.errors.street : false } placeholder="" autoComplete="off" name="street" disabled={!props.modify} 
                            value={props.address? props.address.street : ''} onChange={(e)=>props.handleOnChange(e)}/>
                        <Form.Control.Feedback type="invalid">{props.errors? props.errors.street : ''}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group className="mb-1" controlId="formGridAddress2">
                        <Form.Label>Número {props.changedAddress?<span className="text-tertiary">*</span>:null}</Form.Label>
                        <Form.Control type="number" autoComplete="off" isInvalid={ props.errors? !!props.errors.number : false } placeholder="" name="number" disabled={!props.modify} 
                            value={props.address? props.address.number : ''} onChange={(e)=>props.handleOnChange(e)}/>
                        <Form.Control.Feedback type="invalid">{props.errors? props.errors.number : ''}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <div className='d-flex align-items-center flex-column gap-2'>
                <div className='text-muted'>
                    O
                </div>
                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={()=>setShowMapModal(true)}>
                    <FontAwesomeIcon size="sm" icon={faLocationDot}/>
                    &nbsp;{props.modify? 'Seleccionar' : 'Ver'} en el mapa
                </Button>
            </div>
            <MapModal showModal={showMapModal} handleCloseModal={()=>setShowMapModal(false)} handleSetAddress={setAddress} modify={props.modify} address={props.address} eventAddress={props.eventAddress} startingPointAddress={props.startingPointAddress} formChanged={props.changedAddress}/>
        </Form>
    )
}
