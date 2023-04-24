import React, {useState} from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Popover from 'react-bootstrap/Popover';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faCalculator, faList, faExpand, faCompress, faSearch, faInfoCircle, faUser, faUsers} from '@fortawesome/free-solid-svg-icons';
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import ExpenseConfigModal from '../../modals/ExpenseConfigModal';
import ExpenseAddModal from '../../modals/ExpenseAddModal';
import ExpensesReviewModal from '../../modals/ExpensesReviewModal';
import TotalExpensesReviewModal from '../../modals/TotalExpensesReviewModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

export default function ExpenseInfoCard(props) {

    const [ expenseConfigModal, setExpenseConfigModal ] = useState({show: false});
    const [ showExpenseAddModal, setShowExpenseAddModal ] = useState(false);
    const [ showExpensesReviewModal, setShowExpensesReviewModal ] = useState(false);
    const [ showTotalExpensesReviewModal, setShowTotalExpensesReviewModal ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ splitingExpenses, setSplitingExpenses ] = useState(false);
    const [ listHeight, setListHeight ] = useState(40);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({});

    const helpText = 'En esta tarjeta podrás agregar gastos, indicando su monto y quienes deberán aportar al pago (podrás copiar la lista de suscriptores de un consumible). También podrás dividir los gastos y obtener un resumen de las transacciones que se deben ralizar para saldar las deudas.'

    const findErrorsAdd = () => {
        const newErrors = {};
        if (! expenseAdd.name || expenseAdd.name === '') newErrors.name = "Por favor ingrese el nombre del gasto a agregar."
        if ( expenseAdd.description &&  expenseAdd.description.length > 300 ) newErrors.description = "La descripción no puede ser mayor a 300 caracteres."
        return newErrors;
    }

    const handleOnCancelAdd = () => {
        setShowExpenseAddModal(false);
        setExpenseAdd({quantifiable:false});
        setErrorsAdd({});
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getExpensesFilters = () => {
        return props.event.expenses.filter(expense => {

            let nameFilter = true;

            if (filters.name) nameFilter = expense.name.toLowerCase().includes(filters.name.toLowerCase().trim());

            return true && nameFilter;
        })
    }

    const handleSplitExpenses = async () => {
        setSplitingExpenses(true);
        try{
            const res = await axios.get(`../api/expense/splitExpenses?event_id=${props.event.event_id}`);
            await props.getExpensesSummary();
        } catch (error) {
           
        }
        setSplitingExpenses(false);
    }

    const handleOnConfirmAdd = async (e) => {
        // Cuando se hace un submit de un form, hay comportamientos por defecto que se realizan al ejecutarse dicho submit. Estas dos líneas previenen algunos de esos comportamientos.
        e.preventDefault(); 
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrorsAdd();
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrorsAdd(newErrors);
        }
        else {
            try{
                setLoadingAdd(true);
                const params = { 
                    event_id: props.event.event_id,
                    name: expenseAdd.name,
                    description: expenseAdd.description,
                    quantifiable: expenseAdd.quantifiable,
                    subscribers: [] //Por ahora no estaría mandando subcriptores del gasto cuando se crea
                };
                // Cambiar el link por la API para registrar gasto
                const res = await axios.post('../api/expense/createExpense', params); 
                if (res) {
                    setExpenseAdd({quantifiable: false});
                }
                props.reloadEvent();
            } catch (error){
               
            }
            setLoadingAdd(false);
            setShowExpenseAddModal(false);
        }
    }

    const handleOnChangeExpenseAdd = (e) =>{
        const name = e.target.name; // Acá el nombre del target sería el task, el nombre del Control.
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; // Acá el valor que va tomando ese target es el texto dentro del Control, o el checked del Checkbox.

        setExpenseAdd({...expenseAdd, [name]: value});
        if ( !! errorsAdd[name] ) setErrorsAdd({...errorsAdd, [name]: null});
    }

    const handleOpenExpense = (expense) => {
        setExpenseConfigModal({show: true, expense: expense})
    }

    const getTotal = (expense) =>{
        return expense.subscribers.reduce((accum, value) => {return accum + Number(value.quantity)}, 0);
    }

    const deleteExpenseConfirmation = (expense) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar el gasto "${expense.name}" del evento?`,
            expense: expense, 
            show: true}));
    }

    const confirmDeleteExpense = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteExpense(deleteConfirmationModal.expense);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="d-flex justify-content-between">
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Gastos</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                        {props.myExpensesSummary && props.totalExpensesSummary && (props.event.permissions.VIEW_TOTAL_EXPENSES_REVIEW)?
                        <>
                            <span className="my-0 mx-2 mx-3-lg">Ver resumen:</span> 
                            <div className="d-flex flex-wrap gap-2">
                                <OverlayTrigger key={'personal'} placement={'bottom'} overlay={<Tooltip id={'tooltip-personal'}>Personal</Tooltip>}>
                                    <Button className="btn btn-primary-body btn-add d-flex py-1 align-items-center" onClick={()=>setShowExpensesReviewModal(true)}>
                                        <FontAwesomeIcon size="lg" icon={faUser}/>
                                        {/* &nbsp;Personal */}
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger key={'total'} placement={'bottom'} overlay={<Tooltip id={'tooltip-total'}>Total</Tooltip>}>
                                    <Button className="btn btn-primary-body btn-add d-flex py-1 align-items-center" onClick={()=>setShowTotalExpensesReviewModal(true)}>
                                        <FontAwesomeIcon size="lg" icon={faUsers}/>
                                        {/* &nbsp;Total */}
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        </> :
                        (props.myExpensesSummary && props.event.permissions.VIEW_EXPENSES_REVIEW)? 
                            <OverlayTrigger key={'personal2'} placement={'bottom'} overlay={<Tooltip id={'tooltip-personal2'}>Personal</Tooltip>}>
                                <Button className="btn btn-primary-body btn-add d-flex py-1 align-items-center" onClick={()=>setShowExpensesReviewModal(true)}>
                                    <FontAwesomeIcon size="lg" icon={faUser}/>
                                    {/* &nbsp;Personal */}
                                </Button>
                            </OverlayTrigger>
                        : null}
                        {props.event.expenses && props.modify && props.event.expenses.length === 0 && props.event.permissions.DELETE_EVENT? 
                            <CloseButton onClick={()=>props.handleOnRemove('expenses')}/>: null}
                    </div>
                </div>
                <hr className="mx-0 my-1" style={{height: '2px'}}/>
                { cardOrModalShow?
                    <div>
                        <Form>
                            <div className="home-search-container w-100">
                                <Form.Control placeholder="Buscar..." name="name" autoComplete="off" value={filters.name} onChange={handleOnChange}/>
                                <Button className="search-input-btn">
                                    <FontAwesomeIcon icon={faSearch}/>
                                </Button>
                            </div>
                        </Form>
                    </div>
                : null}
                <div className="list-container-container">
                        {!props.event.expenses || !props.event.expenses.length? <p>No hay gastos todavía</p>:null}
                        <div className="grid-container list-container" style={{maxHeight: `${listHeight}rem`}}>
                            {props.event.expenses && props.event.expenses.length? getExpensesFilters().map((expense, key) => {
                                return (
                                    <Card key={key} className="m-1 expense-info">
                                        <Card.Body className="p-2 w-100">
                                            <div style={{display: "flex", justifyContent: "flex-end",}}>
                                                {props.modify && (props.event.permissions.DELETE_EXPENSE || props.event.permissions.DELETE_OWN_EXPENSE && expense.isOwn)? 
                                                <Button className="delete-btn d-flex" title="Eliminar gasto" onClick={()=>deleteExpenseConfirmation(expense)}><FontAwesomeIcon icon={faTimesCircle}/></Button> :null}
                                            </div>
                                            <div className="d-flex flex-column" onClick={()=>handleOpenExpense(expense)}>
                                                <h4>{expense.name}</h4>
                                                <div className="text-tertiary bold" style={{fontSize: "2rem",}}>
                                                    ${expense.amount}
                                                </div>
                                                <p className="m-0">{expense.description && expense.description.length > 30? expense.description.substring(0,30) + "..." : expense.description}</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                );
                            }): null}
                        </div>
                        <div className="d-flex justify-content-center m-2 add-button gap-2">
                            {props.modify && props.event.permissions.CREATE_EXPENSE ?
                                <Button className="btn btn-primary-body btn-add d-flex" onClick={()=>setShowExpenseAddModal(true)}>
                                    <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    &nbsp;Agregar gasto
                                </Button> : null}
                            {props.event.expenses && props.event.expenses.length && props.event.permissions.SPLIT_EXPENSES? 
                                <Button className="btn btn-primary-body btn-add d-flex px-3 py-1 mx-1 align-items-center" disabled={splitingExpenses} onClick={handleSplitExpenses}>
                                    <FontAwesomeIcon size="lg" icon={faCalculator}/>
                                    &nbsp;{!splitingExpenses? "Dividir gastos": "Dividiendo gastos"}
                                </Button> : null}
                        </div>
                </div>
            </div>
        </CardOrModal>
        <ExpenseConfigModal
            showModal={expenseConfigModal.show}
            expense={expenseConfigModal.expense}
            modify={props.modify}
            event_id={props.event.event_id}
            consumables={props.event.consumables? props.event.consumables : []}
            handleCloseModal={()=>setExpenseConfigModal(prev => ({show: false, expense: prev.expense}))}
            reloadEvent={props.reloadEvent}
            participants={props.participants}
            handleOpenModal={()=>setExpenseConfigModal(prev => ({show: true, expense: prev.expense}))}
            permissions={props.event.permissions}
        />
        <ExpenseAddModal
            showModal={showExpenseAddModal}
            title="Agregar gasto"
            handleCloseModal={()=>{setShowExpenseAddModal(false)}}
            reloadEvent={props.reloadEvent}
            event_id={props.event.event_id}
            participants={props.participants}
        />
        <ExpensesReviewModal
            showModal={showExpensesReviewModal}
            event_id={props.event.event_id}
            handleCloseModal={()=>setShowExpensesReviewModal(false)}
            expenseReview={props.myExpensesSummary}
            getExpensesSummary={props.getExpensesSummary}
            setModalLoading={props.setModalLoading}
        />
        <TotalExpensesReviewModal
            showModal={showTotalExpensesReviewModal}
            event_id={props.event.event_id}
            handleCloseModal={()=>setShowTotalExpensesReviewModal(false)}
            expenseReview={props.totalExpensesSummary}
            expenses={props.event.expenses}
        />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar gasto"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteExpense}
        />
        </>
    );
}
