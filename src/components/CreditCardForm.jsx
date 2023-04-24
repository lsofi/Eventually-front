import React, { useEffect, useState } from "react";
import Card from "react-credit-cards";
import "react-credit-cards/es/styles-compiled.css";
import { useMercadopago } from 'react-sdk-mercadopago';
import { range } from "../shared/shared-methods.util";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const INITIAL_STATE = {
    cvc: "",
    cardExpirationMonth: "",
    cardExpirationYear: "",
    focus: "cardNumber",
    cardholderName: "",
    cardNumber: "",
    issuer: "",
};

export default function CreditCardForm( props ) {
    const [state, setState] = useState(INITIAL_STATE);
    
    const mercadopago = useMercadopago.v2('TEST-c3333699-054a-48dd-a90b-97845b100a5a', { locale: 'es-MX'});

    const generateYearsArray = (amount) => {
        const currentYear = new Date().getFullYear();
        return range(currentYear, currentYear + amount, 1);
    }

    const yearsArray = generateYearsArray(15);

    const handleInputChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        if (['cardNumber', 'cvc'].includes(name) && isNaN(value)) return;
        if (name === 'cvc' && value.length > 3 ||
            name === 'cardNumber' && value.length > 16) return;

        setState({
            ...state,
            [e.target.dataset.name || e.target.name]: e.target.value,
        });
    };

    const handleInputFocus = (e) => {
        setState({ ...state, focus: e.target.dataset.name || e.target.name });
    };

    const handleHide = () => {
        setState(INITIAL_STATE);
        props.handleCloseModal();
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const card = {
                cardNumber: state.cardNumber,
                cardExpirationMonth: state.cardExpirationMonth,
                cardExpirationYear: state.cardExpirationYear,
                securityCode: state.cvc,
            };
            const cardToken = await mercadopago.createToken(card);
            const response = await fetch('/subscriptions/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                price: parseFloat(price),
                card_token: cardToken.id,
                email: email,
            }),
            });
            const result = await response.json();
            if (result.success) {
            // Aquí podrías mostrar un mensaje de éxito al usuario
            } else {
            setErrorMessage(result.message);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Ocurrió un error al procesar el pago.');
        }

        setIsLoading(false);
        };

    const fakeSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <Modal show={props.showModal} onHide={handleHide} centered>
            <Modal.Body>
                <Card
                    cvc={state.cvc}
                    expiry={state.cardExpirationMonth + state.cardExpirationYear}
                    name={state.cardholderName}
                    number={state.cardNumber}
                    focused={state.focus}
                    brand={state.issuer}
                />
                <Form onSubmit={fakeSubmit} className="mt-3">
                    <Row>
                        <Form.Group>
                            <Form.Label>Número de tarjeta</Form.Label>
                            <Form.Control name="cardNumber" value={state.cardNumber} onChange={handleInputChange} onFocus={handleInputFocus}/>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group>
                            <Form.Label>Nombre <span className="text-muted">(Como está en la tarjeta)</span></Form.Label>
                            <Form.Control name="cardholderName" value={state.cardholderName.toUpperCase()} onChange={handleInputChange} onFocus={handleInputFocus}/>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Col md={7}>
                            <Form.Label>Fecha de expiración</Form.Label>
                            <div className="d-flex gap-1">
                                <Form.Group className="flex-grow-1">
                                    <Form.Select name="cardExpirationMonth" placeholder="Mes" value={state.cardExpirationMonth} onChange={handleInputChange} onFocus={handleInputFocus}>
                                        { ['01','02','03','04','05','06','07','08','09','10','11','12'].map(month => (
                                            <option value={month}>{month}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                    <Form.Select name="cardExpirationYear" placeholder="Año" value={state.cardExpirationYear} onChange={handleInputChange} onFocus={handleInputFocus}>
                                        { yearsArray.map(year => (
                                            <option value={year}>{year}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Col>
                        <Col md={5}>
                            <Form.Group>
                                <Form.Label>Código de seguridad</Form.Label>
                                <Form.Control name="cvc" value={state.cvc} onChange={handleInputChange} onFocus={handleInputFocus}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-3 mb-1">
                        <Col className="d-flex">
                            <Button className="w-100 ">PAGAR</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}