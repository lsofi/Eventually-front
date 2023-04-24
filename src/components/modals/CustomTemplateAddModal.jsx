import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import DropFileInput from '../drag-drop-file-input/DropFileInput';
import CropEasy from '../crop/CropEasy';
import CroppingModal from './CroppingModal';
import { imageResize } from '../../shared/imageResizer';
import { toast } from 'react-toastify';

export default function CustomTemplateAddModal( props ) {

    const [ template, setTemplate ] = useState({});
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ cropping, setCropping ] = useState(0);

    const [ fileList, setFileList ] = useState([]);
    const [ photo, setPhoto ] = useState('');
    const [ openCrop, setOpenCrop ] = useState(false);
    const [ photoURL, setPhotoURL ] = useState(null);


    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        setTemplate({ ...template, [name]: value });
        if (!!errors[name]) setErrors({ ...errors, [name]: null });
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const submitPhoto = async(file) => {
        setCropping(prev=>prev+1);
        let templatePhoto = await imageResize(file, 250);

        templatePhoto = await toBase64(templatePhoto);

        setTemplate({...template, photo: templatePhoto})
        if (errors.photo) setErrors(prev => ({...prev, photo: undefined}));
        setCropping(prev=>prev-1);
    }

    const onFileChange = async (files) => {
        const file = files[0];
        if (!validFilesFormat(file)) return;
        setPhotoURL(URL.createObjectURL(file));
        setOpenCrop(true);
    }

    const isValidExtension = (file)=> {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        return allowedExtensions.exec(file.name);
    }
    
    const isValidSize = (file)=> {
        return file.size <= 1e7
    }

    const validFilesFormat = (file) => {
        if(!isValidExtension(file)) {
            toast.error('El formato del archivo elegido no es el correcto.')
            return false
        }
        if(!isValidSize(file)) {
            toast.error('El tamaño máximo de la foto es de 10 MB.');
            return false
        }
        return true;
    }

    const onFileDrop = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            const updatedList = [newFile];
            setFileList(updatedList);
            onFileChange(updatedList);
        }
    }

    const fileRemove = (file) => {
        const updatedList = [...fileList];
        updatedList.splice(fileList.indexOf(file), 1);
        setFileList(updatedList);
        onFileChange(updatedList);
    }

    const findErrors = () => {
        const newErrors = {};

        if (!template.title || template.title === '') newErrors.title = "Debe ingresar un nombre.";
        if (template.title && template.title.length > 50) newErrors.title = "El nombre no puede superar los 50 caracteres.";

        if (!template.description || template.description === '') newErrors.description = "Debe ingresar una descripción.";
        if (template.description && template.description.length > 500) newErrors.description = "La descripción no puede superar los 500 caracteres.";

        if (!template.photo) newErrors.photo = "Debe ingresar una foto para su plantilla.";
        console.log(newErrors);
        return newErrors;
    }

    const handleClose = () => {
        setErrors({});
        setLoading(0);
        setTemplate({});
        props.handleCancel();
    }

    const handleConfirm = async (e,) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
            // We got errors!
            setErrors(newErrors);
            console.log(`hola`);
            return;
        }
        const event = props.event;
        const params = {
            type: event.type.name,
            name: template.title,
            description: template.description,
            photo: template.photo? template.photo : undefined,
            event: {
                guests: event.guests? [] : undefined,
                organizers: event.organizers? [] : undefined,
                consumables: event.consumables && event.consumables.length? event.consumables.map(consumable => (
                    {consumable_id: consumable.consumable_id, name: consumable.name, description: consumable.description}
                    )) : undefined,
                activities: event.tasks && event.tasks.length? event.tasks.map(task => (
                    {
                        activity_id: task.activity_id, 
                        name: task.name, 
                        detail: task.detail, 
                        checklist: task.checklist && task.checklist.length? 
                                task.checklist.map(check => ({...check, completed: false})): undefined}
                )) : undefined,
                services: event.services? []: undefined,
                expenses: event.expenses? []: undefined,
                address: event.address? {}: undefined,
                photo: event.photo? null: undefined,
                transports: event.transports? null: undefined,
                polls: event.polls? null: undefined,
            }
        }
        setLoading(prev=>prev+1);
        try {
            //console.log(params);
            if (props.personalTemplate) await axios.post('../api/event/createTemplateByUser', params);
            else await axios.post('../api/event/createTemplate', params);
            toast.success('Plantilla creada con éxito.');
            handleClose();
        } catch (error) {}
        setLoading(prev=>prev-1);
    }

    return (
        <Modal show={props.showModal} onHide={handleClose} backdrop="static" className='Modal'>
            <Modal.Header className="d-flex flex-column align-items-start">
                <Modal.Title>{props.title}</Modal.Title>
                <p className="m-0">Ingresá la información requerida con un {<span className="text-tertiary">*</span>}</p>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <Form style={{width: '90%'}} onSubmit={handleConfirm}>
                    <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                        <Form.Label>Nombre de la plantilla <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control
                            isInvalid={!!errors.title}
                            placeholder="Ingresá el nombre de la plantilla"
                            name="title"
                            value={template.title}
                            maxLength={50}
                            onChange={handleOnChange} />
                        <Form.Control.Feedback
                            type="invalid">{errors.title}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="my-2 d-flex flex-column" controlId="description">
                        <Form.Label>Descripción <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            isInvalid={!!errors.description}
                            placeholder="Ingresá una descripción de la plantilla a guardar."
                            name="description"
                            value={template.description}
                            onChange={handleOnChange}
                            maxLength={500}
                        />
                        <Form.Text className="text-end">{template.description ? template.description.length : 0} de 500</Form.Text>
                        <Form.Control.Feedback
                            type="invalid">{errors.description}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-6" controlId="photo">
                        <Form.Label>{template.photo? 'Foto de plantilla' : "Agregar foto de plantilla"} <span className="text-tertiary">*</span></Form.Label>
                            {template.photo? 
                                <img 
                                    src={template.photo} 
                                    alt="Foto de plantilla" 
                                    style={{width: '100%', borderRadius: '1rem', marginBottom: '1rem'}}
                                />
                                : 
                                null
                            }
                        <DropFileInput 
                            onFileChange={(files) => onFileChange(files)} 
                            fileList={fileList} 
                            onFileDrop={onFileDrop} 
                            fileRemove={fileRemove} 
                            modify={true}
                        />
                        <span className="text-danger">{errors.photo}</span>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleClose}>
                    Cancelar
                </Button>
                {!(loading)?
                    <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
            {openCrop ? 
                <CropEasy 
                    {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} 
                    aspect_ratio={16/9} 
                    round={false}
                    setModalLoading={setCropping}
                    /> 
                : 
                null
            }
            <CroppingModal showModal={cropping} />
        </Modal>
    )
}
