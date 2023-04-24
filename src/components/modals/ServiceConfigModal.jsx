import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMapLocation, faUser, faPhone, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import DropFileInput from '../drag-drop-file-input/DropFileInput';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../Alert';
import InfoModal from './InfoModal';
import { imageResize } from '../../shared/imageResizer';
import CropEasy from "../crop/CropEasy";
import LocationForm from '../LocationForm';
import { getCoordinates } from '../../services/map.service';
import CroppingModal from './CroppingModal';
import { toast } from 'react-toastify';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function ServiceConfigModal( props ){

    const [ service, setService ] = useState({...props.service});
    const [ loading, setLoading ] = useState(false);
    const [ errors, setErrors ] = useState({});
    const [ fileList, setFileList] = useState([]);
    const [ showPublishAlert, setShowPublishAlert ] = useState(false);
    const [ alertMessage, setAlertMessage ] = useState('');
    const [ modalMessage, setModalMesage ] = useState('');
    const [ showSuccesModal, setShowSuccessModal ] = useState(false);
    const [ photo, setPhoto ] = useState('');
    const [ openCrop, setOpenCrop ] = useState(false);
    const [ photoURL, setPhotoURL ] = useState(null);
    const [ addressChanged, setAddressChanged ] = useState(false);
    const [ serviceTypes, setServiceTypes ] = useState([]);
    const [ cropping, setCropping ] = useState(0);
    

    useEffect(()=>{
        if (!props.showModal) return;
        setService(props.service)
        getServiceTypes();
        setFileList([]);
        setErrors({})
        getService()
    },[props.showModal])

    const getService = async () => {
        setLoading(prev=>prev+1);
        if (props.service._id){
            try{
                const res = await axios.get(`../api/service/getService?service_id=${props.service._id}`);
                const resService = res.data;
                setService(resService);
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }

    const getServiceTypes = async () => {
        try{
            const res = await axios.get('../api/service/getServiceTypes');
            setServiceTypes(res.data);
        } catch (error) { console.log(error) }
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (name === 'price' && isNaN(value) && (value < 0 || value > 999999999)) return;
        if (name === 'contact_number') value.trim();
    
        setService({...service, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleOnChangeField = (e, field) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (name === 'number' && (value < 0 || value > 99999)) return;
    
        setService({...service, [field]: { ...service[field] , [name]: value}});
        if (errors[field] && !!errors[field][name] ) setErrors({...errors, [field]: { ...errors[field] , [name]: null}});
        if (errors[name]) setErrors({...errors, [name]: null});

        console.log(errors);
        console.log(name);
    }

    const handleSetAddress = (address) => {
        setService(prev => ({...prev, address: address}));
        setAddressChanged(true);
        setErrors(prev => ({
            ...prev,
            province: undefined,
            city: undefined,
            street: undefined,
            number: undefined
        }))
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const submitPhoto = async(file) => {
        setCropping(prev=>prev+1)
        let servicePhoto = await imageResize(file, 250);
        servicePhoto = await toBase64(servicePhoto);
        setService({...service, photo: servicePhoto})
        setCropping(prev=>prev-1);
    }

    const onFileChange = async (files) => {
        const file = files[0];
        if (!validFilesFormat(file)) return;
        setPhotoURL(URL.createObjectURL(file));
        setOpenCrop(true);
    }

    const isValidExtension = (file)=> {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        return allowedExtensions.exec(file.name);
    }
    
    const isValidSize = (file)=> {
        return file.size <= 1e7
    }

    const validFilesFormat = (file) => {
        if(!isValidExtension(file)) {
            toast.error('El formato del archivo elegido no es el correcto.')
            return false
        }
        if(!isValidSize(file)) {
            toast.error('El tamaño máximo de la foto es de 10 MB.');
            return false
        }
        return true;
    }

    const onFileDrop = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            const updatedList = [newFile];
            setFileList(updatedList);
            onFileChange(updatedList);
        }
    }

    const fileRemove = (file) => {
        const updatedList = [...fileList];
        updatedList.splice(fileList.indexOf(file), 1);
        setFileList(updatedList);
        onFileChange(updatedList);
    }

    const findErrors = () => {
        const newErrors = {};

        const telephoneRegEx = /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/;
        

        if (!service.name || service.name === '') newErrors.name = "Debe ingresar un nombre"
        if (service.name && service.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres."
        
        if (!service.description || service.description === '') newErrors.description = "Debe ingresar una descripción."
        if (service.description && service.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres."

        if (!service.availability || service.availability === '') newErrors.availability = "Debe ingresar una descripción de diponibilidad."
        if (service.availability && service.availability.length > 500) newErrors.availability = "La disponibilidad no puede superar los 500 caracteres."

        if (service.price && isNaN(service.price)) newErrors.price = "El precio ingresado debe ser un número."
        if (service.price && !isNaN(service.price) && service.price < 0) newErrors.price = "El precio ingresado debe ser un número positivo."

        if (!service.type || service.type === '') newErrors.type = "Debe seleccionar un tipo de servicio"

        if (service.providerString && service.providerString.length > 50) newErrors.providerString = "El nombre del contacto no puede superar los 50 caracteres."

        if (!service.contact_number || service.contact_number === '') newErrors.contact_number = "Debe ingresar un número de teléfono."
        else if (service.contact_number.length > 16) newErrors.contact_number = "El número de teléfono no puede superar los 16 caracteres."
        else if (!service.contact_number.match(telephoneRegEx)) newErrors.contact_number = "Por favor ingrese un número de teléfono válido."

        if (!service.contact_email || service.contact_email === '') newErrors.contact_email = "Debe ingresar una dirección de correo electrónico."
        if (service.contact_email && service.contact_email.length > 100) newErrors.contact_email = "La dirección de correo electrónico no puede superar los 100 caracteres."

        if (service.address && service.address.province === '') newErrors.province = "Debe seleccionar una provincia.";
        if (service.address && service.address.city === '') newErrors.city = "Debe seleccionar una ciudad.";
        if (service.address && service.address.street === '') newErrors.street = "Debe ingresar una calle.";
        if (service.address && service.address.number === '') newErrors.number = "Debe ingresar una altura.";

        if (service.address && service.address.street && service.address.street.length > 30) newErrors.street = "El nombre de la calle no puede superar los 30 caracteres.";
        
        if (service.address && service.address.number && service.address.number.length > 5) newErrors.number = "La altura no puede superar los 5 dígitos.";
        if (service.address && service.address.number && service.address.number <= 0) newErrors.number = "La altura debe ser un número mayor a 0.";
        if (service.address && service.address.number && !Number.isInteger(parseFloat(service.address.number))) newErrors.number = "La altura debe ser un número entero.";

        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrorFromResponse(field, errorMsg);
            });
        } catch (error) {}
    }

    const setErrorFromResponse = (errorField, errorMsg) =>{
        if (errorField && errorField.includes('.')){
            const errorFieldArray = errorField.split('.');
            let stringErrorObj = '';
            for (let field of errorFieldArray) {
                stringErrorObj += `{"${field}": `
            }
            stringErrorObj += `"${errorMsg}"` + '}'.repeat(errorFieldArray.length);
            setErrors(prev => ({...prev, ...JSON.parse(stringErrorObj)}));
        } else {
            setErrors(prev=> ({...prev, [errorField]: errorMsg}));
        }
    }

    const handlePublishService = async(e) => {
        const value = e.target.checked;
        const params = {
            service_id: props.service._id,
            publish: value
        };
        setLoading(prev=>prev+1);
        try {
            await axios.put('../api/service/publishService', params)
            setService({...service, visible: value});
        } catch (error) {}
        
        if (value) setAlertMessage('Servicio publicado con éxito');
        else setAlertMessage('Se ocultó el servicio con éxito')
        setLoading(prev=>prev-1);
        getService();
        setShowPublishAlert(true);
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            let params = service;
            if (!params.address) params = {...params, address: {}};
            // params.providerString = `${service.provider.name} ${service.provider.lastname}`;
            if (params.address) params.address.country = 'Argentina';
            if (addressChanged) params.address.coordinates = service.address? JSON.stringify(await getCoordinates(service.address)) : '';
            if (params.address && params.address.number) params.address.number = Number(params.address.number);
            params.price = Number(params.price);
            try {
                setLoading(prev=>prev+1);
                params.provider = params.provider.user_id;
                setErrors({});
                await axios.put('../api/service/updateService', params);
                props.handleCloseModal();
                setModalMesage('¡Servicio modificado con éxito!');
                setShowSuccessModal(true);
            } catch (error) {
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }

    const hasErrors = () => {
        let noErrors = true;
        Object.keys(errors).forEach(key=> {
            if (errors[key]) noErrors = false;
        })
        return !noErrors;
    }

    return (
        <>
        {service && <Modal show={props.showModal} onHide={props.handleCloseModal} size="lg">
            <Modal.Header className="flex-column align-items-start">
                <span>Servicio</span>
                <Modal.Title>{service.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="view-service-modal-body d-flex flex-column gap-3">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex gap-2">
                        <Form.Group className="mb-2 d-flex flex-column flex-grow-1" controlId="name">
                            <Form.Label>Nombre <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off"
                                        value={service.name} maxLength={50} onChange={handleOnChange}/>
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex flex-column" controlId="price">
                            <Form.Label>Precio</Form.Label>
                            <div className="d-flex">
                                <InputGroup.Text className="px-2" style={{borderRadius: "0.5rem 0 0 0.5rem", borderColor: 'var(--card-border-color)'}}>$</InputGroup.Text>
                                <Form.Control type="number" autoComplete="off" isInvalid={ !!errors.price } placeholder="" name="price" 
                                        value={service.price} min={0} onChange={handleOnChange} 
                                        style={{borderRadius: "0 0.5rem 0.5rem 0"}}/>
                            </div>
                            <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.price}</span>
                        </Form.Group>
                    </div>
                    <Form.Group className="mb-2 d-flex flex-column" controlId="description">
                        <Form.Label>Descripción <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control as="textarea" isInvalid={ !!errors.description } placeholder="" name="description"
                                    value={service.description} onChange={handleOnChange} maxLength={500}/>
                        <Form.Text className="text-end">{service.description?  service.description.length: 0} de 500</Form.Text>
                        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="visible">
                        <div className='d-flex justify-content-between align-items-center mt-3'>
                            <div className="d-flex gap-3 align-items-center">
                                <Form.Label className='m-0' style={{fontSize: '1.25rem'}}>Visible</Form.Label>
                                <p className="m-0">Lo podrán ver todos los usuarios</p>
                            </div>
                            <Form.Check type="switch" id="visible" name="visible" value={service.visible} 
                                checked={service.visible}
                                style={{fontSize: '1.5rem'}} onChange={handlePublishService}/>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-6" controlId="photo">
                        <Form.Label>{service.photo? 'Foto de portada' : "Agregar foto de portada"}</Form.Label>
                        {service.photo? <img src={service.photo} alt="Foto de portada" style={{width: '100%', borderRadius: '1rem', marginBottom: '1rem'}}/>: null}
                        <DropFileInput onFileChange={(files) => onFileChange(files)} fileList={fileList} onFileDrop={onFileDrop} fileRemove={fileRemove} modify={true}/>
                    </Form.Group>
                    <Form.Group className="mb-2 mt-3 d-flex flex-column" controlId="availability">
                        <Form.Label>Disponibilidad <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control as="textarea" isInvalid={ !!errors.availability } placeholder="" name="availability"
                                    value={service.availability} onChange={handleOnChange} maxLength={500}/>
                        <Form.Text className="text-end">{service.availability?  service.availability.length: 0} de 500</Form.Text>
                        <Form.Control.Feedback type="invalid">{errors.availability}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-6" controlId="type">
                        <Form.Label>Tipo <span className="text-tertiary">*</span></Form.Label>
                        <Form.Select name="type" isInvalid={!!errors.type}
                            value={service.type} onChange={handleOnChange}>
                            <option value=""></option>
                            {serviceTypes.map(type => (
                                <option value={type.name} key={type._d}>{type.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
                    </Form.Group>
                    <Accordion className="service-accordion" >
                        <Accordion.Item eventKey="provider">
                            <Accordion.Header>Contacto</Accordion.Header>
                            <Accordion.Body>
                                <Form.Group className="mb-2 d-flex flex-column flex-grow-1" controlId="providerString">
                                    <Form.Label>Nombre de contacto</Form.Label>
                                    <Form.Control isInvalid={ !!errors.providerString } placeholder="" name="providerString"
                                                value={service.providerString} maxLength={50} onChange={handleOnChange}/>
                                    <Form.Control.Feedback type="invalid">{errors.providerString}</Form.Control.Feedback>
                                    <span style={{color: 'var(--text-muted)'}}>Por defecto se tomará su nombre y apellido</span>
                                </Form.Group>
                                <Form.Group className="mb-2 d-flex flex-column" controlId="contact_number">
                                    <Form.Label className="mb-0">Número de teléfono <span className="text-tertiary">*</span></Form.Label>
                                    <span className="text-muted">Sin espacios ni caracteres especiales</span>
                                    <Form.Control isInvalid={ !!errors.contact_number } placeholder="" name="contact_number"
                                                value={service.contact_number} maxLength={16} onChange={handleOnChange}/>
                                    <Form.Control.Feedback type="invalid">{errors.contact_number}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-2 d-flex flex-column" controlId="contact_email">
                                    <Form.Label>Dirección de correo electrónico <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control isInvalid={ !!errors.contact_email } placeholder="" name="contact_email"
                                                value={service.contact_email} maxLength={30} onChange={handleOnChange}/>
                                    <Form.Control.Feedback type="invalid">{errors.contact_email}</Form.Control.Feedback>
                                </Form.Group>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item className='mt-3' eventKey="location">
                            <Accordion.Header>Ubicación</Accordion.Header>
                            <Accordion.Body>
                                <LocationForm 
                                    address={service.address}
                                    errors={errors}
                                    handleOnChange={(e) => handleOnChangeField(e, 'address')}
                                    modify={true}
                                    handleSetAddress={handleSetAddress}
                                    changedAddress={addressChanged}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    {hasErrors()? <span className="text-danger">Por favor revisar los campos ingresados.</span> : null}                  
                </Form>
            </Modal.Body>
            <Modal.Footer className='d-flex align-items-center'>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                    Cancelar
                </Button>
                {!loading?
                    <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
                        Guardar
                    </Button> :
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>}
        {openCrop ? <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} aspect_ratio={16/9} round={false} setModalLoading={setCropping}/> : null}
        <InfoModal
            showModal={showSuccesModal}
            handleCloseModal={()=>{setShowSuccessModal(false); props.getServices()}}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        <Snackbar open={showPublishAlert} onClose={()=>{setShowPublishAlert(false)}} autoHideDuration={3000} anchorOrigin={{vertical: "top", horizontal: "right"}}>
            <Alert onClose={()=>{setShowPublishAlert(false)}} severity="success" sx={{ width: '100%' }}>
                {alertMessage}
            </Alert>
        </Snackbar>
        <CroppingModal showModal={cropping}/>
        </>
    );
}