import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import InfoModal from "../../components/modals/InfoModal";
import { useEffect } from "react";

import EventuallyFullLogoLight from "../../resources/images/EventuallyFullLogoLight.png";
import SecurityMonitor from "../../resources/images/SecurityMonitor.png";
import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function ResetPassword() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const resetPasswordToken = urlParams.get('newPasswordToken');

    const [ newPassword, setNewPassword ] = useState('');
    const [ repeatPassword, setRepeatPassword ] = useState('');
    const [ showPassword, setShowPassword] = useState(false);
    const [ errors, setErrors ] = useState({});
    const [ showInfoModal, setShowInfoModal ] = useState(false);
    const [ showErrorModal, setShowErrorModal ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    const navigate = useNavigate();

    useEffect(()=>{
        if (!resetPasswordToken) navigate('/login')
    },[]);

    const findFormErrors = () => {
        const newErrors = {};
        const passVal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
    
        if ( !newPassword || newPassword === '' ) newErrors.newPassword = 'Por favor ingrese una nueva contraseña';
        else if ( !newPassword.match(passVal)) newErrors.newPassword = 'Se debe ingresar una contraseña con un mínimo de 8 caracteres, incluyendo mayúsculas, minúsculas y números.'
        
        if ( !repeatPassword || repeatPassword === '' ) newErrors.repeatPassword = 'Por favor repita su contraseña.';
        else if ( repeatPassword !== newPassword ) newErrors.repeatPassword = 'Las contraseñas no coinciden.';
    
        return newErrors;
    }

    const handleOnChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;

        if (name === 'newPassword' ) setNewPassword(value);
        else setRepeatPassword(value);

        if (!!errors[name]) setErrors({...errors, [name]: null});
    }

    const togglePassword = () => {
        if ( newPassword !== '' || showPassword ) setShowPassword(!showPassword);
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
            //Start the loading indicator
            setLoading(prev=>prev+1);
            const params = {
                newPassword: newPassword,
                newPasswordToken: resetPasswordToken
            }
            try {
                //Get the api data
                const data = await axios.post(`../api/auth/reset-password`, params)
                setShowInfoModal(true);
            } catch (error) {
               
                setShowErrorModal(true);
            }
            //Stop the loading indicator.
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
                            <Form.Group className="mb-3 responsive-password-form" controlId="newPassword">
                                <Form.Label>Nueva contraseña</Form.Label>
                                <div className="d-flex gap-3">
                                    <Form.Control isInvalid={ !!errors.newPassword } maxLength={32} name="newPassword" value={newPassword} type={showPassword? 'text': 'password'} 
                                        placeholder="Ingresá una nueva contraseña" onChange={handleOnChange}/>
                                    <button type="button" className="text-muted " style={{border: 'none'}} onClick={()=>togglePassword()}> <FontAwesomeIcon icon={showPassword? faEyeSlash : faEye}/></button>
                                </div>
                                <span className="text-danger">{errors.newPassword}</span>
                            </Form.Group>
                            <Form.Group className="mb-3 responsive-password-form" controlId="repeatPassword">
                                <Form.Label>Repetir contraseña</Form.Label>
                                <Form.Control isInvalid={ !!errors.repeatPassword } maxLength={32} name="repeatPassword" value={repeatPassword} type="password" 
                                    placeholder="Ingresá una nueva contraseña" onChange={handleOnChange}/>
                                <Form.Control.Feedback type="invalid">{errors.repeatPassword}</Form.Control.Feedback>
                            </Form.Group>
                            <div className="row mt-5 mb-3 d-flex justify-content-center">
                                {!loading? 
                                <Button className="btn btn-register px-3" style={{fontSize: "min(3vw, 1.1rem)", maxWidth: "fit-content"}} type="submit">
                                    Restablecer contraseña
                                </Button>
                                : 
                                <Button className="btn btn-register px-3" style={{fontSize: "min(3vw, 1.1rem)", maxWidth: "fit-content"}} type="submit" disabled>
                                    <Spinner as="span" animation="border" role="status" aria-hidden="true" size="sm"/>
                                    &nbsp;Restableciendo contraseña
                                </Button>}
                            </div>
                            <br/>
                            <span><a href="/login" className="text-muted responsive-password-form">Ir a inicio de sesión</a></span>
                        </Form>
                    </div>
                </div>
            </div>
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={()=>{setShowInfoModal(false); navigate('/login')}}
                message="¡Contraseña restablecida con éxito!"
                title="Restablecer contraseña"
                img={SuccessPhoneGirl}
            />                        
            <InfoModal
                showModal={showErrorModal}
                handleCloseModal={()=>{setShowErrorModal(false)}}
                message="Lo sentimos, tu solicitud de restablecimiento de contraseña ha expirado o no existe."
                title="Restablecer contraseña"
                img={SecurityMonitor}
            />                        
        </div>
    );
}
