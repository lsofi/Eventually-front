import React, {useEffect, useRef} from 'react';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Popover from 'react-bootstrap/Popover';

export default function BasicInfoCard(props) {

    const helpText = 'En esta tarjeta podrás definir la información básica del evento.';
    const textArea = useRef();

    useEffect(()=> {
        autoGrow(textArea);
    }, [props.event.description])

    const autoGrow = () => {
        textArea.current.style.height = "5px";
        textArea.current.style.height = (textArea.current.scrollHeight +10)+"px";
    }

    return (
        <div className="info-card" style={{gridRow: 'span 2'}}>
            <div className='d-flex gap-3 align-items-center'>
                <h4 className="mb-0">Información básica</h4>
                {!props.register?
                    <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                        <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                    </OverlayTrigger> 
                : null}
            </div>
            <hr className="mx-0 my-1" style={{height: '2px'}}/>
            <form >
                <Form.Group className="mb-1" controlId="title">
                    <Form.Label className='mb-1'>Título {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Control type="title" isInvalid={ !!props.errors.title } placeholder="" maxLength={50} name="title" value={props.event.title} disabled={!props.modify} onChange={props.handleOnChange}/>
                    <Form.Control.Feedback type="invalid">{props.errors.title}</Form.Control.Feedback>
                </Form.Group>
                {props.modify || props.event.start_date?
                <Row className="d-flex align-items-start">
                    <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="start_date">
                            <Form.Label className='mb-1'>Fecha de inicio  {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                            <Form.Control name="start_date" isInvalid={ !!props.errors.start_date } value={props.event.start_date} type="date" placeholder="Ingresá la fecha de inicio" disabled={!props.modify} onChange={props.handleOnChange}/>
                            <Form.Control.Feedback type="invalid">{props.errors.start_date}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="start_time">
                            <Form.Label className='mb-1'>Hora de inicio {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                            <Form.Control name="start_time" isInvalid={ !!props.errors.start_time} value={props.event.start_time} type="time" placeholder="Ingresá la hora inicio" disabled={!props.modify} onChange={props.handleOnChange}></Form.Control>
                            <Form.Control.Feedback type="invalid">{props.errors.start_time}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row> : <h3 className="my-2 text-tertiary">Todavía no hay fecha definida</h3>}
                {props.modify || props.event.end_date?
                <Row className="d-flex align-items-start">
                    <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="end_date">
                            <Form.Label className='mb-1'>Fecha de fin</Form.Label>
                            <Form.Control name="end_date" isInvalid={ !!props.errors.end_date } value={props.event.end_date? props.event.end_date: ''}  type="date" placeholder="Ingresá la fecha de fin" disabled={!props.modify} onChange={props.handleOnChange}></Form.Control>
                            <Form.Control.Feedback type="invalid">{props.errors.end_date}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="end_time">
                            <Form.Label className='mb-1'>Hora de fin</Form.Label>
                            <Form.Control name="end_time" isInvalid={ !!props.errors.end_time} value={props.event.end_time? props.event.end_time: ''}  type="time" placeholder="Ingresá la hora de fin" disabled={!props.modify} onChange={props.handleOnChange}></Form.Control>
                            <Form.Control.Feedback type="invalid">{props.errors.end_time}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row> :null }
                <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                    <Form.Label className='mb-1'>Descripción {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Control as="textarea" ref={textArea} isInvalid={ !!props.errors.description} placeholder="" name="description" disabled={!props.modify} 
                        value={props.event.description} maxLength={500} onChange={(e)=>{props.handleOnChange(e)}} style={{resize: 'none'}}/>
                        {props.changedBasic || props.register? <Form.Text className="text-end">{props.event.description? props.event.description.length: 0} de 500</Form.Text> : null}
                    <Form.Control.Feedback type="invalid">{props.errors.description}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-1" controlId="privacidadEvento">
                    <Form.Label className='mb-1'>Privacidad {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Select name="is_private" isInvalid={props.errors.type? !!props.errors.type.is_private: false} disabled={!props.register}
                        value={props.event.type? props.event.type.is_private : ''} onChange={(e)=>props.handleOnChangeField('type', e)}>
                        <option value={''}> Elegí la privacidad del evento...</option>
                        <option value={true}>Privado</option>
                        <option value={false}>Público</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{props.errors.type? props.errors.type.is_private : null}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-1" controlId="tipoEvento">
                    <Form.Label className='mb-1'>Tipo de evento {props.changedBasic || props.register?<span className="text-tertiary">*</span>:null}</Form.Label>
                    <Form.Select name="name" autoComplete="off" isInvalid={props.errors.type? !!props.errors.type.name: false} disabled={!props.modify}
                        value={props.event.type? props.event.type.name : ''} onChange={(e)=>props.handleOnChangeField('type', e)}>
                        <option value={''}>Elegí el tipo del evento...</option>
                        {props.types && props.types.length?
                            props.types.map((type, key)=>(
                                <option key={key} value={type.name}>{type.name}</option>
                            ))
                            : null
                        }
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{props.errors.type? props.errors.type.name : null}</Form.Control.Feedback>
                </Form.Group>
            </form>
            {props.changedBasic? 
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