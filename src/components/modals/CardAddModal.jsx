import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

export default function CardAddModal(props) {
    
    const initialModules = [
        {name: 'address', description: 'Dirección del evento', selected: false, permission: 'UPDATE_EVENT'},
        {name: 'photo', description: 'Foto de portada', selected: false, permission: 'SAVE_PHOTO_EVENT'},
        {name: 'guests', description: 'Invitados', selected: false, permission: 'REGISTER_GUEST'},
        {name: 'organizers', description: 'Organizadores', selected: false, permission: 'REGISTER_ORGANIZER'},
        {name: 'tasks', description: 'Tareas', selected: false, permission: 'CREATE_ACTIVITY'},
        {name: 'consumables', description: 'Consumibles', selected: false, permission: 'CREATE_CONSUMABLE'},
        {name: 'expenses', description: 'Gastos', selected: false, permission: 'CREATE_EXPENSE'},
        {name: 'services', description: 'Servicios', selected: false, permission: 'ADD_SERVICE_TO_EVENT'},
        {name: 'transports', description: 'Car pooling', selected: false, permission: 'CREATE_TRANSPORT'},
        {name: 'repositories', description: 'Fotos y Archivos', selected: false, permission: 'CREATE_REPOSITORY_OR_ALBUM'},
        {name: 'polls', description: 'Encuestas', selected: false, permission: 'CREATE_POLL'}
    ]

    const [ modules, setModules ] = useState(initialModules);

    useEffect(()=>{
        if(!props.showModal) return;
        setModules(initialModules);
    },[props.showModal])

    const toShow = () => {
        let modulesToShow = 0
        modules.forEach(module => {
            if (!props.properties.includes(module.name) && props.permissions && props.permissions[module.permission]) modulesToShow += 1;
        })
        return modulesToShow != 0;
    }

    const toggleSelectedModule = name => {
        setModules(modules.map(module => {
            if (module.name === name){
                module.selected = !module.selected;
                return module;
            } else return module;
        }))
    }

    const handleConfirm = () => {
        const modulesToAdd = modules.filter(module => module.selected);
        props.handleAddFields(modulesToAdd);
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} className="card-add">
            <Modal.Header>
                <h3 className="mb-0">Agregar tarjeta a evento</h3>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center gap-2">
            {!toShow()?
                <h4>¡No hay tarjetas para agregar!</h4>
            : modules.map((module, key) => (
                !props.properties.includes(module.name) && props.permissions[module.permission]?
                    <Card key={key} className={(module.selected? 'selected ': '') + 'w-100 d-flex py-2 pointer align-items-center justify-content-center card-add-element'}
                        onClick={()=>toggleSelectedModule(module.name)}>
                        <h4 className='m-0'>{module.description}</h4>
                    </Card>
                :null
            ))}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCloseModal}>
                    Cancelar
                </Button>
                <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
