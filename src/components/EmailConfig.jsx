import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import Accordion from 'react-bootstrap/Accordion';
import ModalPassConfirm from "../components/modals/ModalPassConfirm";
import InfoModal from "../components/modals/InfoModal";

import SuccessPhoneGirl from "../resources/images/SuccessPhoneGirl.png";

export default function EmailConfig( props ) {

    const [ errors, setErrors ] = useState({});
    const [ new_mail, setEmailConfig ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading] = useState(false);
    const [ showInfoModal, setShowInfoModal] = useState(false);
    const [ showConfirmationModal, setShowConfirmationModal ] = useState(false);

    const findErrors = () => {
        const newErrors = {};
    
        if (!new_mail || new_mail === '') newErrors.new_mail = 'Por favor ingrese un nuevo correo electrónico.';
        else if (!new_mail.includes('@')) newErrors.new_mail = 'Por favor ingrese una dirección de correo electrónico válida.'
    
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

    const handleOnChangeEmailConfig = event => {
        const value = event.target.value;
    
        setEmailConfig(value);
        if ( !!errors.new_mail ) setErrors({...errors, new_mail: null});
    }

    const handleChangePassword = event => {
        const value = event.target.value;
        setPassword(value);
        if ( !!errors.password) setErrors({...errors, password: null});
    }

    const handleEmailConfig = () => {
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


    const handleChangeEmail = async () => {
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
            // We got errors!
            setErrors(newErrors)
        } else {
            const param = {
                password: password,
                new_email: new_mail
            };
            setLoading(prev=>prev+1);
            try{
                await axios.put('/api/user/changeEmail', param);
                setShowConfirmationModal(false);
                setPassword('');
                setEmailConfig('');
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
                        Modificar Correo Electrónico
                    </Accordion.Header>
                    <Accordion.Body>
                        <Form>
                            <Form.Group className="mb-3" controlId="email-config">
                                <Form.Label>Nuevo Correo Electrónico </Form.Label>
                                <div className="d-flex gap-3">
                                    <Form.Control type="email" isInvalid={ !!errors.new_mail } placeholder="Ingresá un nuevo correo electrónico" name="new_mail" disabled={!props.modify} value={new_mail} onChange={handleOnChangeEmailConfig} maxLength={45}/>
                                    <Button className="btn btn-group-sm btn-eliminar" onClick={handleEmailConfig}>Modificar</Button>
                                </div>
                                <span className="text-danger">{errors.new_mail}</span>
                            </Form.Group>
                        </Form>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            <ModalPassConfirm 
                showModal={showConfirmationModal} 
                handleCancel={() => {setShowConfirmationModal(false); setErrors({...errors, password: null})}}
                handleConfirm={handleChangeEmail}
                title="Modificar correo electrónico"
                message="¿Está seguro/a de modificar su correo electrónico?"
                errors={errors.password}
                loading={loading}
                handleOnChange={handleChangePassword}
            />
            <InfoModal
                showModal={showInfoModal}
                handleCloseModal={()=>{setShowInfoModal(false)}}
                message="¡Correo electrónico modificado con éxito!"
                img={SuccessPhoneGirl}
            />
        </>
    )
}
