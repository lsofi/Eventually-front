import React, {useState, useEffect} from 'react';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Accordion from 'react-bootstrap/Accordion';
import CloseButton from "react-bootstrap/CloseButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function TotalExpensesReviewModal( props ) {

    if (!props.expenseReview || !props.expenses) return;

    const round = (number) => { return Math.round(number*100) / 100}

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} className='Modal' size="xl">
            <Modal.Header>
                <Modal.Title>Resumen total de gastos</Modal.Title>
                <CloseButton onClick={props.handleCloseModal}></CloseButton>
            </Modal.Header>
            <Modal.Body>
                {/* EXPENSES DATA */}
                <div className="d-flex flex-column mx-4">
                    <h4>Resumen</h4>
                    <hr className="mt-0"/>
                    <table className="column-separator">
                        <thead>
                            <tr style={{fontSize: "1.2rem"}}>
                                <th className="th-lg">Gasto</th>
                                <th className="text-center th-sm">Suscriptores</th>
                                <th className="text-center th-sm">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.expenses.map((expense, key)=>{
                                return(
                                    <tr key={key}>
                                        <td className="">{expense.name}</td>
                                        <td className="text-center">{expense.subscribers? expense.subscribers.length : 0}</td>
                                        <td className="text-center bold">${round(expense.amount)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="d-flex mx-4 mt-4" style={{color: "var(--text-paragraph)"}}>
                    <div className="flex-grow-0"><h4>Se gastó en total</h4></div>
                    <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "0.7rem 5px"}}></div>
                    <div className="flex-grow-0"><h4>${round(props.expenseReview.total)}</h4></div>
                </div>
                {/* TRANSACTIONS DATA */}
                {props.expenseReview.transactions?
                    <div className="mt-4 mx-4">
                        <h4>Transacciones</h4>
                        <hr className="mt-0"/>
                        <div className="d-flex flex-column gap-1" style={{maxHeight: "30rem", overflowY: "auto"}}>
                            {props.expenseReview.transactions.map((transaction, key)=>{
                                return(
                                    <Card key={key} className='m-1'>
                                        <Card.Body>
                                            <Row>
                                                <Col lg={4} className="">
                                                    <span className="text-tertiary">Origen</span>
                                                    <h5>@{transaction.origin.username}</h5>
                                                </Col>
                                                <Col lg={4} className="">
                                                    <span className="text-tertiary">Destino</span>
                                                    <h5>@{transaction.recipient.username}</h5>
                                                </Col>
                                                <Col lg={2} className="text-center-large border-left-large">
                                                    <span className="text-tertiary">Cantidad</span>
                                                    <h5>${round(transaction.amount)}</h5>
                                                </Col>
                                                <Col lg={2} className="d-flex align-items-center justify-content-center border-left-large">
                                                    <Badge pill bg={transaction.complete? "success": "danger"} text="white">{transaction.complete? "Completada": "Incompleta"}</Badge>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                : null}
            </Modal.Body>
        </Modal>
    )
}