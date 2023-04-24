import React, {useState, useEffect} from 'react';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from "react-bootstrap/Spinner";
import { Placeholder } from 'react-bootstrap';
import CloseButton from "react-bootstrap/CloseButton";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faBroom, faCheck, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import YesNoConfirmationModal from './YesNoConfirmationModal';
import { getFormattedSize } from '../../shared/shared-methods.util';
import InfoModal from './InfoModal';
import LoadingModal from './LoadingModal';
import FilesUploadModal from './FilesUploadModal';
import { Checkbox } from '@mui/material';
import { Pagination } from 'react-bootstrap';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function FilesViewModal ( props ) {

    const [ files, setFiles ] = useState([]);
    const [ page, setPage ] = useState(1);
    const [ selectedFiles, setSelectedFiles ] = useState([]);
    const [ totalFiles, setTotalFiles ] = useState(0);
    const [ totalSize, setTotalSize ] = useState(0);
    const [ loading, setLoading ] = useState(0);
    const [ infoModal, setInfoShowModal ] = useState({showModal: false});
    const [ showFilesUploadModal, setShowFilesUploadModal ] = useState(false);
    const [ deleteFileConfirmationModal, setDeleteFileConfirmationModal ] = useState({showModal: false})
    const amountPerPage = 10;

    useEffect(()=>{
        setFiles([]);
        setSelectedFiles([]);
        setTotalFiles(0);
        setTotalSize(0);
        if(props.showModal){
            getFiles(page, amountPerPage);
        }
    }, [props.showModal])
    
    const getFiles = async (page, limit) => {
        setPage(page);
        setLoading(prev => prev+1)
        try{
            const res = await axios.get(`../api/files/getFiles?event_id=${props.event_id}&skip=${page}&limit=${limit}`)
            const { count, files, total_size } = res.data;
            files.forEach(f => {
                if(selectedFiles.some(sf => {return sf._id === f._id}))
                    f.isSelected = true;
                else f.isSelected = false;
            });
            setFiles(files);
            setTotalFiles(count);
            setTotalSize(total_size);
        }
        catch(error){
            console.log(error);
        }
        setLoading(prev => prev-1)
    }

    const getFilesPage = ( pageNumber ) => {
        if (pageNumber === page) return;
        getFiles(pageNumber, amountPerPage);
    }

    const getPages = () => {
        const cantPages = Math.ceil(totalFiles / amountPerPage);
        const arr = [];
        for (let index = 0; index < cantPages; index++) {
            arr.push(index + 1);
        }
        return arr
    }

    const pages = getPages();

    const handleClean = () => {
        setSelectedFiles([]);
        setFiles(files.map(f => {
            return({...f, isSelected: false})
        }))
    }

    const handleDeleteFiles = async () => {
        setSelectedFiles([]);
        let infoMessage;
        if(deleteFileConfirmationModal.files.length == 1)
            infoMessage = "¡Archivo eliminado con éxito!";
        else
            infoMessage = "¡Archivos eliminados con éxito!";
        setDeleteFileConfirmationModal(
                {...deleteFileConfirmationModal, showModal: false}
        )
        let totalDeleteSize = 0;
        const deleteFilesIds = deleteFileConfirmationModal.files.map(f => {
            // acumulo el tamaño de los archivos en un contador para enviarlo al back
            totalDeleteSize += f.size;
            return f._id
            }
        )
        const params = {
            event_id: props.event_id,
            files_id: deleteFilesIds,
            total_size: totalDeleteSize
        }
        setLoading(prev => prev+1)
        try{
            const res = await axios.delete('../api/files/deleteFile', {data: params})
            setInfoShowModal({showModal: true, message: infoMessage});
            setDeleteFileConfirmationModal(
                {showModal: false}
            );
        }
        catch(error){
            console.log(error)
        }
        setLoading(prev => prev-1)
    }

    const downloadURL = (url, name) => {
        const link = document.createElement('a');
        link.download = name;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDownloadFiles = (files) => {
        if(files.length > 1){
            handleDownloadZip(files)
        }
        else downloadURL(files[0].fileUrl, files[0].originalname)
    }

    const handleDownloadZip = async (files) => {
        const filesDownloadInfo = files.map(f => {return {key: f.key, name: f.originalname}} )
        const params = {
            files_info: filesDownloadInfo
        }
        // console.log(params)
        // hay que ver de deseleccionar en los items tambiénsetSelectedFiles([]);
        setLoading(prev => prev+1)
        try{
            await axios({
                url: '../api/files/downloadFiles',
                method: 'POST',
                responseType: 'blob',
                data: params
            })
                .then(response => {
                    let contentDisposition = response.headers['content-disposition']
                    const filename = contentDisposition.split(' ')[1].split('=')[1]
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename || 'archivos.zip';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                });
        }
        catch(error){
            console.log(error)
        }
        setLoading(prev => prev-1)
    }

    const handleSelectFile = (f) => {
        if(f.isSelected){
            setSelectedFiles(selectedFiles.filter(sf => sf._id !== f._id));
        }
        else setSelectedFiles([...selectedFiles, f]);

        setFiles(files.map(file => {
            if(file._id === f._id){
                return({...file, isSelected: !(file.isSelected)})
            }
            else return(file)
        }))
    }

    const onDeleteFiles = (files) => {
        let message;
        if(files.length === 1) {
            message = `¿Está seguro/a de eliminar el archivo "${files[0].originalname}" de la carpeta?`;
        }
        else {
            message = `¿Está seguro/a de eliminar los ${files.length} archivos seleccionados de la carpeta?`;
        }
        setDeleteFileConfirmationModal(
            {
                title: "Eliminar archivos",
                message: message,
                files: files,
                showModal: true
            }
        )
    }
    
    return (
        <>
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size="xl">
            <Modal.Header className='mx-2'>
                <Modal.Title>Carpeta de Archivos</Modal.Title>
                <div className='d-flex align-items-center gap-3'>
                    {props.permissions.SAVE_FILES?
                        <Button className="d-flex px-1 btn btn-primary-modal" style={{'borderRadius': '0.5rem'}} onClick={()=> {setShowFilesUploadModal(true); props.handleCloseModal()}}>
                            <CreateNewFolderRoundedIcon/>Agregar archivos
                        </Button>
                        :
                        null
                    }
                    <CloseButton onClick={props.handleCloseModal}></CloseButton>
                </div>
            </Modal.Header>
            {/* <hr className="mt-0" /> */}
            <Modal.Body className='pt-0'>
                <div className="mt-2 mx-2">
                    <div className="d-flex flex-row justify-content-between">
                        <div className="d-flex flex-row align-items-center">
                            <h4>Archivos&nbsp;</h4>
                            {loading ?
                            <Spinner as="h5" animation="border" role="status" size='sm' aria-hidden="true"/>
                            :
                            <h5 className='text-tertiary'>{totalFiles}</h5>
                            }
                        </div>
                        <div className="d-flex flex-row align-items-center">
                            <h4>Total ocupado&nbsp;</h4>
                            {loading ?
                            <Spinner as="h5" className='mx-3' animation="border" role="status" size='sm' aria-hidden="true"/>
                            :
                            <h5 className='text-tertiary'>{(Math.round(totalSize * 100)) / 100} MB</h5>
                            }
                        </div>
                    </div>
                    {/* <hr className="mt-0" /> */}
                    {loading ?
                        <div className="d-flex flex-column gap-1" style={{ maxHeight: "30rem", overflowY: "auto" }}>
                            {[1, 2, 3].map((number) => {
                                return (
                                    <Card key={number} className='m-0'>
                                        <Card.Body>
                                            <Row>
                                                <Col lg={6} className="d-flex flex-row justify-content-start">
                                                    <div className="d-flex align-items-end">
                                                        <Checkbox inputProps={{ 'aria-label': 'select-checkbox' }} checked={false} />
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <span className="text-tertiary">Nombre</span>
                                                        <Placeholder animation="wave" className="mb-2 rounded"
                                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.75rem', width: '10rem' }}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={3} className="text-center-large border-left-large">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <span className="text-tertiary">Tamaño</span>
                                                        <Placeholder animation="wave" className="mb-2 rounded"
                                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.75rem', width: '4rem' }}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={3} className="d-flex flex-column align-items-center border-left-large">
                                                    <span className="text-tertiary">Acciones</span>
                                                    <div className='d-flex gap-2'>
                                                        <Placeholder animation="wave" className=""
                                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: '2rem', borderRadius: '0.5rem' }}
                                                        />
                                                        {props.permissions.DELETE_FILE ?
                                                            <Placeholder animation="wave" className=""
                                                            style={{ backgroundColor: 'var(--text-ultra-muted)', height: '2rem', width: '2rem', borderRadius: '0.5rem' }}
                                                            />
                                                            :
                                                            null
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    :
                    files.length === 0 ?
                        <h5>No hay archivos en la carpeta.</h5>
                        :
                        <div className="d-flex flex-column gap-1" style={{ maxHeight: "30rem", overflowY: "auto" }}>
                            {files.map((file) => {
                                return (
                                    <Card key={file.key} className='m-0'>
                                        <Card.Body>
                                            <Row>
                                                <Col lg={6} className="d-flex flex-row justify-content-start">
                                                    <div className="d-flex align-items-end">
                                                        <Checkbox inputProps={{'aria-label': 'select-checkbox'}} checked={file.isSelected} onChange={()=>handleSelectFile(file)}/>
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <span className="text-tertiary">Nombre</span>
                                                        <h5>{file.originalname}</h5>
                                                    </div>
                                                    
                                                </Col>
                                                <Col lg={3} className="text-center-large border-left-large">
                                                    <span className="text-tertiary">Tamaño</span>
                                                    <h5>{getFormattedSize(file.size)}</h5>
                                                </Col>
                                                <Col lg={3} className="d-flex flex-column align-items-center border-left-large">
                                                    <span className="text-tertiary">Acciones</span>
                                                    <div className='d-flex gap-2'>
                                                        <Button className="d-flex justify-content-center align-items-center p-1 btn btn-primary-modal" style={{'borderRadius': '0.5rem'}} onClick={()=>{ console.log("click");handleDownloadFiles([file]) }}>
                                                            <FileDownloadOutlinedIcon/>
                                                        </Button>
                                                        {props.permissions.DELETE_FILE?
                                                            <Button className="d-flex justify-content-center align-items-center p-1 btn btn-danger" style={{'borderRadius': '0.5rem'}} onClick={()=>{onDeleteFiles([file])}}>
                                                                <DeleteIcon/>
                                                            </Button>
                                                            :
                                                            null
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    }
                    {selectedFiles.length === 0?
                    null:
                    <div className='d-flex flex-row mt-2 me-2 gap-2 justify-content-end align-items-center'>
                        <h6 className='m-0'>{selectedFiles.length} archivos seleccionados</h6>
                        <div className='d-flex flex-row gap-1'>
                            <Button 
                                className='d-flex align-items-center p-2 btn btn-secondary-modal'
                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                onClick={handleClean}
                            >
                                <FontAwesomeIcon icon={faBroom} className="text-title" />
                            </Button>
                            <Button
                                className="d-flex p-2 btn btn-primary-modal"
                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                onClick={()=>{ handleDownloadFiles(selectedFiles) }}
                            >
                                <FileDownloadOutlinedIcon />
                            </Button>
                            {
                            props.permissions.DELETE_FILE?
                            <Button
                                className="d-flex p-2 btn btn-danger"
                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                onClick={() => { onDeleteFiles(selectedFiles) }}
                            >
                                <DeleteIcon />
                            </Button>
                            :
                            null
                            }
                        </div>
                    </div>
                    }
                    <div className='d-flex flex-row justify-content-center'>
                        <Pagination className='my-1'>
                            {pages.map((number)=>(
                                <Pagination.Item key={number} active={page === number} onClick={()=>getFilesPage(number)}>{number}</Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        <FilesUploadModal
            showModal={showFilesUploadModal}
            handleCloseModal={()=> {setShowFilesUploadModal(false); props.handleOpenModal() }}
            event_id={props.event_id}
        />
        <InfoModal
            showModal={infoModal.showModal}
            handleCloseModal={() => { setInfoShowModal({showModal: false}); getFiles(1, amountPerPage)}}
            message={infoModal.message}
            img={SuccessPhoneGirl}
        />
        <YesNoConfirmationModal
            {...deleteFileConfirmationModal}
            handleConfirm={handleDeleteFiles}
            handleCloseModal={()=>{setDeleteFileConfirmationModal({showModal: false})}}
        />
        <LoadingModal
            showModal={loading}
        />
        </>
    )
}