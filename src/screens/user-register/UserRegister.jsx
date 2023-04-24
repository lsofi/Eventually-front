import React, { useState } from "react";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import "./UserRegister.css";
import { FormControl } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import InfoModal from '../../components/modals/InfoModal';
import PasswordChecklist from "react-password-checklist";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faJarWheat } from '@fortawesome/free-solid-svg-icons';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";
import EventuallyFullLogoLight from "../../resources/images/EventuallyFullLogoLight.png"

export default function UserRegister(){

  const initialUserValue = {
    username: '',
    name: '',
    lastname: '',
    email: '',
    password: '',
    passConfirm: '',
    birthday: '',
    gender: '',
    terms: false,
  };

  const [ newUser, setNewUser ] = useState(initialUserValue);
  const [ errors, setErrors ] = useState({});
  const [ showPassword, setShowPassword] = useState(false);
  const [ loading, setLoading] = useState(false);
  const [ showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const togglePassword = () => {
    if ( newUser.password !== '' || showPassword ) setShowPassword(!showPassword);
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/login');
  }

  const findFormErrors = () =>{
    const { username, name, lastname, email, password, passConfirm, birthday, gender, terms} = newUser;
    const passVal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
    const userVal = /^[a-zA-Z0-9]*$/;
    const newErrors = {};
    if (!username || username === '') newErrors.username = 'Por favor ingrese un nombre de usuario.';
    else if (!username.match(userVal)) newErrors.username = 'El nombre de usuario debe contener letras y números únicamente.';
    else if (username.length < 4) newErrors.username = 'El nombre de usuario debe tener al menos 4 caracteres.';
    else if (username.length > 30) newErrors.username = 'El nombre de usuario no puede tener más de 30 caracteres.';

    if (!name || name === '') newErrors.name = 'Por favor ingrese su nombre.';
    else if (name.length < 2) newErrors.name = 'Su nombre debe tener al menos 2 caracteres.';
    else if (name.length > 50) newErrors.name = 'Su nombre no puede tener más de 50 caracteres.';

    if (!lastname || lastname === '') newErrors.lastname = 'Por favor ingrese su apellido.';
    else if (lastname.length < 2) newErrors.lastname = 'Su apellido debe tener al menos 2 caracteres.';
    else if (lastname.length > 50) newErrors.lastname = 'Su apellido no puede tener más de 50 caracteres.';

    if (!email || email === '') newErrors.email = 'Por favor ingrese su email.';
    else if (!email.includes('@')) newErrors.email = 'Por favor ingrese una dirección de email válida.'

    if (!password || password === '') newErrors.password = 'Por favor ingrese su contraseña.';
    else if (!password.match(passVal)) newErrors.password = 'Se debe ingresar una contraseña con un mínimo de 8 caracteres, incluyendo mayúsculas, minúsculas y números.'

    if ( password !== passConfirm) newErrors.passConfirm = 'Las contraseñas deben coincidir.';

    if ( !birthday || birthday === '') newErrors.birthday = 'Por favor ingrese su fecha de nacimiento.';
    else if ( new Date(birthday) > subtractYears(13, new Date())) newErrors.birthday = 'Usted debe tener al menos 13 años.';

    if ( !gender || gender === '') newErrors.gender = 'Por favor seleccione su género.';

    if ( !terms ) newErrors.terms = 'Debe aceptar los términos y condiciones.';

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

  const handleOnChange = event => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setNewUser({...newUser, [name]: value})
    if ( !!errors[name] ) setErrors({...errors, [name]: null});
  }

  const handleSubmit = async event =>{
    event.preventDefault();
    event.stopPropagation();
    // get our new errors
    const newErrors = findFormErrors()
    // Conditional logic:
    if ( Object.keys(newErrors).length > 0 ) {
      // We got errors!
      setErrors(newErrors)
    } else {
      // No errors!
      //Set the parameters to send to the api
      const param = {
        "username": newUser.username,
        "name": newUser.name,
        "lastname": newUser.lastname,
        "email": newUser.email.toLowerCase(),
        "password": newUser.password,
        "birthday": newUser.birthday,
        "gender": newUser.gender
      };
      setLoading(prev=>prev+1);
      try{
        setErrors({});
        //Get the api data
        const data = await axios.post('/api/user/createUser', param);
        //Show modal dialog and navigate to login
        handleShowModal();
      } catch (error){       
        setResponseErrors(error);        
      }
      setLoading(prev=>prev-1);
    }
  };

  function subtractYears(numOfYears, date = new Date()) {
    date.setFullYear(date.getFullYear() - numOfYears);
  
    return date;
  }
  
  return (
    <div className="body d-flex UserRegister justify-content-center bg-img-register">
      <div className="bg-card register-card">
        <Row>
          <Link to="/" className="no-decorations d-flex justify-content-center">
            <img src={EventuallyFullLogoLight} className="img-logo"></img>
          </Link>
        </Row>
        <div className="row justify-content-center" style={{margin: "2rem 0"}}>
          <h2>¡Te damos la bienvenida a Eventually!</h2>
        </div>
        <div className="row justify-content-center">
          <div className="btn-group-social d-flex flex-column">
            <h4>Registrate con</h4>
            <a href="/api/auth/google/login" className="btn btn-google">Google</a>
            <h5 className="align-self-center">O podés registrate acá</h5>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="signup-form">
            <Form noValidate onSubmit={handleSubmit}>
              <FloatingLabel className="form-label" controlId="username" label="Nombre de usuario">
                <Form.Control className="form-input" isInvalid={ !!errors.username } name="username" maxLength={30} value={newUser.username} placeholder="Nombre de usuario" onChange={handleOnChange}></Form.Control>
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel className="form-label" controlId="name" label="Nombre">
                <Form.Control className="form-input" isInvalid={ !!errors.name } name="name" autoComplete="off" maxLength={50} value={newUser.name} placeholder="Nombre" onChange={handleOnChange}></Form.Control>
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel className="form-label" controlId="lastname" label="Apellido">
                <Form.Control className="form-input" isInvalid={ !!errors.lastname } name="lastname" maxLength={50} value={newUser.lastname} placeholder="Apellido" onChange={handleOnChange}></Form.Control>
                <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel className="form-label" controlId="email" label="Email"> 
                <Form.Control className="form-input" isInvalid={ !!errors.email } name="email" maxLength={100} value={newUser.email} type="email" placeholder="Ingresá tu email" onChange={handleOnChange}></Form.Control>
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </FloatingLabel>
              <div className="d-flex">
                <FloatingLabel className="form-label" style={{flexGrow: '1'}} controlId="password" label="Contraseña" >
                  <Form.Control className="form-input" isInvalid={ !!errors.password } autoComplete="off" maxLength={32} name="password" value={newUser.password} type={showPassword? 'text': 'password'} 
                    placeholder="Ingresá tu contraseña" onChange={handleOnChange}/>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </FloatingLabel>
                <Button className="text-muted btn btn-show-password" style={{marginBottom: '0.5rem', border: 'none'}} onClick={()=>togglePassword()}> <FontAwesomeIcon icon={showPassword? faEyeSlash : faEye}/></Button>
              </div>
              <FloatingLabel className="form-label" controlId="passConfirm" label="Confirmar contraseña">
                <FormControl className="form-input" isInvalid={ !!errors.passConfirm } autoComplete="off" maxLength={32} name="passConfirm" value={newUser.passConfirm} type="password" placeholder="confirme su contraseña" onChange={handleOnChange}></FormControl>
              </FloatingLabel>
              <PasswordChecklist
                  className=""
                  rules={["minLength", "maxLength", "number","capital", "lowercase", "match"]}
                  minLength={8}
                  maxLength={32}
                  value={newUser.password}
                  valueAgain={newUser.passConfirm}
                  messages={{
                    minLength: "La contraseña tiene como mínimo 8 caracteres.",
                    maxLength: "La contraseña tiene como máximo 32 caracteres.",
                    number: "La contraseña tiene un número.",
                    capital: "La contraseña tiene una letra mayúscula.",
                    lowercase: "La contraseña tiene una letra minúscula",
                    match: "Las contraseñas coinciden",
                  }}
                />
              <FloatingLabel className="form-label" controlId="birthday" label="Fecha de nacimiento">
                <FormControl className="form-input" isInvalid={ !!errors.birthday } name="birthday" value={newUser.birthday} type="date" placeholder="Ingresá tu fecha de nacimiento" onChange={handleOnChange}></FormControl>
                <Form.Control.Feedback type="invalid">{errors.birthday}</Form.Control.Feedback>
              </FloatingLabel>
              <FloatingLabel className="form-label" controlId="gender" label="Género">
                <Form.Select className="form-input" isInvalid={ !!errors.gender} name="gender" value={newUser.gender} aria-label="Floating label" onChange={handleOnChange}>
                  <option value=""> Seleccione su género</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Otro</option>
                  <option value="N">Prefiero no decirlo</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{ errors.gender }</Form.Control.Feedback>
              </FloatingLabel>
              <Form.Group controlId="terms">
                <div className="d-flex alignt-items-center my-3">
                  <Form.Check id="chk-terms" type="checkbox" isInvalid={ !!errors.terms } name="terms" checked={newUser.terms} onChange={handleOnChange}/>
                  <label className="mx-2" htmlFor="chk-terms">He leído y acepto los <a href="https://drive.google.com/file/d/1LvGycd3EdApZ8A8rScS9a81Y303Zmuu0/view" target="_blank">términos y condiciones de servicio</a>.</label>
                </div>
                  <span className="text-danger">{errors.terms}</span>
              </Form.Group>
              <div className="row">
                {!loading?
                <Button className="btn btn-register" type="submit">Registrate</Button>
                :
                <Button className="btn btn-register" type="submit" disabled>
                <Spinner as="span" animation="border" role="status" aria-hidden="true"/>
                  &nbsp;
                  Registrando
                </Button>}
                <span className="text-danger text-center mt-3">{errors.register}</span>
              </div>
            </Form>
          </div>
        </div>
        <hr/>
        <div className="row justify-content-center">
          <h6 className="text-center">¿Ya tenés una cuenta? Ingresá <Link to="/login">acá</Link></h6>
        </div>
        <br/>
      </div>
      <InfoModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        message="¡Usuario registrado con éxito!"
        img={SuccessPhoneGirl}
      />
    </div>
  );
}
