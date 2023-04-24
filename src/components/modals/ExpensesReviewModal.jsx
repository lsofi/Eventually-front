import React, {useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Accordion from 'react-bootstrap/Accordion';
import CloseButton from "react-bootstrap/CloseButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getMyUserId } from '../../shared/shared-methods.util';
import { toast } from "react-toastify";
import LoadingModal from './LoadingModal';
import axios from 'axios';

import DefaultProfilePhotoDog from "../../resources/images/DefaultProfilePhotoDog.png";

export default function ExpensesReviewModal( props ) {
    
    if(!props.expenseReview) return;
    
    const [ debtList, setDebtList ] = useState([]);
    const [ owedList, setOwedList ] = useState([]);
    const [ loading, setLoading ] = useState(0);
    
    const user_id = getMyUserId();
    
    useEffect(() => {
        if(!props.showModal) return;
        getExpensesReview();
    },[props.showModal, props.expenseReview]);

    const getExpensesReview = async () => {
        try{
            console.log(props.expenseReview);
            setDebtList(props.expenseReview.transactions.filter(transaction => {return transaction.origin.user_id === user_id}))
            setOwedList(props.expenseReview.transactions.filter(transaction => {return transaction.recipient.user_id === user_id}))
        } catch (error) {
            
        }
    }

    const getTotalDebt = () => {
        if(!props.expenseReview.transactions) return 0; 
        const debt = debtList.reduce((accum, transaction) => {
            if(transaction.origin.user_id === user_id && !transaction.complete) return accum + Number(transaction.amount);
            else return accum;
        },0);

        return Math.round(debt * 100) /100;
    }

    const getTotalOwed = () => {
        if(!props.expenseReview.transactions) return 0; 
        const owed = owedList.reduce((accum, transaction) => {
            if(transaction.recipient.user_id === user_id && !transaction.complete) return accum + Number(transaction.amount);
            else return accum;
        },0);

        return Math.round(owed * 100) /100;
    }

    const getBalanceMessage = () => {
        if (props.expenseReview.balance < 0) return "¿Cuánto debo pagar?";
        if (props.expenseReview.balance > 0) return "¿Cuánto me deben pagar?";
    }

    const round = (number) => { return Math.round(number*100) / 100}

    const handleCompleteTransaction = async (transaction) => {
        if (!transaction || !transaction.transaction_id) {
            toast.error('Ha ocurrido un error, intenta dividir los gastos nuevamente y vuelve a intentarlo.');
            return;
        }
        if (transaction.complete) return;
        props.setModalLoading(prev => prev + 1);
        const params = {
            event_id: props.event_id,
            transaction_id: transaction.transaction_id
        }
        try {
            await axios.post('../api/expense/completeTransaction', params);
            await props.getExpensesSummary();
        } catch (error) {}
        props.setModalLoading(prev => prev - 1);
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} className='Modal'>
            <Modal.Header>
                <Modal.Title>Resumen de gastos</Modal.Title>
                <CloseButton onClick={props.handleCloseModal}></CloseButton>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex mx-3" style={{color: "var(--text-paragraph)"}}>
                    <div className="flex-grow-0 bold">¿Cuánto tengo que pagar?</div>
                    <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "1rem 5px"}}></div>
                    <div className="flex-grow-0 bold">${round(props.expenseReview.debt)}</div>
                </div>
                <div className="d-flex mx-3" style={{color: "var(--text-paragraph)"}}>
                    <div className="flex-grow-0 bold">¿Cuánto pagué?</div>
                    <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "1rem 5px"}}></div>
                    <div className="flex-grow-0 bold">${round(props.expenseReview.amountSpent)}</div>
                </div>
                {/* {props.expenseReview.balance !== 0? <div className="d-flex mx-3" style={{color: "var(--text-paragraph)"}}>
                    <div className="flex-grow-0">{getBalanceMessage()}</div>
                    <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "1rem 5px"}}></div>
                    <div className="flex-grow-0 bold">${round(Math.abs(props.expenseReview.balance))}</div>
                </div>: null} */}
                {debtList.length?<Accordion className="mt-3">
                    <Accordion.Item className="card-info">
                        <Accordion.Header>Debes</Accordion.Header>
                        <Accordion.Body>
                            {props.expenseReview.transactions?
                                debtList.map((transaction, key) => {
                                    return(
                                        <Card key={key} className='m-1 participant-info'>
                                            <Card.Body style={{borderRadius: "0.5rem"}}>
                                                <Row>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                        <img src={transaction.recipient.small_photo? transaction.recipient.small_photo : DefaultProfilePhotoDog} className="organizer-photo"></img>
                                                    </Col>
                                                    <Col className='col-participant flex-grow-1'>
                                                        <h6 className='m-0'>{transaction.recipient.username}</h6>
                                                        <span>{transaction.recipient.name + ' ' + transaction.recipient.lastname}</span>
                                                    </Col>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0 mx-3'>
                                                        {transaction.complete? 
                                                            <Badge pill bg={"success"} text={"white"}>Completado</Badge>
                                                            : null}
                                                    </Col>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0 mx-3'>
                                                        ${round(transaction.amount)}
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    );
                                }): null}
                            <hr className='m-0'/>
                            <div className="d-flex mx-3" style={{color: "var(--text-paragraph)"}}>
                                <div className="flex-grow-0 bold">Total</div>
                                <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "1rem 5px"}}></div>
                                <div className="flex-grow-0 bold">${getTotalDebt()}</div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>:null}
                {owedList.length? <Accordion className="mt-3">
                    <Accordion.Item>
                        <Accordion.Header>Te deben</Accordion.Header>
                        <Accordion.Body>
                            {props.expenseReview.transactions?
                                owedList.map((transaction, key) => {
                                    return(
                                        <Card key={key} className='m-1 participant-info'>
                                            <Card.Body style={{borderRadius: "0.5rem"}}>
                                                <Row>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                        <img src={transaction.origin.small_photo? transaction.origin.small_photo : DefaultProfilePhotoDog} className="organizer-photo"></img>
                                                    </Col>
                                                    <Col className='col-participant flex-grow-1'>
                                                        <h6 className='m-0'>{transaction.origin.username}</h6>
                                                        <span>{transaction.origin.name + ' ' + transaction.origin.lastname}</span>
                                                    </Col>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                        ${round(transaction.amount)}
                                                    </Col>
                                                    <Col className='d-flex align-items-center col-participant flex-grow-0 mx-3'>
                                                        <OverlayTrigger key={'complete'} placement={'bottom'} overlay={<Tooltip id={'tooltip-complete'}>{transaction.complete? "Pagada" : "Marcar como pagada"}</Tooltip>}>
                                                            <FontAwesomeIcon icon={faCheckCircle} className="pointer" onClick={()=>handleCompleteTransaction(transaction)}
                                                                style={{fontSize: "2rem", color: transaction.complete? "green" : "#455A64"}}/>
                                                        </OverlayTrigger>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    );
                                }): null}
                            <hr className='m-0'/>
                            <div className="d-flex mx-3" style={{color: "var(--text-paragraph)"}}>
                                <div className="flex-grow-0 bold">Total</div>
                                <div className="flex-grow-1" style={{borderBottom: "2px dotted var(--text-paragraph)", margin: "1rem 5px"}}></div>
                                <div className="flex-grow-0 bold">${getTotalOwed()}</div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>: null}
            </Modal.Body>
            <LoadingModal showModal={loading} />
        </Modal>
    )
}
