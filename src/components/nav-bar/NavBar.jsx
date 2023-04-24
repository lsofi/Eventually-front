import React, { useState, useEffect } from "react";
import axios from "axios";
import './NavBar.css'
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container"
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { NavBarData } from './NavBarData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGear, faArrowRightFromBracket, faSun, faMoon} from '@fortawesome/free-solid-svg-icons';
import NotificationsTab from "./NotificationsTab";

import EventuallySmallLogoDark from "../../resources/images/EventuallySmallLogoDark.png";
import EventuallySmallLogoLight from "../../resources/images/EventuallySmallLogoLight.png";
import DefaultProfilePhotoDog from "../../resources/images/DefaultProfilePhotoDog.png";
//TODO Add links for side bar buttons.

export default function NavBar( props ) {

    const onLoadMode = localStorage.getItem('darkMode');

    const [sidebar, setSidebar] = useState(false);
    const [ darkMode, setDarkMode] = useState(onLoadMode === 'true'? true : false);
    const [activeLink, setActiveLink] = useState();

    const location = useLocation();

    useEffect(()=> {
        const link = location.pathname.split('/')[1];
        setActiveLink(`/${link}`);
        console.log(props.subscriptionType);
    }, [location])

    const navigate = useNavigate();

    const showSidebar = () => {
        setSidebar(!sidebar);
    }

    const toggleDarkMode = () => {
        const isDarkMode = !darkMode;
        localStorage.setItem('darkMode', isDarkMode)
        setDarkMode(isDarkMode);
        document.body.classList.toggle('dark');
    }


    return (
        <div className="d-flex side-bar-container">
            <FontAwesomeIcon className="menu-bars" icon={faBars} style={{color:"var(--text-title)", zIndex:'1001', position: 'fixed'}} onClick={()=>(showSidebar())}/>
            <div className='top-nav d-flex justify-content-end' style={{position: "fixed", zIndex: '1000'}}>
                <Link to="/home" className="no-decorations w-100">
                    <div className="d-flex justify-content-center align-items-center flex-grow-1 pointer h-100">
                        <img className="img-top-nav" src={darkMode? EventuallySmallLogoDark : EventuallySmallLogoLight}></img>
                    </div>
                </Link>
                <NotificationsTab/>
                <Form className="d-flex align-items-center">
                    <Form.Group controlId="dark-mode-toggle" className="d-flex align-items-center gap-2 btn-theme-toggle">
                        <label htmlFor="dark-mode-toggle"><FontAwesomeIcon icon={faSun}/></label>
                        <Form.Check type="switch" id="dark-mode-toggle" style={{fontSize: '1.5rem'}} checked={darkMode} onChange={toggleDarkMode}/>
                        <label htmlFor="dark-mode-toggle" style={{marginLeft: "-0.8rem"}}><FontAwesomeIcon icon={faMoon}/></label>
                    </Form.Group>
                </Form>
            </div>
            <div className={sidebar?"Sidebar d-flex flex-column active": "Sidebar flex-column d-flex"} style={{zIndex: '1000'}}>
                <div className="user pointer">
                    <Link to="/settings" className="no-decorations">
                        <Row className="photo">
                            <div className={`${props.subscriptionType === 'premium'? 'premium-subscription-img-container':''}`}>
                                <img src={props.userPhoto? props.userPhoto : DefaultProfilePhotoDog} className={`img-usuario`}></img>
                            </div>
                        </Row>
                        <Row className="user-name text-center mt-1">
                            <h6>@{props.userName}</h6>
                        </Row>
                    </Link>
                </div>
                <br/>
                <div className="d-flex justify-content-between" style={{flexDirection: 'column', flexGrow: '1'}}>
                    <nav>
                        <ul className="side-bar-list" onClick={()=>showSidebar()}>
                            {NavBarData.map((val, key) => {
                                return(
                                    <Link to={val.link} key={key} className="no-decorations">
                                        <li className={activeLink == val.link? "row active": "row"}>
                                            <div id="icon">
                                                {val.icon}
                                            </div>
                                            <div id="title">
                                                {val.title}
                                            </div>
                                        </li>
                                    </Link>
                                );
                            })}
                        </ul>
                    </nav>
                    <div>
                        <hr/>
                        <ul className="side-bar-list" onClick={()=>showSidebar()}>
                            <Link to="/settings" className="no-decorations">
                                <li className={activeLink == "/settings"? "row active": "row"}>
                                    <div id="icon"><FontAwesomeIcon id="icon" icon={faGear} /></div>
                                    <div id="title">Ajustes</div>
                                </li>
                            </Link>
                            <li className="row" onClick={()=>props.handleLogOut()}>
                                <div id="title" style={{textAlign: 'right'}}>Cerrar Sesión</div>
                                <div id="icon" style={{justifyContent: 'left'}}><FontAwesomeIcon icon={faArrowRightFromBracket} /></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Components within NavBar should always have the nav-bar-content className */}
            <Outlet></Outlet>
        </div>
    );
}

