import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import LocationForm from '../LocationForm';
import { getCoordinates } from '../../services/map.service';
import { toast } from 'react-toastify';


export default function TransportRequestModal( props ) {

    const [ request, setRequest ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ addressChanged, setAddressChanged ] = useState(false);
    const [ loading, setLoading ] = useState(0);

    useEffect(()=>{
        if(!props.showModal) return;
        setRequest({});
        setErrors({});
        setAddressChanged(false);
        setLoading(0);
    },[props.showModal])

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

    const findErrors = () => {
        let newErrors = {};
        
        if (!request.message || request.message === '') newErrors.message = "Debe ingresar un mensaje."
        if (request.message && request.message.length > 500) newErrors.message = "El mensaje no puede superar los 500 caracteres."

        if (!request.address || request.address && !request.address.province ) newErrors = {...newErrors, address: { ...newErrors.address, province: "Debe seleccionar una provincia."}};
        if (!request.address || request.address && !request.address.city) newErrors = {...newErrors, address: { ...newErrors.address, city: "Debe seleccionar una ciudad."}};
        if (!request.address || request.address && !request.address.street) newErrors = {...newErrors, address: { ...newErrors.address, street: "Debe ingresar una calle."}};
        if (!request.address || request.address && !request.address.number) newErrors = {...newErrors, address: { ...newErrors.address, number: "Debe ingresar una altura."}};

        if (!request.address || request.address && request.address.street && request.address.street.length > 30) newErrors = {...newErrors, address: { ...newErrors.address, street: "El nombre de la calle no puede superar los 30 caracteres."}};
        
        if (!request.address || request.address && request.address.number && request.address.number.length > 5) newErrors = {...newErrors, address: { ...newErrors.address, number: "La altura no puede superar los 5 dígitos."}};
        if (!request.address || request.address && request.address.number && request.address.number <= 0) newErrors = {...newErrors, address: { ...newErrors.address, number: "La altura debe ser un número mayor a 0."}};
        if (!request.address || request.address && request.address.number && !Number.isInteger(parseFloat(request.address.number))) newErrors = {...newErrors, address: { ...newErrors.address, number: "La altura debe ser un número entero."}};

        return newErrors;
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

    const handleOnChange = e => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;    

        setRequest({...request, [name]: value})
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleOnChangeAddress = e => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setRequest({...request, address: {...request.address, [name]: value}});
        if ( errors.address && !!errors.address[name] ) setErrors({...errors, address:{...errors.address, [name]: null}});
        setAddressChanged(true);
    }

    const handleSetAddress = (address) => {
        setRequest(prev => ({...prev, address: address}));
        setAddressChanged(true);
    }

    const handleClose = () => {
        setRequest({});
        setErrors({});
        setAddressChanged(false);
        setLoading(0);
        props.handleCloseModal();
        props.getTransport();
    }

    const handleConfirm = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
            console.log(newErrors);
        } else {
            setLoading(prev=>prev+1);
            try {
                const params = {
                    ...request,
                    transport_id: props.transport.transport_id,
                    event_id: props.event_id,
                    user_id: props.user_id
                }
                if (addressChanged) params.address.coordinates = JSON.stringify(await getCoordinates(request.address));
                await axios.post('../api/transport/subscribeToTransport', params);
                toast.success('Solicitud enviada con éxito');
                handleClose();
            } catch (error) {
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }

    return (
        <Modal show={props.showModal} onHide={props.handleClose} backdrop="static" className='Modal'>
            <Modal.Header className="d-block">
                <h4 className="text-primary-eventually">Subscribirse a transporte</h4>
                {props.transport? <span>{props.transport.name}</span>: null}
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleConfirm}>
                    <Form.Group className="mb-6 d-flex flex-column" controlId="description">
                        <Form.Label>Mensaje <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control as="textarea" isInvalid={ !!errors.message} placeholder="" name="message" disabled={!props.modify} 
                            value={request.message} maxLength={500} onChange={(e)=>handleOnChange(e)}/>
                        <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
                        {props.modify? <Form.Text className="text-end">{request.message? request.message.length: 0} de 500</Form.Text> : null}
                    </Form.Group>
                    <h4>Lugar de búsqueda</h4>
                    <div className="px-3 pt-0 pb-4">
                        <LocationForm address={request.address} errors={errors.address} eventAddress={props.eventAddress} startingPointAddress={props.startingPointAddress} handleOnChange={handleOnChangeAddress} modify={props.modify} handleSetAddress={handleSetAddress} changedAddress={addressChanged}/>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button className="btn-secondary-modal px-3" onClick={handleClose}>
                    Cancelar
                </Button>
                {!loading?
                    <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    )
}
