import React, { useState } from "react";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import './Login.css';
import { FormControl } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import EventuallyFullLogoLight from "../../resources/images/EventuallyFullLogoLight.png"

export default function Login(props){
  
  const initialLoginValue = {
    email: '',
    password: ''
  };
  const [ login, setLogin ] = useState(initialLoginValue);
  const [ errors, setErrors ] = useState({});
  const [ showPassword, setShowPassword ] = useState(false);
  const [ loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const togglePassword = () => {
    if ( login.password !== '' || showPassword ) setShowPassword(!showPassword);
  }

  //Check the form for errors
  const findFormErrors = () => {
    const { email, password } = login;
    const newErrors = {};

    if (!email || email === '') newErrors.email = 'Por favor ingrese su email.';
    else if (!email.includes('@')) newErrors.email = 'Por favor ingrese una dirección de email válida.';

    if (!password || password === '') newErrors.password = 'Por favor ingrese su contraseña.';

    return newErrors;
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

  const handleOnChange = e => {
    const {name, value} = e.target;

    setLogin({...login, [name]: value})
    if ( !!errors[name] ) setErrors({...errors, [name]: null});
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
      // No errors! setting the params for the api
      const param = {...login};
      setLoading(prev=>prev+1);
      try {
        //Start the loading indicator
        setErrors({});
        //Get the api data
        const data = await axios.post('../api/auth/local/login', param); //noice
        //Execute the login with the response token.
        props.handleLogIn(data.data);
        //Stop the loading indicator.
        if (location.state?.from){
          navigate(location.state.from);
        }
        else {
          navigate('/events');
        }
      } catch (error) {
        //Stop the loading indicator and show errors (Line 120).
        setResponseErrors(error);
      }
      setLoading(prev=>prev-1);
    }
  };
  
  return (
    <div className="body d-flex justify-content-center bg-img-login login" style={{minHeight: '100vh'}}>
      <div className="bg-card register-card">
        <Row>
          <Link to="/" className="no-decorations d-flex justify-content-center">
            <img src={EventuallyFullLogoLight} className="img-logo"></img>
          </Link>
        </Row>
        <div className="row justify-content-center">
          <div className="btn-group-social d-flex flex-column">
            <h2 className="text-start mt-3">¡Hola!</h2>
            <h4>Inicia sesión con</h4>
            <a href="/api/auth/google/login" className="btn btn-google">Google</a>
            <h5 className="align-self-center">O ingresá con</h5>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="signup-form">
            <Form noValidate onSubmit={handleSubmit}>
            <FloatingLabel className="form-label" controlId="email" label="Email">
                <FormControl className="form-input" isInvalid={ !!errors.email } name="email" value={login.email} type="email" placeholder="Ingrese su email" onChange={handleOnChange}></FormControl>
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </FloatingLabel>
              <div className="d-flex">
                <FloatingLabel className="form-label" style={{flexGrow: '1'}} controlId="password" label="Contraseña" >
                  <Form.Control className="form-input" isInvalid={ !!errors.password } name="password" value={login.password} type={showPassword? 'text': 'password'} 
                    placeholder="ingrese su contraseña" onChange={handleOnChange}/>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </FloatingLabel>
                <Button className="text-muted btn btn-show-password" style={{marginBottom: '0.5rem', border: 'none'}} onClick={()=>togglePassword()}> <FontAwesomeIcon icon={showPassword? faEyeSlash : faEye}/></Button>
              </div>
              <span><a href="/login/forgotPassword" className="text-muted no-decorations" >¿Olvidaste tu contraseña?</a></span>
              <div className="row mt-5 mb-3">
                {!loading? 
                <Button className="btn btn-register" type="submit">Iniciar sesión</Button>
                : 
                <Button className="btn btn-register" type="submit" disabled>
                <Spinner as="span" animation="border" role="status" aria-hidden="true"/>
                  &nbsp;Iniciando sesión
                </Button>}
                <span className="text-danger text-center mt-3">{errors.login}</span>
              </div>
            </Form>
          </div>
        </div>
        <hr/>
        <div className="row justify-content-center">
          <h6 className="text-center"> ¿No tenés una cuenta? Registrate <Link to="/signup">acá</Link></h6>
        </div>
        <br/>
      </div>
    </div>
  );
}
