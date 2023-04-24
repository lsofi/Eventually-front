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
import { faCloudArrowUp, faChevronLeft, faBroom, faCheck } from '@fortawesome/free-solid-svg-icons';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { Carousel, Spinner } from 'react-bootstrap';
import { Box, filledInputClasses, LinearProgress } from '@mui/material';
import { getFormattedSize } from '../../shared/shared-methods.util';
import { useUploadForm } from '../../shared/shared-hooks';
import { toast } from 'react-toastify';

export default function PhotosUploadModal ( props ) {

    const [ fileList, setFileList ] = useState(null);
    const [ errors, setErrors ] = useState({});
    const [ uploadingPhotos, setUploadingPhotos ] = useState(false); // intervalo donde se suben los archivos
    
    // const abortControllerRef = useRef(new AbortController())

    const axiosConfig = {
        headers: {
            "Content-Type": "multipart/form-data",
            event_id: props.event_id
        },/* 
        signal: abortControllerRef.current.signal */
    }

    const { isSuccess, uploadForm, progress } = useUploadForm('../api/photos/uploadPhotosToAlbum', axiosConfig);

    const imgInputRef = useRef();

    useEffect(()=>{
        setFileList(null);
        setUploadingPhotos(false);
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
        if(validFilesFormat(files)){
            setFileList(files);
        }
    }

    const handleInputImage = (event) => {
        const files = event.target.files;
        console.log(event);
        
        if(validFilesFormat(files)){
            setFileList(files);
        }
    }

    const handleSubmitPhotos = async () => {
        // abortControllerRef.current = new AbortController();
        console.log('Files', files);
        setUploadingPhotos(true);
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
            if (axios.isCancel(err)){
                //armar el toast de Subida cancelada
            }
            else{
                setResponseErrors(err);
            }
            setUploadingPhotos(false);
        }
    }

    const validFilesFormat = (files) => {
        for(const file of files){
            if(!isValidExtension(file)) {
                setErrors({...errors, format: 'El formato de los archivos elegidos no es el correcto.'})
                return false
            }
            if(!isValidSize(file)) {
                setErrors({...errors, size: 'El tamaño máximo de las fotos a subir es de 10 MB.'})
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
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        return allowedExtensions.exec(file.name);
    }

    const isValidSize = (file)=> {
        return file.size <= 1e7
    }

    const files = fileList? [...fileList] : [];

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size='lg' style={{zIndex: '999999'}}>
            <Modal.Header className='mx-2'>
                <Modal.Title>Subir fotos</Modal.Title>
                <CloseButton onClick={()=>{
                    if(uploadingPhotos && !isSuccess) 
                        {toast.warning("Debe cancelar la carga de archivos para salir.")}
                    else props.handleCloseModal()}}></CloseButton>
            </Modal.Header>
            <Modal.Body className='pt-0'>
                {!fileList ?
                    <div className='d-flex flex-column mt-2 justify-content-center align-items-center dropzone' style={{height: '20rem'}} onDragOver={handleDragOver} onDrop={handleDrop}>
                        <h5>Arrastrá y soltá las fotos a subir</h5>
                        <h5>o también podés</h5>
                        <input
                            type="file"
                            multiple
                            hidden
                            ref={imgInputRef}
                            onChange={handleInputImage}
                        />
                        <Button className='btn-primary-modal my-1' onClick={() => imgInputRef.current.click()}><h5>Elegir fotos</h5></Button>
                        <h6 className='text-muted mt-1'>Formatos permitidos: .jpg, .jpeg, .png</h6>
                        <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.format}</span>
                        <h6 className='text-muted'>Tamaño máximo por imagen: 10 MB</h6>
                        <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.size}</span>
                    </div>
                    :
                    <div className="d-flex mt-2 flex-column">
                        <h4 className='text-tertiary'>{files.length == 1? "1 archivo seleccionado" : `${files.length} archivos seleccionados`}</h4>
                        <Carousel interval={null} slide={false}>
                            {files.map((file, key) => {
                                return (
                                    <Carousel.Item key={key}>
                                        <img
                                            className="w-100 carousel-upload carousel-upload-img"
                                            src={URL.createObjectURL(file)}
                                            alt="slide"
                                        />
                                        <Carousel.Caption className='bg-gray rounded p-0 mb-4'>
                                            <h6 className='overflow-hidden pb-1 px-1 m-0'>{file.name}</h6>
                                            <p className='overflow-hidden px-1 m-0'>Tamaño del archivo: {getFormattedSize(file.size)}</p>
                                        </Carousel.Caption>
                                    </Carousel.Item>
                                )}
                            )
                            }
                        </Carousel>
                        {!uploadingPhotos?
                            <div className="d-flex flex-column">
                                <span className="text-muted mt-1" style={{fontSize: '0.8rem'}}>El formato de las imágenes mostrado es a modo de presentación. Al subirse al álbum, mantendrán su formato original.</span>
                                <div className='d-flex flex-row justify-content-center mt-2 gap-3'>
                                    <Button className='btn btn-secondary-modal' onClick={handleClean}>
                                        <FontAwesomeIcon icon={faBroom} className="text-title" />&nbsp;Limpiar
                                    </Button>
                                    <Button className='btn btn-primary-modal' onClick={handleSubmitPhotos}>
                                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-title" />&nbsp;Subir
                                    </Button>
                                </div>
                            </div>
                            :
                            <div className="my-2">
                                {!isSuccess?
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="d-flex flex-row justify-content-center align-items-center">
                                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />
                                            <h6 className='p-0 m-0'>&nbsp;{files.length > 1? "Subiendo fotos..." : "Subiendo foto..."}</h6>
                                            <h6 className='text-tertiary p-0 m-0'>{isSuccess? 100 : Math.floor(progress)}%</h6>
                                        </div>
                                    </div>
                                    :
                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                        <div className='d-flex flex-row justify-content-center align-items-center'>
                                            <FontAwesomeIcon icon={faCheck} className="text-title"/>
                                            <h6 className='p-0 m-0'>&nbsp;{files.length > 1? "¡Fotos subidas con éxito!" : "¡Foto subida con éxito!"}</h6>
                                        </div>
                                        <Button className='d-flex flex-row align-items-center btn btn-primary-modal mt-2' style={{width: 'fit-content'}} onClick={()=>{props.handleCloseModal()}}>
                                            <ChevronLeftIcon/>Volver al álbum
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