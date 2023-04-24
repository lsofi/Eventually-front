import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Placeholder from 'react-bootstrap/Placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../Alert';

export default function TemplatesModal(props) {

    const [ loading, setLoading] = useState(0);
    const [ selectedTemplate, setSelectedTemplate ] = useState(undefined);
    const [ selectedType, setSelectedType ] = useState('all');
    const [ templatesFilter, setTemplatesFilter ] = useState('');
    const [ showTemplateWarning, setShowTemplateWarning ] = useState(false);
    const [ templates, setTemplates ] = useState([]);
    const [ expandTypes, setExpandTypes ] = useState(true);

    useEffect(()=>{
        if(!props.showModal) return;
        getTemplates();
        setSelectedTemplate(undefined);
        if (props.eventType && props.eventType.name) setSelectedType(props.eventType.name);
        else setSelectedType('all')
    },[props.showModal]);


    const getTemplates = async () => {
        setLoading(prev => prev + 1);
        try {
            const resTemplates = await axios.get('../api/event/getTemplates');
            const resUserTemplates = await axios.get('../api/event/getUserTemplates');
            if (resUserTemplates.data.templates && resUserTemplates.data.templates.length) setTemplates([...resTemplates.data, ...resUserTemplates.data.templates]);
            else setTemplates([...resTemplates.data]);
        } catch (error) { console.log(error);}
        setLoading(prev => prev - 1);
    }

    const handleOnChangeFilter = (event) => {
        const value = event.target.value;
        setTemplatesFilter(value);
    }

    const showTemplate = template => {
        if (!template) return false;
        const typeFilter = selectedType === 'all' || (selectedType === 'own' && template.isOwn) || selectedType === template.type;
        const searchFilter = template.name.toLowerCase().includes(templatesFilter.toLowerCase())
        return typeFilter && searchFilter;
    }

    const handleConfirm = () => {
        if (!selectedTemplate) {
            setShowTemplateWarning(true)
            return;
        }
        props.setTemplate(selectedTemplate);
        props.handleCloseModal();
    }

    const handleConfirmNoTemplate = () => {
        props.setTemplate(null);
        props.handleCloseModal();
    }

    const toggleExpandTypes = () => {
        setExpandTypes(prev => !prev);
    }

    return (
        <>
        <Modal show={props.showModal} onHide={props.handleCloseModal} className="Modal" size="xl">
            <Modal.Header>
                <h4 style={{color: 'var(--primary)'}}>Plantillas</h4>
            </Modal.Header>
            <Modal.Body className="d-flex">
                <div className="d-flex flex-column align-items-end">
                    <Button className="templates-bars reset-btn mx-1" onClick={toggleExpandTypes}><FontAwesomeIcon icon={faBars}/></Button>
                    <div className={`px-2 templates-types-tab ${expandTypes? 'active': ''}`}>
                        <h5 className={selectedType === 'all'? 'text-tertiary pointer' : 'pointer'} onClick={()=>setSelectedType('all')}>
                            Todos
                        </h5>
                        <h5 className={selectedType === 'own'? 'text-tertiary pointer' : 'pointer'} onClick={()=>setSelectedType('own')}>
                            Plantillas propias
                        </h5>
                        {props.types.map((type, key)=>(
                            <h5 key={key} className={selectedType === type.name? 'text-tertiary pointer' : 'pointer'} onClick={()=>setSelectedType(type.name)}>
                                {type.name}
                            </h5>
                        ))}
                    </div>
                </div>
                <div className="d-flex flex-column flex-grow-1">
                    <div className="services-search-container" style={{marginRight: '1rem', width: 'auto'}}>
                        <Form.Control placeholder="Buscar..." name="service-search-filter" value={templatesFilter} onChange={handleOnChangeFilter}/>
                        <Button className="search-input-btn">
                            <FontAwesomeIcon icon={faSearch}/>
                        </Button>
                    </div>
                    {loading? 
                        <div className="templates-grid-container">
                            {[0,1,2,3,4,5,6,7,8,9,10,11].map(index => (
                                <Placeholder key={index} animation="wave" className="m-1" 
                                    style={{backgroundColor: 'var(--text-ultra-muted)', height: '10.5rem', width: '12rem', borderRadius: '2rem'}}
                                />
                            ))}
                        </div>
                        :
                        templates.filter(template => (showTemplate(template))).length?
                            <div className="templates-grid-container">
                                {templates.map((template, key)=>{
                                    if (showTemplate(template)) return(
                                    <Card key={key} className={(selectedTemplate && template._id === selectedTemplate._id? 'selected ': '' ) +"template-card"} onClick={()=>setSelectedTemplate(template)}>
                                        <Card.Header>
                                            <Card.Img variant="top" src={template.photo}/>
                                        </Card.Header>
                                        <Card.Body>
                                            {template.name}
                                        </Card.Body>
                                    </Card>
                                )})}
                            </div>
                            :
                            <h3 className="text-center">{selectedType === 'own'? 'No tienes plantillas personalizadas' :'¡No tenemos plantillas en esta categoría aún!'}</h3>
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleConfirmNoTemplate}>
                    No usar plantilla
                </Button>
                <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                    Usar plantilla
                </Button>
            </Modal.Footer>
        </Modal>
        <Snackbar open={showTemplateWarning} onClose={()=>{setShowTemplateWarning(false)}} anchorOrigin={{vertical: "top", horizontal: "right"}}>
            <Alert onClose={()=>{setShowTemplateWarning(false)}} severity="warning" sx={{ width: '100%' }}>
                Debe seleccionar una plantilla
            </Alert>
        </Snackbar>
        </>
    )
}
