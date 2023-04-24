import React, {useState, useEffect, ChangeEvent, useRef} from 'react';
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
import { faCloudArrowUp, faArrowLeft, faBroom, faCheck } from '@fortawesome/free-solid-svg-icons';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { Carousel, Spinner } from 'react-bootstrap';
import { Box, filledInputClasses, LinearProgress } from '@mui/material';
import { getFormattedSize } from '../../shared/shared-methods.util';
import { useUploadForm } from '../../shared/shared-hooks';
import { toast } from 'react-toastify';

export default function FilesUploadModal ( props ) {

    const [ fileList, setFileList ] = useState(null);
    const [ errors, setErrors ] = useState({});
    const [ uploadingFiles, setUploadingFiles ] = useState(false); // intervalo donde se suben los archivos
    
    // const abortControllerRef = useRef(new AbortController())

    const axiosConfig = {
        headers: {
            "Content-Type": "multipart/form-data",
            event_id: props.event_id
        },/* 
        signal: abortControllerRef.current.signal */
    }

    const { isSuccess, uploadForm, progress } = useUploadForm('../api/files/saveFiles', axiosConfig);

    const fileInputRef = useRef();

    useEffect(()=>{
        setFileList(null);
        setUploadingFiles(false);
    }, [props.showModal])

    const handleClean = () => {
        setFileList(null);
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if(validFilesExtensions(files)){
            setFileList(files);
        }
    }

    const handleInputFiles = (event) => {
        const files = event.target.files;
        console.log(event);
        
        if(validFilesExtensions(files)){
            setFileList(files);
        }
    }

    const handleSubmitFiles = async () => {
        // abortControllerRef.current = new AbortController();
        console.log('Files', files);
        setUploadingFiles(true);
        const formData = new FormData();
        files.forEach((file, i) => {
            formData.append(`files`, file, file.name);
        });
        try{
            /* const config = {headers: {"Content-Type": "multipart/form-data"}}; */
            const res = await uploadForm(formData);
            console.log(res.data);
        }
        catch(err){
            console.log(err)
            if (axios.isCancel(err)){
                //armar el toast de Subida cancelada
            }
            else{
                setResponseErrors(err);
            }
            setUploadingFiles(false);
        }
    }

    const validFilesExtensions = (files) => {
        for(const file of files){
            if(!isValidExtension(file)) {
                setErrors({...errors, format: 'El formato de los archivos elegidos no es el correcto.'})
                return false
            }
        }
        setErrors({...errors, format: null});
        return true;
    }
    
    const setErrorFromResponse = (errorField, errorMsg) =>{
        if (errorField && errorField.includes('.')){
            const errorFieldArray = errorField.split('.');
            let stringErrorObj = '';
            for (let field of errorFieldArray) {
                stringErrorObj += `{"${field}": `
            }
            stringErrorObj += `"${errorMsg}"` + '}'.repeat(errorFieldArray.length);
            setErrors(prev => ({...prev, ...JSON.parse(stringErrorObj)}));
        } else {
            setErrors(prev=> ({...prev, [errorField]: errorMsg}));
        }
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrorFromResponse(field, errorMsg);
            });
        } catch (error) {}
    }

    const isValidExtension = (file)=> {
        // const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        // return allowedExtensions.exec(file.name);
        return true;
    }

    const files = fileList? [...fileList] : [];

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size='lg' style={{zIndex: '999999'}}>
            <Modal.Header className='mx-2'>
                <Modal.Title>Subir archivos</Modal.Title>
                <CloseButton onClick={()=>{
                    if(uploadingFiles && !isSuccess) 
                        {toast.warning("Debe cancelar la carga de archivos para salir.")}
                    else props.handleCloseModal()}}></CloseButton>
            </Modal.Header>
            <Modal.Body className='pt-0'>
                {!fileList ?
                    <div className='d-flex flex-column mt-2 justify-content-center align-items-center dropzone' style={{height: '20rem'}} onDragOver={handleDragOver} onDrop={handleDrop}>
                        <h5>Arrastrá y soltá los archivos a subir</h5>
                        <h5>o también podés</h5>
                        <input
                            type="file"
                            multiple
                            hidden
                            ref={fileInputRef}
                            onChange={handleInputFiles}
                        />
                        <Button className='btn-primary-modal my-1' onClick={() => fileInputRef.current.click()}><h5 className='my-1'>Elegir archivos</h5></Button>
                        {/* <h6>Formatos permitidos: .jpg, .jpeg, .png</h6> */}
                        <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.format}</span>
                    </div>
                    :
                    <div className="d-flex mt-2 mx-2 flex-column">
                        <h4 className='text-tertiary'>{files.length == 1? "1 archivo seleccionado" : `${files.length} archivos seleccionados`}</h4>
                        {/*TODO cambiar el formato para ver los archivos a subir*/}
                        <div className='' style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                            <Row>
                                {files.map((file, key) => {
                                    return (
                                        <Col lg={6}>
                                            <Card key={key} className='m-0'>
                                                <Card.Body>
                                                    <h5 className='overflow-hidden pb-1 px-1 m-0 '>{file.name}</h5>
                                                    <span className='overflow-hidden px-1 m-0 text-secondary'>Tamaño del archivo: {getFormattedSize(file.size)}</span>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                }
                                )
                                }
                            </Row>
                        </div>
                        {!uploadingFiles?
                            <div className='d-flex flex-row justify-content-center mt-2 gap-3'>
                                <Button className='btn btn-secondary-modal' onClick={handleClean}>
                                    <FontAwesomeIcon icon={faBroom} className="text-title" />&nbsp;Limpiar
                                </Button>
                                <Button className='btn btn-primary-modal' onClick={handleSubmitFiles}>
                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-title" />&nbsp;Subir
                                </Button>
                            </div>
                            :
                            <div className="my-2">
                                {!isSuccess?
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="d-flex flex-row justify-content-center align-items-center">
                                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />
                                            <h6 className='p-0 m-0'>&nbsp;{files.length > 1? "Subiendo archivos..." : "Subiendo archivo..."}</h6>
                                            <h6 className='text-tertiary p-0 m-0'>{isSuccess? 100 : Math.floor(progress)}%</h6>
                                        </div>
                                    </div>
                                    :
                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                        <div className="d-flex flex-row justify-content-center align-items-center">
                                            <FontAwesomeIcon icon={faCheck} className="text-title"/>
                                            <h6 className='p-0 m-0'>&nbsp;{files.length > 1? "¡Archivos subidos con éxito!" : "¡Archivo subido con éxito!"}</h6>
                                        </div>
                                        <Button className='d-flex flex-row align-items-center btn btn-primary-modal mt-2' style={{width: 'fit-content'}} onClick={()=>{props.handleCloseModal()}}>
                                            <ChevronLeftIcon/>Volver a la carpeta
                                        </Button>
                                    </div>
                                }
                                {!isSuccess?
                                    <LinearProgress variant='determinate' value={isSuccess? 100 : progress}/>
                                    :
                                    null
                                }
                            </div>
                        }
                    </div>
                }
            </Modal.Body>
        </Modal>
    )
}