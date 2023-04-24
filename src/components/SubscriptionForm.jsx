import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useMercadopago } from 'react-sdk-mercadopago';

// mercadopago.setPublishableKey('PUBLIC_KEY');

export default function SubscriptionForm ( props ) {
    
    const mercadopago = useMercadopago.v2('TEST-c3333699-054a-48dd-a90b-97845b100a5a', { locale: 'es-MX'});
    
    const [ email, setEmail ] = useState();
    const [ errors, setErrors ] = useState({})
    const [ preference, setPreference ] = useState({});
    const [ loading, setLoading ] = useState(0);

    const getPreferenceId = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!email){
            setErrors({email: 'Por favor ingrese su email'});
            return;
        }
        else if (!email.includes('@')){
            setErrors({email: 'Por favor ingrese una dirección de email válida.'});
            return;
        } 
        setLoading(prev => prev + 1);
        try {
            const response = await axios.post('../api/subscription/createSubscription', {
                email: email,
            });
            setPreference({id: response.data.init_point});
            
        } catch (error) {}
        setLoading(prev => prev - 1);
    };

    const handleOnChange = (event) => {
        const value = event.target.value;

        setEmail(value);
        if (errors.email) setErrors(prev => ({...prev, email: null}));
    }

    const fakeSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleHide = () => {
        handleClearForm();
        props.handleCloseModal();
    }

    const handleClearForm = () => {
        setPreference({});
        setEmail('');
        setErrors({});
    }

    return (
        <Modal show={props.showModal} onHide={handleHide}>
            <Modal.Header>
                <h3 className="m-0">Registro de pago de suscripción</h3>
            </Modal.Header>
            <Modal.Body>
                <Form className="d-flex flex-column align-items-center" onSubmit={getPreferenceId}>
                    <Form.Group className="w-100">
                        <Form.Label>Ingresá tu email con MercadoPago</Form.Label>
                        <Form.Control placeholder='ejemplo@gmail.com' value={email} onChange={handleOnChange} isInvalid={errors.email} disabled={preference.id}/>
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                    <div className="mt-2">
                        {!preference.id?
                            loading?
                                <Button className="mt-2 px-3 py-2" type="submit" disabled={true}>
                                    <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                                </Button>
                            :
                                <Button className="mt-2 px-3 py-2" type="submit">
                                    Continuar
                                </Button>
                        
                        :
                            <div className="d-flex gap-2">
                                <Button className="mt-2 px-3 py-2 btn-mercadopago" onClick={()=>window.location.href = preference.id}>
                                    Pagar
                                </Button>
                                <Button className="mt-2 px-3 py-2 btn-warning" onClick={handleClearForm}>
                                    Cancelar
                                </Button>
                            </div>
                        }
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
