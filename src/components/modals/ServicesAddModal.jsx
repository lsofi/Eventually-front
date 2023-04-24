import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMapLocation, faUser, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import InfoModal from './InfoModal';
import DropFileInput from '../drag-drop-file-input/DropFileInput';
import { imageResize } from '../../shared/imageResizer';
import CropEasy from "../crop/CropEasy";
import LocationForm from '../LocationForm';
import { getCoordinates } from '../../services/map.service';
import CroppingModal from './CroppingModal';
import { toast } from "react-toastify";

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function ServicesAddModal(props) {

    const [errorsAdd, setErrorsAdd] = useState({});
    const [serviceAdd, setServiceAdd] = useState({ visible: true });
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [userData, setUserData ] = useState({});
    const [ addressChanged, setAddressChanged ] = useState(false);
    const [ serviceTypes, setServiceTypes ] = useState([]);

//  Estado de las fotos
    const [ fileList, setFileList ] = useState([]);
    const [ photo, setPhoto ] = useState('');
    const [ openCrop, setOpenCrop ] = useState(false);
    const [ photoURL, setPhotoURL ] = useState(null);
    const [ cropping, setCropping ] = useState(0);

    const [modalMessage, setModalMesage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        //console.log("Show modal de agregarServicio", props.showModal)
        setServiceAdd({ visible: true });
        getServiceTypes();
        setFileList([]);
        setErrorsAdd({});
        if (!props.showModal) return;
        getUserData();
    }, [props.showModal])

    const getUserData = async () => {
        setLoadingAdd(true)
        try {
            const userDataRes = await axios.get('/api/user/getUser');
            const resUserData = userDataRes.data;
            setUserData({name: resUserData.name, lastname: resUserData.lastname});
        } catch (error) {
            
        }
        setLoadingAdd(false)
    };

    const getServiceTypes = async () => {
        try{
            const res = await axios.get('../api/service/getServiceTypes');
            setServiceTypes(res.data);
        } catch (error) { console.log(error) }
    }

    const findErrors = () => {
        const newErrors = {};

        const telephoneRegEx = /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/;

        if (!serviceAdd.name || serviceAdd.name === '') newErrors.name = "Debe ingresar un nombre.";
        if (serviceAdd.name && serviceAdd.name.length > 50) newErrors.name = "El nombre no puede superar los 50 caracteres.";

        if (!serviceAdd.description || serviceAdd.description === '') newErrors.description = "Debe ingresar una descripción.";
        if (serviceAdd.description && serviceAdd.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres.";
        if (!serviceAdd.availability || serviceAdd.availability=== '') newErrors.availability = "Debe ingresar datos de disponibilidad.";
        if (serviceAdd.availability && serviceAdd.availability.length > 500) newErrors.availability = "La disponibilidad no puede superar los 500 caracteres.";

        if (serviceAdd.price && serviceAdd.price < 0) newErrors.price = "El precio debe ser mayor a 0.";
        if (serviceAdd.price && isNaN(serviceAdd.price)) newErrors.price = "El precio ingresado debe ser un número.";

        if (!serviceAdd.type || serviceAdd.type === '') newErrors.type = "Debe seleccionar un tipo de servicio.";

        if (serviceAdd.providerString && serviceAdd.providerString.length > 50) newErrors.providerString = "El nombre del contacto no puede superar los 50 caracteres."

        if (!serviceAdd.contact_number) newErrors.contact_number = "Debe ingresar un número de teléfono de contacto."
        else if (serviceAdd.contact_number.length > 16) newErrors.contact_number = "El número de teléfono no puede superar los 16 caracteres."
        else if (!serviceAdd.contact_number.match(telephoneRegEx)) newErrors.contact_number = "Por favor ingrese un número de teléfono válido."

        if (!serviceAdd.contact_email || serviceAdd.contact_email === "") newErrors.contact_email = "Debe ingresar un correo electrónico de contacto."
        else if (serviceAdd.contact_email && serviceAdd.contact_email.length > 100) newErrors.contact_email = "La dirección de correo electrónico no puede superar los 100 caracteres.";
        else if (!serviceAdd.contact_email.includes('@')) newErrors.contact_email = "Por favor ingrese una dirección de correo válida.";

        if (!serviceAdd.address || !serviceAdd.address.province || serviceAdd.address.province === '') newErrors.province = "Debe seleccionar una provincia.";
        if (!serviceAdd.address || !serviceAdd.address.city || serviceAdd.address.city === '') newErrors.city = "Debe seleccionar una ciudad.";
        if (!serviceAdd.address || !serviceAdd.address.street || serviceAdd.address.street === '') newErrors.street = "Debe ingresar una calle.";
        if (!serviceAdd.address || !serviceAdd.address.number || serviceAdd.address.number === '') newErrors.number = "Debe ingresar una altura.";

        if (serviceAdd.address && serviceAdd.address.street && serviceAdd.address.street.length > 30) newErrors.street = "El nombre de la calle no puede superar los 30 caracteres.";
        if (serviceAdd.address && serviceAdd.address.number && serviceAdd.address.number.length > 5) newErrors.number = "La altura no puede superar los 5 dígitos.";
        if (serviceAdd.address && serviceAdd.address.number && serviceAdd.address.number <= 0) newErrors.number = "La altura debe ser un número mayor a 0.";
        if (serviceAdd.address && serviceAdd.address.number && !Number.isInteger(parseFloat(serviceAdd.address.number))) newErrors.number = "La altura debe ser un número entero.";

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
            setErrorsAdd(prev => ({...prev, ...JSON.parse(stringErrorObj)}));
        } else {
            setErrorsAdd(prev=> ({...prev, [errorField]: errorMsg}));
        }
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const submitPhoto = async(file) => {
        setCropping(prev=>prev+1);
        let servicePhoto = await imageResize(file, 250);

        servicePhoto = await toBase64(servicePhoto);

        setServiceAdd({...serviceAdd, photo: servicePhoto})
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

    const handleOnChange = (e) => {
        const name = e.target.name;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (name === 'price' && isNaN(value) && (value < 0 || value > 999999999)) return;
        if (name === 'contact_number') value.trim();

        setServiceAdd({ ...serviceAdd, [name]: value });
        if (!!errorsAdd[name]) setErrorsAdd({ ...errorsAdd, [name]: undefined });
    }

    const handleOnChangeField = (e, field) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (name === 'number' && (value < 0 || value > 99999)) return;

        setServiceAdd({ ...serviceAdd, [field]: { ...serviceAdd[field], [name]: value } });
        if (errorsAdd[field] && !!errorsAdd[field][name]) setErrorsAdd({ ...errorsAdd, [field]: { ...errorsAdd[field], [name]: undefined } });
        if (errorsAdd[name]) setErrorsAdd({...errorsAdd, [name]: undefined});
        if (field === 'address') setAddressChanged(true);
    }

    const handleSetAddress = (address) => {
        setServiceAdd(prev => ({...prev, address: address}));
        setAddressChanged(false);
        setErrorsAdd(prev => ({
            ...prev,
            province: undefined,
            city: undefined,
            street: undefined,
            number: undefined
        }));
    }

    const handleOnCancel = () => {
        setServiceAdd({ visible: true });
        setFileList([]);
        setErrorsAdd({});
        props.handleCloseModal();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        //console.log(serviceAdd)
        setErrorsAdd({});
        const newErrors = findErrors();
        // Conditional logic:
        if (Object.keys(newErrors).length > 0) {
            // We got errors!
            setErrorsAdd(newErrors);
        } else {
            //console.log(serviceAdd);
            let params = serviceAdd;
            if (!params.address) params = {...params, address: {}};
            if (!params.providerString || params.providerString === ''){
                params.providerString = `${userData.name} ${userData.lastname}`
            }
            
            // params.providerString = `${serviceAdd.provider.name} ${serviceAdd.provider.lastname}`;
            params.address.country = 'Argentina';
            if (params.address && params.address.number) params.address.number = Number(params.address.number);
            if (addressChanged) params.address.coordinates = serviceAdd.address? JSON.stringify(await getCoordinates(serviceAdd.address)) : '';
            if (params.price) params.price = Number(params.price);
            //console.log(params)
            
            setLoadingAdd(true);
            try {
                params.rating = 0

                await axios.post('../api/service/createService', params);
                //console.log('Llega hasta después del axios')
                setErrorsAdd({});
                //console.log('Llega después de los errores')
                props.handleCloseModal();
                //console.log('Llega después del closeModal')
                setModalMesage('¡Servicio agregado con éxito!');
                //console.log('Cambia el mensaje')
                setShowSuccessModal(true);
            } catch (error) {
                setResponseErrors(error);
            }
            setLoadingAdd(false);
        }
    }

    const hasErrors = () => {
        let noErrors = true;
        Object.keys(errorsAdd).forEach(key=> {
            if (errorsAdd[key]) noErrors = false;
        })
        return !noErrors;
    }

    return (
        <>
            <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size="lg">
                <Modal.Header>
                    <div>
                        <Modal.Title>{props.title}</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    <Form style={{ width: '90%' }} onSubmit={handleSubmit}>

                        <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                            <Form.Label>Nombre del servicio <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control
                                isInvalid={!!errorsAdd.name}
                                placeholder="Ingresá el nombre del servicio"
                                name="name" autoComplete="off"
                                value={serviceAdd.name}
                                maxLength={50}
                                onChange={handleOnChange} />
                            <Form.Control.Feedback
                                type="invalid">{errorsAdd.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2 d-flex flex-column" controlId="price">
                            <Form.Label>Precio</Form.Label>
                            <div className="d-flex">
                                <InputGroup.Text className="px-2" style={{ borderRadius: "0.5rem 0 0 0.5rem", borderColor: 'var(--card-border-color)' }}>$</InputGroup.Text>
                                <Form.Control
                                    type="number" autoComplete="off"
                                    isInvalid={!!errorsAdd.price}
                                    placeholder=""
                                    name="price"
                                    value={serviceAdd.price}
                                    min={0}
                                    onChange={handleOnChange}
                                    style={{ borderRadius: "0 0.5rem 0.5rem 0" }} />
                            </div>
                            <span className="text-danger mt-1" style={{ fontSize: '0.9rem' }}>{errorsAdd.price}</span>
                        </Form.Group>

                        <Form.Group className="mb-2 d-flex flex-column" controlId="type">
                            <Form.Label>Tipo de servicio <span className="text-tertiary">*</span></Form.Label>
                            <Form.Select
                                // style={{ maxWidth: "15rem" }}
                                placeholder="Seleccione un tipo de servicio"
                                name="type"
                                isInvalid={!!errorsAdd.type}
                                value={serviceAdd.type}
                                onChange={handleOnChange}
                            >
                                <option value=""></option>
                                {serviceTypes.map(type => (
                                    <option value={type.name} key={type._id}>{type.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errorsAdd.type}</Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-6" controlId="photo">
                            <Form.Label>{serviceAdd.photo? 'Foto de portada' : "Agregar foto de portada"}</Form.Label>
                                {serviceAdd.photo? 
                                    <img 
                                        src={serviceAdd.photo} 
                                        alt="Foto de portada" 
                                        style={{width: '100%', borderRadius: '1rem', marginBottom: '1rem'}}
                                    />
                                    : 
                                    null
                                }
                            <DropFileInput 
                                onFileChange={(files) => onFileChange(files)} 
                                fileList={fileList} 
                                onFileDrop={onFileDrop} 
                                fileRemove={fileRemove} 
                                modify={true}
                            />
                        </Form.Group>

                        <Form.Group className="my-2 d-flex flex-column" controlId="description">
                            <Form.Label>Descripción <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                isInvalid={!!errorsAdd.description}
                                placeholder="Ingresá una descripción del servicio a brindar."
                                name="description"
                                value={serviceAdd.description}
                                onChange={handleOnChange}
                                maxLength={500}
                            />
                            <Form.Text className="text-end">{serviceAdd.description ? serviceAdd.description.length : 0} de 500</Form.Text>
                            <Form.Control.Feedback
                                type="invalid">{errorsAdd.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2 d-flex flex-column" controlId="availability">
                            <Form.Label>Disponibilidad <span className="text-tertiary">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                isInvalid={!!errorsAdd.availability}
                                placeholder="Ingresá datos acerca de la disponibilidad del servicio."
                                name="availability"
                                value={serviceAdd.availability}
                                onChange={handleOnChange}
                                maxLength={500}
                            />
                            <Form.Text className="text-end">{serviceAdd.availability ? serviceAdd.availability.length : 0} de 500</Form.Text>
                            <Form.Control.Feedback
                                type="invalid">{errorsAdd.availability}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Accordion className="service-accordion" >
                            <Accordion.Item eventKey="provider">
                                <Accordion.Header>Contacto</Accordion.Header>
                                <Accordion.Body>
                                    <Form.Group className="mb-2 d-flex flex-column flex-grow-1" controlId="providerString">
                                        <Form.Label>Nombre de contacto</Form.Label>
                                        <Form.Control
                                            isInvalid={!!errorsAdd.providerString}
                                            placeholder="" name="providerString"
                                            value={serviceAdd.providerString}
                                            maxLength={50}
                                            onChange={handleOnChange} />
                                        <Form.Control.Feedback type="invalid">{errorsAdd.providerString}</Form.Control.Feedback>
                                        <span style={{ color: 'var(--text-muted)' }}>Por defecto se tomará su nombre y apellido</span>
                                    </Form.Group>
                                    <Form.Group className="mb-2 d-flex flex-column" controlId="contact_number">
                                        <Form.Label className="mb-0">Número de teléfono <span className="text-tertiary">*</span></Form.Label>
                                        <span className="text-muted">Sin espacios ni caracteres especiales</span>
                                        <Form.Control
                                            isInvalid={!!errorsAdd.contact_number}
                                            type="text"
                                            placeholder=""
                                            name="contact_number"
                                            value={serviceAdd.contact_number}
                                            maxLength={16}
                                            onChange={handleOnChange} />
                                        <Form.Control.Feedback type="invalid">{errorsAdd.contact_number}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-2 d-flex flex-column" controlId="contact_email">
                                        <Form.Label>Dirección de correo electrónico <span className="text-tertiary">*</span></Form.Label>
                                        <Form.Control
                                            isInvalid={!!errorsAdd.contact_email}
                                            placeholder=""
                                            name="contact_email"
                                            value={serviceAdd.contact_email}
                                            maxLength={30}
                                            onChange={handleOnChange} />
                                        <Form.Control.Feedback type="invalid">{errorsAdd.contact_email}</Form.Control.Feedback>
                                    </Form.Group>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item className='mt-3' eventKey="location">
                                <Accordion.Header>Ubicación</Accordion.Header>
                                <Accordion.Body>
                                    <LocationForm 
                                        address={serviceAdd.address}
                                        errors={errorsAdd}
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
                <Modal.Footer className='d-flex flex-column justify-content-end align-items-end'>
                    <div className='d-flex flex-row'>
                        <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                        Cancelar
                    </Button>
                    {!loadingAdd ?
                        <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
                            Agregar servicio
                        </Button> :
                        <Button className="btn-primary-modal px-3" disabled>
                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />&nbsp;Cargando...
                        </Button>
                    }
                    </div>
                </Modal.Footer>
            </Modal>
            {openCrop ? 
            <CropEasy 
                {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} 
                aspect_ratio={16/9} 
                round={false} 
                setModalLoading={setCropping}/> 
            : 
            null
            }
            <CroppingModal showModal={cropping}/>
            <InfoModal
                showModal={showSuccessModal}
                handleCloseModal={() => { setShowSuccessModal(false); props.getServices() }}
                message={modalMessage}
                img={SuccessPhoneGirl}
            />
        </>
    );
}