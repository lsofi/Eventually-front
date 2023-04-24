import React, { Component, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import { Navbar, Nav,  NavDropdown } from "react-bootstrap";
import Carousel from 'react-bootstrap/Carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlassCheers, faUsers, faTasks, faComments, faFileInvoiceDollar, faHandHoldingHeart, faSyncAlt, faCar, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import emailjs from '@emailjs/browser';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../../components/Alert';

import EventuallySmallLogoDark from "../../resources/images/EventuallySmallLogoDark.png";
import EventuallySmallLogoLight from "../../resources/images/EventuallySmallLogoLight.png";
import BirthdayPartyDogs from "../../resources/images/BirthdayPartyDogs.jpg";
import CallendarCanvan from "../../resources/images/CallendarCanvan.png";
import Crossroads from "../../resources/images/Crossroads.png"
import AgustinMaubecin from "../../resources/images/AgustinMaubecin.jpg";
import CamilaBermejo from "../../resources/images/CamilaBermejo.jpg";
import GastonMunoz from "../../resources/images/GastonMunoz.jpg";
import JoaquinCostamagna from "../../resources/images/JoaquinCostamagna.jpg";
import LaraParrucci from "../../resources/images/LaraParrucci.jpg";
import SofiaJuarez from "../../resources/images/SofiaJuarez.jpg";
import EventManagerPhoneCall from "../../resources/images/EventManagerPhoneCall.png";
import GuestBenefits from "../../resources/images/GuestBenefits.png"
import ProviderBenefits from "../../resources/images/ProviderBenefits.png"

function LandingPage() {

  const onLoadMode = localStorage.getItem('darkMode');
  
  const [ showEmailAlert, setShowEmailAlert ] = useState(false);
  const [ modalMessage, setModalMesage ] = useState('');
  const [ success, setSuccess] = useState(true);
  const [ darkMode, setDarkMode] = useState(onLoadMode === 'true'? true : false);

  const toggleDarkMode = () => {
    const isDarkMode = !darkMode;
    localStorage.setItem('darkMode', isDarkMode)
    setDarkMode(isDarkMode);
    document.body.classList.toggle('dark');
  }

  const featuresList = [
    {
      icono: <FontAwesomeIcon icon={faGlassCheers}/>,
      titulo: "Gestión de Eventos",
      descripcion: "Creación y administración a nivel general de un evento, permitiendo la edición y visualización por listado, de distintos eventos del usuario o eventos públicos, entre otros.",
    },
    {
      icono: <FontAwesomeIcon icon={faUsers}/>,
      titulo: "Gestión de Invitados",
      descripcion: "Generación y envío de invitaciones, la toma de asistencia, considerada tanto para eventos privados como eventos públicos.",
    },
    {
      icono: <FontAwesomeIcon icon={faTasks}/>,
      titulo: "Gestión de Tareas",
      descripcion: "Gestión de las actividades del evento, como así también la gestión de un cronograma, que permita administrar el timing de las actividades antes, durante y después del evento.",
    },
    {
      icono: <FontAwesomeIcon icon={faComments}/>,
      titulo: "Gestión de Chats",
      descripcion: "Permite la comunicación entre organizadores, proveedores de servicios, e invitados del evento.",
    },
    {
      icono: <FontAwesomeIcon icon={faFileInvoiceDollar}/>,
      titulo: "Gestión de Gastos",
      descripcion: "Permite la subscripción a distintas listas de gastos por parte de los invitados u organizadores al evento, realizándose detalle de los gastos, como también la división de los mismos.",
    },
    {
      icono: <FontAwesomeIcon icon={faHandHoldingHeart}/>,
      titulo: "Gestión de Servicios",
      descripcion: "Permite la gestión de los proveedores de servicio de un evento, contemplando la búsqueda de los mismos como también la posible comunicación para el contacto y contratación.",
    },
    {
      icono: <FontAwesomeIcon icon={faSyncAlt}/>,
      titulo: "Gestión de Retroalimentación",
      descripcion: "Se gestionan encuestas a los participantes e invitados del evento para tener una retroalimentación y se hagan revisiones respecto al evento.",
    },
    {
      icono: <FontAwesomeIcon icon={faCar}/>,
      titulo: "Gestión de Car pooling",
      descripcion: "Se permite la coordinación de medios de transporte para la llegada/salida del evento.",
    },
  ]

  const benefitsList = [
    {
      imgLink: EventManagerPhoneCall,
      titulo: 'Para el Organizador',
      descripcion: 'Facilita crear y organizar eventos, y comunicarse con sus participantes.',
    },
    {
      imgLink: GuestBenefits,
      titulo: 'Para el Invitado',
      descripcion: 'Permite el acceso rápido a la información de eventos y comunicarse con otros invitados y organizadores.',
    },
    {
      imgLink: ProviderBenefits,
      titulo: 'Para el Proveedor',
      descripcion: 'Permite la difusión de su prestación de servicios y brinda la oportunidad de comunicarse y colaborar con los organizadores en tiempo real.',
    },
  ]

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,

    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          initialSlide: 2,
          infinite: true
        }
      },
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          infinite: true
        }
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true
        }
      }
    ]
  };

  const formContact = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_a2az7ru', 'template_9zseheo', formContact.current, 'PsOhAcBtpxJPHGOkZ')
      .then(() => {
          setSuccess(true);
          setModalMesage('Se envió el correo con éxito!')
          setShowEmailAlert(true);
      }, (error) => {
        setSuccess(false);
        setModalMesage('Hubo un error, intentelo más tarde...')
        setShowEmailAlert(true);
      });
    e.target.reset();
  };

  return (
    <div id="home" className="LandingPage">
      <div>
        <Navbar className="top-nav-l d-flex align-items-center" variant={darkMode? 'dark' : 'light'} collapseOnSelect expand="xl">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Brand className="nav-logo" href="#home"><img src={darkMode? EventuallySmallLogoDark : EventuallySmallLogoLight}></img></Navbar.Brand>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="nav-link-container">
              <Nav.Link className="nav-links" href="#whatWeDo">¿Qué hacemos?</Nav.Link>
              <Nav.Link className="nav-links" href="#AboutUs">Más sobre nosotros</Nav.Link>
              <Nav.Link className="nav-links" href="#WhyEventually">¿Por qué Eventually?</Nav.Link>
              <Nav.Link className="nav-links" href="#ContactUs">Contactanos</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Brand className="d-flex flex-row navbar-brand-btn" style={{ gap: "0.5rem" }}>
            <Form className="d-flex align-items-center">
              <Form.Group controlId="dark-mode-toggle" className="d-flex align-items-center gap-2 btn-theme-toggle">
                  <label htmlFor="dark-mode-toggle"><FontAwesomeIcon icon={faSun}/></label>
                  <Form.Check type="switch" id="dark-mode-toggle" style={{fontSize: '1.5rem'}} checked={darkMode} onChange={toggleDarkMode}/>
                  <label htmlFor="dark-mode-toggle" style={{marginLeft: "-0.8rem"}}><FontAwesomeIcon icon={faMoon}/></label>
              </Form.Group>
            </Form> 
            <div className="d-flex gap-2">
              <Link to="/login">
                <button className="btn btn-orange">Iniciar Sesión</button>
              </Link>
              <Link to="/signup">
                <button className="btn btn-white">Registrarse</button>
              </Link>
            </div>
          </Navbar.Brand>
        </Navbar>
      </div>
      <div className="landing-body">
        <div className="home-div">
          <div className="div-title">
            <h1 className="bold">ORGANIZÁ</h1>
            <h1 className="bold">EL EVENTO</h1>
            <h1 className="bold">DE TUS SUEÑOS</h1>
          </div>
          <div className="div-img">
            <img src={BirthdayPartyDogs}></img>
          </div>
          <div className="div-btn">
            <Link to="/login">
              <button className="btn btn-orange btn-h">Iniciar Sesión</button>
            </Link>
            <Link to="/signup">
              <button className="btn btn-gray btn-h">Registrarse</button>
            </Link>
          </div>
        </div>
        <div id="whatWeDo" className="do-div">
          <div className="header-sub-div1">
            <h6 className="title">¿QUÉ HACEMOS?</h6>
            <h1 className="subtitle">Ofrecemos</h1>
            <p>Somos una página web que permite organizar eventos, públicos y privados, 
              como reuniones sociales, fiestas y eventos comerciales.</p>
          </div>
          <div className="body-sub-div1">
            <div className="needs">
              <img src={Crossroads}></img>
              <h6>Una guía para principiantes</h6>
              <p>Presenta una forma de gestionar eventos, simple y guiada, para aquellas personas que no tienen experiencia.</p>
            </div>
            <div className="needs">
              <img src={EventManagerPhoneCall}></img>
              <h6>Una solución integral para expertos</h6>
              <p>Satisface todas las necesidades de gestión de eventos en un solo lugar.</p>
            </div>
            <div className="needs">
              <img src={CallendarCanvan}></img>
              <h6>Una ayuda para la formalización</h6>
              <p>Permite una comunicación clara sobre las tareas básicas de la gestión de un evento.</p>
            </div>
          </div>
        </div>
        <div id="AboutUs" className="about-div">
          <div className="header-sub-div2">
            <h6 className="title">MÁS SOBRE NOSOTROS</h6>
            <h1 className="subtitle">Features</h1>
          </div>
          <div className="body-sub-div2">
            <Slider {...settings}>
              {featuresList.map((feature, key) => (
                <div key={key}>
                  <div className="features">
                    <div className="features-top">
                      <div className="features-icon">{feature.icono}</div>
                      <h5>{feature.titulo}</h5>
                    </div>
                    <div className="features-bottom">
                      <p>{feature.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div id="WhyEventually" className="why-div">
          <div className="header-sub-div2">
            <h6 className="title">¿POR QUÉ EVENTUALLY?</h6>
            <h1 className="subtitle">Beneficios</h1>
          </div>
          <div className="body-sub-div3">
            <Carousel>
              {benefitsList.map((benefit, key) => (
                <Carousel.Item key={key}>
                  <div className="benefits">
                    <img src={benefit.imgLink}></img>
                    <div className="benefits-text">
                      <h5>{benefit.titulo}</h5>
                      <p>{benefit.descripcion}</p>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        </div>
        {/* <div id="WhyEventually" className="why-div">
          <div className="header-sub-div2">
            <h6 className="title">AGRADECIMIENTOS</h6>
            <h1 className="subtitle">Personas importantes</h1>
            <p></p>
          </div>
        </div> */}
        <div id="ContactUs" className="">
          <div className="header-sub-div2">
            <h6 className="title">CONTACTANOS</h6>
            <h1 className="subtitle">Sobre Nosotros</h1>
          </div>
          <div className="body-sub-div4">
            <div className="body-sub-div4-top">
              <div className="us-rows">
                <div className="us">
                  <img src={CamilaBermejo}/>
                  <p>Camila Bermejo</p>
                </div>
                <div className="us">
                  <img src={JoaquinCostamagna}/>
                  <p>Joaquín Costamagna</p>
                </div>
                <div className="us">
                  <img src={SofiaJuarez}/>
                  <p>Sofía Juaréz</p>
                </div>
              </div>
              <div className="us-rows">
                <div className="us">
                  <img src={AgustinMaubecin}/>
                  <p>Agustín Maubecin</p>
                </div>
                <div className="us">
                  <img src={GastonMunoz}/>
                  <p>Gastón Muñoz</p>
                </div>
                <div className="us">
                  <img src={LaraParrucci}/>
                  <p>Lara Parrucci</p>
                </div>
              </div>
            </div>
            <div className="body-sub-div4-bottom">
              <Form ref={formContact} onSubmit={sendEmail}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="name" placeholder="nombre y apellido" name="user_name"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="name@example.com" name="user_email"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Mensaje </Form.Label>
                  <Form.Control as="textarea" rows={6} placeholder="Escriba su sugerencia, comentario o pregunta aquí, a la brevedad estaremos en contacto..." name="message"/>
                </Form.Group>
                <div className="btn-form-contact">
                  <Button variant="btn btn-orange" type="submit">
                    Enviar mensaje
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <img src={darkMode? EventuallySmallLogoDark : EventuallySmallLogoLight}/>
        <p>&copy; Eventually, {new Date().getFullYear()}. All rights reserved.</p>
        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Politica de privacidad</a>
      </footer>
      <Snackbar open={showEmailAlert} onClose={()=>{setShowEmailAlert(false)}} anchorOrigin={{vertical: "top", horizontal: "right"}}>
        <Alert onClose={()=>{setShowEmailAlert(false)}} severity={success?'success':'error'} sx={{ width: '100%' }}>
        {modalMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default LandingPage;