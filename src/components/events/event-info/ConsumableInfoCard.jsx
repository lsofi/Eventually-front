import React, {useState} from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faUser, faExpand, faCompress, faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import ConsumableConfigModal from '../../modals/ConsumableConfigModal';
import ConsumableAddModal from '../../modals/ConsumableAddModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';
import CardOrModal from '../../CardOrModal';

export default function ConsumableInfoCard(props) {

    const [ consumableConfigModal, setConsumableConfigModal ] = useState({show: false});
    const [ showConsumableAddModal, setShowConsumableAddModal ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({show: false});
    const [ errorsAdd, setErrorsAdd ] = useState({});
    const [ consumableAdd, setConsumableAdd ] = useState({quantifiable: false});
    const [ loadingAdd, setLoadingAdd ] = useState(false);
    const [ listHeight, setListHeight ] = useState(40);
    const [ cardOrModalShow, setCardOrModalShow ] = useState(false);
    const [ filters, setFilters ] = useState({});

    const helpText = 'En esta tarjeta podrás agregar consumibles para que los participantes del evento se suscriban. Podrás indicar si el consumible es cuantificable para que los participantes indiquen la cantidad que van a consumir a la hora de suscribirse.'

    const findErrorsAdd = () => {
        const newErrors = {};
        if (! consumableAdd.name || consumableAdd.name === '') newErrors.name = "Por favor ingrese el nombre del consumible a agregar."
        if ( consumableAdd.description &&  consumableAdd.description.length > 300 ) newErrors.description = "La descripción no puede ser mayor a 300 caracteres."
        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrorsAdd(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {}
    }

    const handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFilters(prev => ({...prev, [name]: value}));
    }

    const getConsumablesFilters = () => {
        return props.event.consumables.filter(consumable => {

            let nameFilter = true;

            if (filters.name) nameFilter = consumable.name.toLowerCase().includes(filters.name.toLowerCase().trim());

            return true && nameFilter;
        })
    }

    const handleOnCancelAdd = () => {
        setShowConsumableAddModal(false);
        setConsumableAdd({quantifiable:false});
        setErrorsAdd({});
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
                    name: consumableAdd.name,
                    description: consumableAdd.description,
                    quantifiable: consumableAdd.quantifiable,
                    subscribers: [] //Por ahora no estaría mandando subcriptores del consumible cuando se crea
                };
                // Cambiar el link por la API para registrar consumible
                const res = await axios.post('../api/consumable/createConsumable', params); 
                if (res) {
                    setConsumableAdd({quantifiable: false});
                }
                setShowConsumableAddModal(false);
                props.reloadEvent();
            } catch (error){
                setResponseErrors(error);
            }
            setLoadingAdd(false);
        }
    }

    const handleOnChangeConsumableAdd = (e) =>{
        const name = e.target.name; // Acá el nombre del target sería el consumable, el nombre del Control.
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; // Acá el valor que va tomando ese target es el texto dentro del Control, o el checked del Checkbox.

        setConsumableAdd({...consumableAdd, [name]: value});
        if ( !! errorsAdd[name] ) setErrorsAdd({...errorsAdd, [name]: null});
    }

    const handleOpenConsumable = (consumable) => {
        setConsumableConfigModal({show: true, consumable: consumable})
    }

    const getTotal = (consumable) =>{
        if (!consumable.subscribers) return 0;
        return consumable.subscribers.reduce((accum, value) => {return accum + Number(value.quantity)}, 0);
    }

    const deleteConsumableConfirmation = (consumable) => {
        setDeleteConfirmationModal(prev => (
            {message: `¿Está seguro/a de eliminar el consumible "${consumable.name}" del evento?`,
            consumable: consumable, 
            show: true}));
    }

    const confirmDeleteConsumable = () => {
        setDeleteConfirmationModal({show: false});
        props.deleteConsumable(deleteConfirmationModal.consumable);
    }

    return (
        <>
        <CardOrModal show={cardOrModalShow} onHide={()=>setCardOrModalShow(prev => !prev)}>
            <div className="info-card">
                <div className="d-flex justify-content-between">
                    <div className="d-flex gap-3 align-items-center">
                        <h4 className="mb-0">Consumibles</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                        <FontAwesomeIcon icon={cardOrModalShow? faCompress : faExpand} title={cardOrModalShow? 'Comprimir' : 'Expandir'} className="expand-icon" onClick={()=>setCardOrModalShow(prev => !prev)}/>
                    </div>
                    {props.event.consumables && props.modify && props.event.consumables.length === 0 && props.event.permissions.DELETE_EVENT? 
                        <CloseButton onClick={()=>props.handleOnRemove('consumables')}/>: null}
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
                        {!props.event.consumables || props.event.consumables.length === 0? <p>No hay consumibles todavía</p>:null}
                        <div className="grid-container list-container" style={{maxHeight: `${listHeight}rem`}}>
                            {props.event.consumables? getConsumablesFilters().map((consumable, key) => {
                                return (
                                    <Card key={key} className="m-1 consumable-info">
                                        <Card.Body className="p-2" style={{width: "100%"}}>
                                            <div style={{display: "flex", justifyContent: "flex-end",}}>
                                                {props.modify && props.event.permissions.DELETE_CONSUMABLE? 
                                                    <Button className="delete-btn d-flex" title="Eliminar consumible" onClick={()=>deleteConsumableConfirmation(consumable)}>
                                                        <FontAwesomeIcon icon={faTimesCircle}/>
                                                    </Button> 
                                                :null}
                                            </div>
                                            <div onClick={()=>handleOpenConsumable(consumable)}>
                                                <h4>{consumable.name}</h4>
                                                <div className="text-tertiary bold d-flex align-items-center justify-content-center gap-3" style={{fontSize: "2rem",}}>
                                                    <div><FontAwesomeIcon icon={faUser} size="xs"/> {consumable.subscribers? consumable.subscribers.length : 0}</div>
                                                    <div><FastfoodIcon/> {getTotal(consumable)}</div> 
                                                </div>
                                                <p className="m-0">{consumable.description && consumable.description.length > 30? consumable.description.substring(0,30) + "..." : consumable.description}</p>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                );
                            }): null}
                        </div>
                        {props.modify && props.event.permissions.CREATE_CONSUMABLE ?
                            <div className="d-flex justify-content-center m-2 add-button">
                                <Button className="btn btn-primary-body btn-add d-flex" onClick={()=>setShowConsumableAddModal(true)}>
                                    <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    &nbsp;Agregar consumible
                                </Button>
                            </div>
                        : 
                            null
                        }
                </div>
            </div>
        </CardOrModal>
        <ConsumableConfigModal
            showModal={consumableConfigModal.show}
            consumable={consumableConfigModal.consumable}
            modify={props.modify && props.event.permissions.UPDATE_CONSUMABLE}
            event_id={props.event.event_id}
            handleCloseModal={()=>setConsumableConfigModal(prev => ({show: false, consumable: prev.consumable}))}
            reloadEvent={props.reloadEvent}
            permissions={props.event.permissions}
        />
        <ConsumableAddModal
            showModal={showConsumableAddModal}
            consumable={consumableAdd}
            errors={errorsAdd}
            handleCancel={handleOnCancelAdd}
            handleConfirm={handleOnConfirmAdd}
            handleOnChange={handleOnChangeConsumableAdd}
            loading={loadingAdd}
            title="Agregar consumible"
        />
        <YesNoConfirmationModal
            showModal={deleteConfirmationModal.show}
            title="Eliminar consumible"
            message={deleteConfirmationModal.message}
            handleCloseModal={()=>setDeleteConfirmationModal({show: false})}
            handleConfirm={confirmDeleteConsumable}
        />
        </>
    );
}
