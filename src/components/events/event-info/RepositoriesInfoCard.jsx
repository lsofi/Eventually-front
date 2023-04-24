import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import InfoModal from '../../modals/InfoModal';
import { Spinner } from 'react-bootstrap';
import PhotosViewModal from '../../modals/PhotosViewModal';
import FilesViewModal from '../../modals/FilesViewModal';
import YesNoConfirmationModal from '../../modals/YesNoConfirmationModal';

import SuccessPhoneGirl from "../../../resources/images/SuccessPhoneGirl.png";

export default function RepositoriesInfoCard (props) {

    const [ infoModal, setInfoModal ] = useState({showModal: false});
    const [ loadingPhotos, setLoadingPhotos ] = useState(false);
    const [ loadingFiles, setLoadingFiles ] = useState(false);
    const [ showPhotosViewModal, setShowPhotosViewModal ] = useState(false);
    const [ showFilesViewModal, setShowFilesViewModal ] = useState(false);
    const [ deleteConfirmationModal, setDeleteConfirmationModal ] = useState({showModal: false});

    const helpText = 'En esta tarjeta podrás crear y acceder a un respositorio de archivos y un álbum de fotos.';

    const handleGenerateAlbum = async () => {
        try {
            console.log('Event id a mandar: ', props.event.event_id)
            setLoadingPhotos(true);
            const config = { headers: {'event_id': props.event.event_id} };
            await axios.post('../api/photos/generatePhotoAlbum', {}, config);
            setInfoModal({showModal: true, message: '¡Álbum de fotos generado con éxito!'});
        }
        catch(err){
            //TODO hacer el manejo de errores, preguntarle a Kako sobre los carteles de errores
            console.log(err)
        }
        setLoadingPhotos(false);
    }

    const handleGenerateRepository = async () => {
        try {
            console.log('Event id a mandar: ', props.event.event_id)
            setLoadingFiles(true);
            const config = { headers: {'event_id': props.event.event_id} };
            await axios.post('../api/files/generateFilesRepository', {}, config);
            setInfoModal({showModal: true, message: '¡Carpeta de archivos generada con éxito!'});
        }
        catch(err){
            //TODO hacer el manejo de errores, preguntarle a Kako sobre los carteles de errores
            console.log(err)
        }
        setLoadingFiles(false);
    }

    const handleDeleteRepository = async () => {
        setDeleteConfirmationModal({showModal: false});
        try {
            console.log('Event id donde borrar la carpeta: ', props.event.event_id);
            const config = { headers: {'event_id': props.event.event_id}}
            await axios.put('../api/files/deleteFilesRepository', {}, config);
            setInfoModal({showModal: true, message: '¡Carpeta de archivos eliminada con éxito!'});
        }
        catch(err){
            console.log(err)
        }
    }

    const onDeleteRepository = () => {
        const message = "¿Está seguro/a de eliminar la carpeta de archivos? Se perderán todos los archivos en su interior."
        setDeleteConfirmationModal({
            title: 'Eliminar carpeta',
            message: message,
            handleCloseModal: () => {setDeleteConfirmationModal({showModal: false})},
            handleConfirm: () => {handleDeleteRepository()},
            showModal: true
        })
    }

    const handleDeleteAlbum = async () => {
        setDeleteConfirmationModal({showModal: false});
        try {
            console.log('Event id donde borrar el álbum: ', props.event.event_id);
            const config = { headers: {'event_id': props.event.event_id}}
            await axios.put('../api/photos/deletePhotoAlbum', {}, config);
            setInfoModal({showModal: true, message: '¡Álbum de fotos eliminado con éxito!'});
        }
        catch(err){
            console.log(err)
        }
    }

    const onDeletePhotos = () => {
        const message = "¿Está seguro/a de eliminar el álbum de fotos? Se perderán todas las fotos subidas."
        setDeleteConfirmationModal({
            title: 'Eliminar álbum de fotos',
            message: message,
            handleCloseModal: () => {setDeleteConfirmationModal({showModal: false})},
            handleConfirm: () => {handleDeleteAlbum()},
            showModal: true
        })
    }

    return (
        <>
            <div className="info-card" style={{gridRow: 'span 2'}}>
                <div className='d-flex gap-3 align-items-center'>
                    <h4 className="mb-0">Fotos y Archivos</h4>
                    <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                    </OverlayTrigger>
                </div>
                <hr className="mx-0 my-1" style={{ height: '2px' }} />
                <div>
                    <div className="d-flex flex-column justify-content-center gap-2">
                        {!props.event.photo_album && props.event.permissions.CREATE_PHOTO_ALBUM ?
                            <Button disabled={loadingPhotos} className="btn-primary-modal" onClick={handleGenerateAlbum}>
                                {!loadingPhotos ?
                                    'Generar álbum de fotos'
                                    :
                                    <>
                                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />&nbsp;Generando álbum de fotos...
                                    </>
                                }
                            </Button>
                            :
                            null
                        }
                        {
                            props.event.photo_album && props.event.permissions.VIEW_PHOTOS ?
                                <Card className='m-0'>
                                    <Card.Body>
                                        <Row>
                                            <Col xs={8} className="d-flex align-items-center">
                                                <h5 className='m-0 text-muted'>Álbum de fotos</h5>
                                            </Col>
                                            <Col xs={4} className="d-flex flex-column align-items-center">
                                                <div className='d-flex gap-3'>
                                                    <Button className="px-2 py-0 btn btn-primary-modal" style={{'fontSize': '0.9rem','borderRadius': '0.5rem' }} onClick={() => { setShowPhotosViewModal(true) }}>
                                                        <VisibilityIcon/>
                                                    </Button>
                                                    {props.event.permissions.DELETE_PHOTO_ALBUM?
                                                    <Button className="delete-btn px-1" title="Eliminar álbum de fotos" style={{ 'borderRadius': '1rem' }} onClick={onDeletePhotos} >
                                                        <FontAwesomeIcon icon={faTimesCircle}/>
                                                    </Button>
                                                    :
                                                    null
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                :
                                null
                        }
                        {!props.event.files_repository && props.event.permissions.CREATE_FILE_REPOSITORY ?
                            <Button disabled={loadingFiles} className="btn-primary-modal" onClick={handleGenerateRepository}>
                                {!loadingFiles ?
                                    'Generar carpeta de archivos'
                                    :
                                    <>
                                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true" />&nbsp;Generando carpeta...
                                    </>
                                }
                            </Button>
                            :
                            null
                        }
                        {
                            props.event.files_repository && props.event.permissions.VIEW_FILES ?
                                <Card className='m-0'>
                                    <Card.Body>
                                        <Row>
                                            <Col xs={8} className="d-flex align-items-center">
                                                <h5 className='m-0 text-muted'>Carpeta de archivos</h5>
                                            </Col>
                                            <Col xs={4} className="d-flex flex-column align-items-center">
                                                <div className='d-flex gap-3'>
                                                    <Button className="px-2 py-0 btn btn-primary-modal" style={{ 'fontSize': '0.9rem', 'borderRadius': '0.5rem' }} onClick={()=>{ setShowFilesViewModal(true) }}>
                                                        <VisibilityIcon />
                                                    </Button>
                                                    {props.event.permissions.DELETE_FILE_REPOSITORY?
                                                        <Button className="delete-btn px-1" title="Eliminar carpeta de archivos" style={{ 'borderRadius': '1rem' }} onClick={onDeleteRepository}>
                                                            <FontAwesomeIcon icon={faTimesCircle}/>
                                                        </Button>
                                                        :
                                                        null
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                :
                                null
                        }
                    </div>
                </div>
            </div>
            <YesNoConfirmationModal
                {...deleteConfirmationModal}
            />
            <InfoModal
                showModal={infoModal.showModal}
                handleCloseModal={() => { setInfoModal({ ...infoModal, showModal: false }); props.reloadEvent() }}
                message={infoModal.message}
                img={SuccessPhoneGirl}
            />
            <PhotosViewModal
                showModal={showPhotosViewModal}
                event_id={props.event.event_id}
                permissions={props.event.permissions}
                handleCloseModal={()=>{ setShowPhotosViewModal(false) }}
                handleOpenModal={()=>{ setShowPhotosViewModal(true) }}
                />
            <FilesViewModal
                showModal={showFilesViewModal}
                event_id={props.event.event_id}
                permissions={props.event.permissions}
                handleCloseModal={()=>{ setShowFilesViewModal(false) }}
                handleOpenModal={()=>{ setShowFilesViewModal(true) }}
            />
        </>
    );
}