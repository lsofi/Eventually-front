import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Accordion from 'react-bootstrap/Accordion';
import ModalPassConfirm from "../components/modals/ModalPassConfirm";
import InfoModal from "../components/modals/InfoModal";

import SuccessPhoneGirl from "../resources/images/SuccessPhoneGirl.png"
export default function PasswordConfig( props ) {

    const [ errors, setErrors ] = useState({});
    const [ new_password, setNewPassword] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading] = useState(false);
    const [ showPassword, setShowPassword] = useState(false);
    const [ showConfirmationModal, setShowConfirmationModal ] = useState(false);
    const [ showInfoModal, setShowInfoModal] = useState(false);

    const findErrors = () => {
        const passVal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
        const newErrors = {};
    
        if ( !new_password || new_password === '' ) newErrors.new_password = 'Por favor ingrese una nueva contraseña';
        else if (!new_password.match(passVal)) newErrors.new_password = 'Se debe ingresar una contraseña con un mínimo de 8 caracteres, incluyendo mayúsculas, minúsculas y números.'
        
        if ( (!password || password === '') && showConfirmationModal) newErrors.password = 'Por favor ingrese su contraseña para continuar.';

        return newErrors
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


    const handleChangePassword = event => {
        const value = event.target.value;
        setPassword(value);
        if ( !!errors.password) setErrors({...errors, password: null});
    }

    const handleOnChangeNewPassword = event => {
        const value = event.target.value;
    
        setNewPassword(value);
        if ( !!errors.new_password ) setErrors({...errors, new_password: null});
    }

    const togglePassword = () => {
        if ( new_password !== '' || showPassword ) setShowPassword(!showPassword);
    }

    const handlePasswordConfig = () => {
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors)
        } else {
            setShowConfirmationModal(true);
            setErrors({...errors, password: null});
        }
    }

    const handleChangePasswordApi = async () => {
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
            // We got errors!
            setErrors(newErrors)
        } else {
            const param = {
                password: password,
                new_password: new_password
        };
        setLoading(prev=>prev+1);
        try{
            await axios.put('/api/user/changePassword', param);
            setShowConfirmationModal(false);
            setPassword('');
            setNewPassword('');
            setShowInfoModal(true);
        } catch (error){
            setResponseErrors(error);
        }
        setLoading(prev=>prev-1);
        }
    }

    return (
        <>
            <Accordion defaultActiveKey={null}>
                <Accordion.Item>
                    <Accordion.Header>
                        Modificar Contraseña
                    </Accordion.Header>
                    <Accordion.Body>
                        <Form>
                            <Form.Group className="mb-3" controlId="new_password">
                                <Form.Label>Nueva contraseña</Form.Label>
                                <div className="d-flex gap-3">
                                <Form.Control isInvalid={ !!errors.new_password } maxLength={32} name="new_password" value={new_password} type={showPassword? 'text': 'password'} 
                                    placeholder="Ingresá una nueva contraseña" onChange={handleOnChangeNewPassword} disabled={!props.modify}/>
                                <button type="button" className="text-muted " style={{border: 'none'}} onClick={()=>togglePassword()}> <FontAwesomeIcon icon={showPassword? faEyeSlash : faEye}/></button>
                                <Button className="btn btn-group-sm btn-eliminar" onClick={handlePasswordConfig}>Modificar</Button>
                                </div>
                                <span className="text-danger">{errors.new_password}</span>
                            </Form.Group>
                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            <ModalPassConfirm 
                showModal={showConfirmationModal} 
                handleCancel={() => setShowConfirmationModal(false)}
                handleConfirm={handleChangePasswordApi}
                title="Modificar contraseña"
                message="¿Está seguro/a de modificar su contraseña?"
                errors={errors.password}
                loading={loading}
                handleOnChange={handleChangePassword}
            />
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={()=>{setShowInfoModal(false)}}
                message="¡Contraseña modificada con éxito!"
                img={SuccessPhoneGirl}
            />
        </>
    )
}