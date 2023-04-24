import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import "./UserConfig.css";
import { useNavigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen,faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Accordion from 'react-bootstrap/Accordion';
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import ModalPassConfirm from "../../components/modals/ModalPassConfirm";
import LoadingModal from "../../components/modals/LoadingModal";
import Delay from "../../components/Delay";
import InfoModal from "../../components/modals/InfoModal";
import PasswordConfig from "../../components/PasswordConfig";
import EmailConfig from "../../components/EmailConfig";
import { imageResize } from "../../shared/imageResizer";
import CropEasy from "../../components/crop/CropEasy";
import CroppingModal from "../../components/modals/CroppingModal";
import YesNoConfirmationModal from "../../components/modals/YesNoConfirmationModal";

import DefaultProfilePhotoDog from "../../resources/images/DefaultProfilePhotoDog.png";
import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";
import { toast } from "react-toastify";

export default function UserConfig( props ) {

  const emptyUserValue = {
    username: '',
    name: '',
    lastname: '',
    birthday: '',
    gender: '',
  };

  const [ user, setUser ] = useState(emptyUserValue);
  const [ initialUser, setInitialUser ] = useState(emptyUserValue)
  const [ errors, setErrors ] = useState({});
  const [ modify, setModify ] = useState(false);
  const [ confirmPass, setConfirmPass ] = useState('');
  const [ modalLoading, setModalLoading ] = useState(0);
  const [ loading, setLoading] = useState(0);
  const [ showModal, setShowModal] = useState(false);
  const [ showConfirmationModal, setShowConfirmationModal ] = useState(false);
  const [ photo, setPhoto ] = useState(undefined);
  const [ openCrop, setOpenCrop ] = useState(false);
  const [ photoURL, setPhotoURL ] = useState(null);
  const [ cropping, setCropping ] = useState(0);
  const [ cancelSubscriptionConfirmationModal, setCancelSubscriptionConfirmationModal] = useState({show:false});
  const [ loadingCancelSubscription, setLoadingCancelSubscription ] = useState(0);
  const [ subscriptionInfo, setSubscriptionInfo ] = useState({});

  const inputFileRef = useRef();

  const token = localStorage.getItem('token');

  useEffect(() => {
    getUser();
    if (props.subscriptionType === 'premium') getSubscriptionInfo();
  },[]);

  const getUser = async () => {
    setModalLoading(prev=>prev+1);
    try {
      const res = await axios.get('/api/user/getUser');
      const resUser = res.data;
      setUser(resUser);
      if (resUser.profile_photo) setPhoto(resUser.profile_photo);
      setInitialUser(resUser);
    } catch (error) {
    }
    setModalLoading(prev=>prev-1);
  };

  const getSubscriptionInfo = async () => {
    setModalLoading(prev => prev + 1);
    try {
        const res = await axios.get('../api/subscription/getSubscription');
        const resInfo = res.data;
        res.data.date_created = (new Date(res.data.date_created)).toLocaleDateString('es-AR');
        res.data.last_modified = (new Date(res.data.last_modified)).toLocaleDateString('es-AR');
        setSubscriptionInfo(resInfo);
        console.log(resInfo);
    } catch (error) {console.log(error);}
    setModalLoading(prev => prev - 1);
  }

  const navigate = useNavigate();

  const findFormErrors = () =>{
    const { username, name, lastname, birthday, gender } = user;
    const password = confirmPass;
    const userVal = /^[a-zA-Z0-9]*$/;
    const newErrors = {};

    if (!username || username === '') newErrors.username = 'Por favor ingrese su nombre de usuario.';
    else if (!username.match(userVal)) newErrors.username = 'El nombre de usuario debe contener letras y números únicamente.';
    else if (username.length < 4) newErrors.username = 'Su nombre de usuario debe tener al menos 4 caracteres.';
    else if (username.length > 20) newErrors.username = 'Su nombre de usuario no puede tener más de 20 caracteres.';
    
    if (!name || name === '') newErrors.name = 'Por favor ingrese su nombre.';
    else if (name.length < 2) newErrors.name = 'Su nombre debe tener al menos 2 caracteres.';
    else if (name.length > 50) newErrors.name = 'Su nombre no puede tener más de 50 caracteres.';

    if (!lastname || lastname === '') newErrors.lastname = 'Por favor ingrese su apellido.';
    else if (lastname.length < 2) newErrors.lastname = 'Su apellido debe tener al menos 2 caracteres.';
    else if (lastname.length > 50) newErrors.lastname = 'Su apellido no puede tener más de 50 caracteres.';

    if ( !birthday || birthday === '') newErrors.birthday = 'Por favor ingrese su fecha de nacimiento.';
    else if ( new Date(birthday) > subtractYears(13, new Date())) newErrors.birthday = 'Usted debe tener al menos 13 años.';

    if ( !gender || gender === '') newErrors.gender = 'El género no puede estar vacío.';

    if ( (!password || password === '') && showConfirmationModal) newErrors.password = 'Por favor ingrese su contraseña para continuar.';

    return newErrors;
  };

  const findPasswrodErrors = () => {
    const newErrors = {};
    const password = confirmPass;

    if ( (!password || password === '') && showConfirmationModal) newErrors.password = 'Por favor ingrese su contraseña para continuar.';

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

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handleCancelConfirmationModal = () => setShowConfirmationModal(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newErrors = findPasswrodErrors()
    // Conditional logic:
    if ( Object.keys(newErrors).length > 0 ) {
      // We got errors!
      setErrors(newErrors)
    } else {
      const param = {
        password: confirmPass
      };
      setModalLoading(prev=>prev+1);
      try{
        await axios.post('/api/user/deleteUser', param);
        setShowConfirmationModal(false);
        setConfirmPass('');
        localStorage.removeItem('token');
        window.location.href = '/';
      } catch (error){
        setResponseErrors(error);
      }
      setModalLoading(prev=>prev-1);
    }
  }

  const handleOnChange = event => {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setUser({...user, [name]: value})
    if ( !!errors[name] ) setErrors({...errors, [name]: null});
  }

  const handleChangePassword = event => {
    const value = event.target.value;
    setConfirmPass(value);
    if ( !!errors.password) setErrors({...errors, password: null});
  }

  const toggleModify = () => {
    setModify(!modify);
  };

  const handleReset = () => {
    setUser(initialUser);
    toggleModify();
    setErrors({});
  }

  const handleDelete = () => {
    setShowConfirmationModal(true);
    setErrors({...errors, password: null});
  }
  
  const handleChangeImage = () => {
    if(!modify) return;
    inputFileRef.current.click();
  }

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if(validFilesFormat(file)){
      setPhotoURL(URL.createObjectURL(file));
      setOpenCrop(true)
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
    let mainPhoto = await imageResize(file, 250);
    let smallPhoto = await imageResize(file, 32);
    mainPhoto = await toBase64(mainPhoto);
    smallPhoto = await toBase64(smallPhoto);
    const formData = {
      main_photo: mainPhoto,
      small_photo: smallPhoto
    }
    try{
      await axios.post('/api/photos/uploadProfilePhotoBase64', formData);
    } catch (error){
      setUser(initialUser);
      setResponseErrors(error);
    }
    props.updatePhoto();
    setCropping(prev=>prev-1)
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
      // Set up params object to send it to the API
      const params = {};
      if (user.username !== initialUser.username) params.username = user.username;
      if (user.name !== initialUser.name) params.name = user.name;
      if (user.lastname !== initialUser.lastname) params.lastname = user.lastname;
      if (user.birthday !== initialUser.birthday) params.birthday = user.birthday;
      if (user.gender !== initialUser.gender) params.gender = user.gender;
      if (Object.keys(params). length === 0 ){
        toggleModify();
      } else {
        setLoading(prev=>prev+1);
        try{
          setErrors({});
          const res = await axios.put('/api/user/updateUser', params);
          localStorage.setItem('token', res.data);
          handleShowModal();
          setInitialUser(user);
          setPhoto(setPhoto);
          if (params.username) props.updateUsername(params.username);
          toggleModify();
        } catch ( error ) {
          // setUser(initialUser);
          setResponseErrors(error);
        }
        setLoading(prev=>prev-1);
      }
    }
  };

  const cancelSubscriptionConfirmation = () => {
      setCancelSubscriptionConfirmationModal(prev => ({
          message: `¿Está seguro/a de que quiere cancelar su suscripción a Eventually? Perderá todos sus beneficios.`,
          show: true
        }));
  }

  const handleCancelSubscription = async () => {
      setLoadingCancelSubscription(prev => prev + 1);
      try {
          await axios.post('../api/subscription/cancelSubscription');
          toast.info('¡Suscripción cancelada con éxito!')
      } catch (error) {}
      setLoadingCancelSubscription(prev => prev - 1);
      setCancelSubscriptionConfirmationModal({show: false})
      await delay(2000);
      props.updateUserData();
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function subtractYears(numOfYears, date = new Date()) {
    date.setFullYear(date.getFullYear() - numOfYears);
  
    return date;
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

  return (
    <div className="UserConfig body d-flex flex-column nav-bar-content justify-content-center align-items-center">
      <div className="row justify-content-center" style={{ margin: "2rem 0" }}>
        <h2>Ajustes</h2>
        <div className="top-card">
          <div className={`${props.subscriptionType === 'premium'? 'premium-subscription-img-container img-outline-lg':''}`}>
            <img src={photo? photo : DefaultProfilePhotoDog} alt="profile image"
                className={modify? "card-image-profile modify": "card-image-profile"} onClick={handleChangeImage} />
          </div>
          <input type="file" onChange={onFileChange} ref={inputFileRef} style={{display: "none"}} multiple={false}/>
          <div className="row align-items-center mt-2">
            <div className="card-user flex-column">
              <input type="text" className="user-name" placeholder="@user" maxLength={21} name="username" disabled={!modify} value={user.username} onChange={handleOnChange}/>
              {!modify? <button className="btn btn-modify" onClick={toggleModify}><FontAwesomeIcon icon={faPen} className="icon"/></button> : null}
              <span className="text-danger">{errors.username}</span>
            </div>
          </div>
        </div>
      </div>
      { props.subscriptionType === 'basic'?
        <div className="card premium-subscribe-card align-items-center flex-row justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="premium-label-eventually">Eventually&nbsp;</div>
            <div className="premium-label-premium">Premium</div>
          </div>
          <Link to="/settings/premium">
            <Button>
              Suscribirse
            </Button>
          </Link>
        </div>
      : null}
      <div className="card">
        <Form noValidate onSubmit={handleSubmit}>
          <Accordion defaultActiveKey="0" alwaysOpen>
            <Accordion.Item eventKey="0" >
              <Accordion.Header>Perfil</Accordion.Header>
              <Accordion.Body>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="nombre" isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off" disabled={!modify} value={user.name} onChange={handleOnChange} maxLength={50}/>
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="lastname">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control type="apellido" isInvalid={ !!errors.lastname } placeholder="" name="lastname" disabled={!modify} value={user.lastname} onChange={handleOnChange} maxLength={50}/>
                    <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="birthday">
                    <Form.Label>Fecha de nacimiento</Form.Label>
                    <Form.Control isInvalid={ !!errors.birthday } name="birthday" disabled={!modify} value={user.birthday} type="date" placeholder="Ingresá tu fecha de nacimiento" onChange={handleOnChange}></Form.Control>
                    <Form.Control.Feedback type="invalid">{errors.birthday}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label>Género</Form.Label>
                    <Form.Select isInvalid={ !!errors.gender} name="gender" disabled={!modify} value={user.gender} aria-label="Floating label" onChange={handleOnChange}>
                      <option value=""> Seleccione su género</option>
                      <option value="F">Femenino</option>
                      <option value="M">Masculino</option>
                      <option value="O">Otro</option>
                      <option value="N">Prefiero no decirlo</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                  </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          {modify? <div className="row align-items-center justify-content-end btn-container">
            <Button className="btn btn-restablecer" type="reset" onClick={handleReset}>Cancelar</Button>
            <Button className="btn btn-guardar d-flex" type="submit" disabled={loading}>
              {loading? <div style={{marginRight: '0.2rem'}}><Spinner as="span" animation="border" className="mr-5" size="sm" role="status" aria-hidden="true"/></div>: null}
              Guardar
            </Button>
          </div>: null}
          <span className="text-danger">{errors.modify}</span>
        </Form>
      </div>
      <br/>
      <div className="card mb-4">
        <Accordion  defaultActiveKey={null}>
          <Accordion.Item eventKey="0" className="card-info">
            <Accordion.Header>Gestión de Cuenta</Accordion.Header>
            <Accordion.Body className="px-0">
              <EmailConfig modify={true}/>
              <PasswordConfig modify={true}/>
              <Form noValidate onSubmit={handleSubmit} className="px-3">
                <hr/>
                <Form.Group className="mt-3 d-flex justify-content-between align-items-center" controlId="delete">
                  <Form.Label>Elimina tu cuenta y los datos de la cuenta </Form.Label>
                  <Button className="btn btn-group-sm btn-eliminar" onClick={handleDelete}>Eliminar</Button>
                </Form.Group>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    {props.subscriptionType === 'premium'?
      <div className="card mb-5">
        <Accordion  defaultActiveKey={null}>
          <Accordion.Item eventKey="0" className="card-info">
            <Accordion.Header>Suscripción</Accordion.Header>
            <Accordion.Body className="">
              <span className="text-muted">
                Esta es tu suscripción actual. El período de facturación es mensual.<br/>
                Te suscribiste por primera vez el {subscriptionInfo.date_created}.<br/>
                Fue modificada por última vez el {subscriptionInfo.last_modified}.<br/>
                Podes encontrar más información de tu suscripción desde la <a href="https://www.mercadopago.com.ar/subscriptions" target="_blank">página de MercadoPago</a>.<br/>
                ¡Puedes cambiar tu suscripción cuando quieras!
              </span>
              <div className="premium-cancel-card align-items-center flex-row justify-content-between mb-3 mt-3">
                <div className="d-flex align-items-center">
                  <div className="premium-label-eventually">Eventually&nbsp;</div>
                  <div className="premium-label-premium">Premium</div>
                </div>
                  <Button onClick={cancelSubscriptionConfirmation}>
                    Cancelar
                  </Button>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      :null}
      <InfoModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        message="¡Usuario modificado con éxito!"
        img={SuccessPhoneGirl}
      />
      <ModalPassConfirm 
        showModal={showConfirmationModal} 
        handleCancel={handleCancelConfirmationModal}
        handleConfirm={handleDeleteAccount}
        title={"Eliminar Cuenta"}
        message={"¿Está seguro/a de que desea eliminar su cuenta?"}
        errors={errors.password}
        handleOnChange={handleChangePassword}
      />
      <LoadingModal showModal={modalLoading}/>
    {openCrop ? <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} updateNavBarPhoto={props.updatePhoto} aspect_ratio={1} round={true}/> : null}
    <CroppingModal showModal={cropping}/>
    <YesNoConfirmationModal
          showModal={cancelSubscriptionConfirmationModal.show}
          title="Cancelar suscripción Eventually"
          message={cancelSubscriptionConfirmationModal.message}
          handleCloseModal={()=>setCancelSubscriptionConfirmationModal({show: false})}
          handleConfirm={handleCancelSubscription}
          loading={loadingCancelSubscription}
      />
    </div>
  );
}