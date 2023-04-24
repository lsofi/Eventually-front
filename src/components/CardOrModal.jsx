import React, { Children } from 'react'
import Modal from 'react-bootstrap/Modal'

export default function CardOrModal( props ) {
    return (
        <>
            <div className={props.show? 'hidden' : ''}>
                {props.children}
            </div>
            <Modal show={props.show} onHide={props.onHide} fullscreen={'md-down'} size="xl">
                <Modal.Body>
                    {props.children}
                </Modal.Body>
            </Modal>
        </>

    )
}
