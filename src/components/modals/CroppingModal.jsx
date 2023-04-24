import React from 'react';
import Modal from 'react-bootstrap/Modal';

import EventuallyLoadingDark from '../../resources/images/EventuallyLoadingDark.gif';
import EventuallyLoadingLight from '../../resources/images/EventuallyLoadingLight.gif';

export default function CroppingModal( props ){

    const darkMode = document.body.classList.contains('dark');

    return (
        <Modal show={props.showModal} style={{zIndex: '999999'}}>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {darkMode? 
                    <img src={EventuallyLoadingDark} style={{width: '75%', marginBottom: "-2rem"}}/>
                :
                    <img src={EventuallyLoadingLight} style={{width: '75%', marginBottom: "-2rem"}}/>
                }
                <h5 className="text-center mt-3">Recortando Imagen...</h5>
            </Modal.Body>
        </Modal>
    );
}