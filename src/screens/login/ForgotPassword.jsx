import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import InfoModal from "../../components/modals/InfoModal";

import EventuallyFullLogoLight from "../../resources/images/EventuallyFullLogoLight.png"
import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function ForgotPassword() {

    const [ email, setEmail ] = useState('');
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ showInfoModal, setShowInfoModal ] = useState(false);

    const navigate = useNavigate();

    const findFormErrors = () => {
        const newErrors = {};
    
        if (!email || email === '') newErrors.email = 'Por favor ingrese su correo electrónico.';
        else if (!email.includes('@')) newErrors.email = 'Por favor ingrese una dirección de correo electrónico válida.';
    
    
        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try{
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrors(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {}
    }

    const handleOnChange = (event) => {
        const value = event.target.value;

        setEmail(value);
        if (!!errors.email) setErrors({});
    }

    const handleSubmit = async (event) =>{
        event.preventDefault();
        event.stopPropagation();
        // get our new errors
        const newErrors = findFormErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
        // We got errors!
        setErrors(newErrors)
        } else {
            try {
                //Start the loading indicator
                setLoading(prev=>prev+1);
                setErrors({});
                //Get the api data
                const data = await axios.get(`../api/auth/forgotPassword?email=${email}`); //noice
                //Stop the loading indicator.
                setShowInfoModal(true);
            } catch (error) {
                //Stop the loading indicator and show errors (Line 120).
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }
    
    return(
        <div className="body d-flex justify-content-center login" style={{minHeight: '100vh'}}>
            <div className="bg-card register-card">
                <Row>
                    <img src={EventuallyFullLogoLight} className="img-logo"></img>
                </Row>
                <div className="row justify-content-center">
                    <div className="btn-group-social d-flex flex-column">
                        <h2 className="text-center my-5 my-4">Restablecé tu contraseña</h2>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="signup-form">
                        <Form noValidate onSubmit={handleSubmit}>
                            <Form.Group className="mb-3 responsive-password-form" controlId="email">
                                <Form.Label>¿Cuál es tu correo electrónico?</Form.Label>
                                <Form.Control type="nombre" isInvalid={ !!errors.email } placeholder="Ingrese su correo electrónico" name="email" value={email} onChange={handleOnChange} maxLength={50}/>
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                            <div className="row mt-5 mb-3 d-flex justify-content-center">
                                {!loading? 
                                <Button className="btn btn-register px-3" style={{fontSize: "min(3vw, 1.1rem)", maxWidth: "fit-content"}} type="submit">
                                    Enviar correo de restablecimiento de contraseña
                                </Button>
                                : 
                                <Button className="btn btn-register px-3" style={{fontSize: "min(3vw, 1.1rem)", maxWidth: "fit-content"}} type="submit" disabled>
                                    <Spinner as="span" animation="border" role="status" aria-hidden="true" size="sm"/>
                                    &nbsp;Enviando correo
                                </Button>}
                            </div>
                            <br/>
                            <span><a href="/login" className="text-muted responsive-password-form" >Volver</a></span>
                        </Form>
                    </div>
                </div>
            </div>
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={()=>{setShowInfoModal(false); navigate('/login')}}
                message="¡Correo enviado con éxito!"
                img={SuccessPhoneGirl}
            />
        </div>
    );
}
