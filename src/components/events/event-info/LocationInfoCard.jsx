import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LocationForm from '../../LocationForm';

export default function LocationInfoCard (props) {
    
    const helpText = 'En esta tarjeta podrás definir una ubicación física del evento.';

    return (
        <div className="info-card">
            <div className='d-flex gap-3 align-items-center'>
                <div className="d-flex gap-3 align-items-center">
                    <h4 className="mb-0">Ubicación</h4>
                    <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                        <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                    </OverlayTrigger>
                </div>
                {props.event.location && props.changedAddress? <CloseButton onClick={()=>props.handleOnRemove('address')}/>: null}
            </div>
            <hr className="mx-0 my-1" style={{height: '2px'}}/>
            <LocationForm address={props.event.address} errors={props.errors.address} handleOnChange={(e)=>props.handleOnChange('address', e)} modify={props.modify} handleSetAddress={props.handleSetAddress} changedAddress={props.changedAddress}/>
            {props.changedAddress? 
            <div>
                <hr className="mb-2" style={{height: '2px'}}/>
                <div className="d-flex justify-content-end gap-2">
                    <Button className="btn-secondary-modal px-3" onClick={props.handleReset}>
                        Cancelar
                    </Button>
                    <Button className="btn-primary-modal px-3" onClick={props.handleOnSubmit}>
                        Confirmar
                    </Button>
                </div>
            </div>: null}
        </div>
    );
} 