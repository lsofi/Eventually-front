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
import Placeholder from "react-bootstrap/Placeholder";
import CloseButton from "react-bootstrap/CloseButton";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faBroom, faCheck, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotosUploadModal from './PhotosUploadModal';
import { getFormattedSize } from '../../shared/shared-methods.util';
import YesNoConfirmationModal from './YesNoConfirmationModal';
import InfoModal from './InfoModal';
import LoadingModal from './LoadingModal';
import { Dropdown, Pagination } from 'react-bootstrap';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function PhotosViewModal ( props ) {

    const [ photos, setPhotos ] = useState([]);
    const [ page, setPage ] = useState(1);
    const [ selectedPhotos, setSelectedPhotos ] = useState([]);
    const [ totalPhotos, setTotalPhotos ] = useState(0);
    const [ totalSize, setTotalSize ] = useState(0);
    const [ loading, setLoading ] = useState(0);
    const [ infoModal, setInfoShowModal ] = useState({showModal: false});
    const [ showPhotosUploadModal, setShowPhotosUploadModal ] = useState(false);
    const [ deletePhotoConfirmationModal, setDeletePhotoConfirmationModal ] = useState({showModal: false});

    const amountPerPage = 10;

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            <FontAwesomeIcon icon={faEllipsisVertical} className="text-title"/>
            {children}
        </a>
    ));

    useEffect(()=>{
        setPhotos([]);
        setSelectedPhotos([]);
        setTotalPhotos(0);
        setTotalSize(0);
        if(props.showModal){
            getPhotos(page, amountPerPage);
        }

    }, [props.showModal])

    const getPhotos = async (page, limit) => {
        setPage(page);
        setLoading(prev => prev+1)
        try{
            const res = await axios.get(`../api/photos/getPhotos?event_id=${props.event_id}&skip=${page}&limit=${limit}`)
            console.log("Response", res.data)
            let { count, photos, total_size } = res.data;
            /* console.log("Número de fotos", count)
            console.log("Fotos traídas en esta página", photos)
            console.log("Fotos que están seleccionadas", selectedPhotos) */
            photos.forEach(photo => {
                if(selectedPhotos.some((sp) => {return photo._id===sp._id})){
                    photo.isSelected = true;
                }
                else {
                    photo.isSelected = false;
                }
            });
            // console.log("Fotos después del filtro de si están seleccionadas", photos)
            setPhotos(photos);
            setTotalPhotos(count);
            setTotalSize(total_size);
        }
        catch(error){
            console.log(error);
        }
        setLoading(prev => prev-1)
    }

    const getPhotosPage = ( pageNumber ) => {
        if (pageNumber === page) return;
        getPhotos(pageNumber, amountPerPage);
    }

    const getPages = () => {
        const cantPages = Math.ceil(totalPhotos / amountPerPage);
        const arr = [];
        for (let index = 0; index < cantPages; index++) {
            arr.push(index + 1);
        }
        return arr
    }

    const pages = getPages();

    const handleClean = () => {
        setSelectedPhotos([]);
        setPhotos(photos.map(p => {
            return({...p, isSelected: false})
        }))
    }

    const handleSelectPhoto = (photo) => {
        /* console.log('Selección de foto')
        console.log('Foto antes de ser seleccionada', photo) */
        if(photo.isSelected){
            setSelectedPhotos(selectedPhotos.filter(sp => sp._id !== photo._id));
        }
        else setSelectedPhotos([...selectedPhotos, photo]);
        setPhotos(photos.map(p => {
            if(p._id === photo._id){
                return({...p, isSelected: !(p.isSelected)})
            }
            else return(p)
        }))
        
        // console.log('Foto después de ser seleccionada', photo)
    }

    const handleDeletePhotos = async () => {
        setSelectedPhotos([]);
        let infoMessage;
        if(deletePhotoConfirmationModal.photos.length == 1)
            infoMessage = "¡Foto eliminada con éxito!";
        else
            infoMessage = "¡Fotos eliminadas con éxito!";
        setDeletePhotoConfirmationModal(
                {...deletePhotoConfirmationModal, showModal: false}
        )
        let totalDeleteSize = 0;
        const deletePhotosIds = deletePhotoConfirmationModal.photos.map(p => {
            // acumulo el tamaño de los archivos en un contador para enviarlo al back
            totalDeleteSize += p.size;
            return p._id
            } 
        )
        const params = {
            event_id: props.event_id,
            photos_id: deletePhotosIds,
            total_size: totalDeleteSize
        }
        setLoading(prev => prev+1)
        try{
            const res = await axios.delete('../api/photos/deletePhoto', {data: params})
            setInfoShowModal({showModal: true, message: infoMessage});
            setDeletePhotoConfirmationModal({
                showModal: false
            });
            // console.log(res)
        }
        catch(error){
            console.log(error)
        }
        setLoading(prev => prev-1)
    }

    const downloadURL = (url, name) => {
        const link = document.createElement('a');
        // console.log('URL del archivo: ', url);
        // console.log('Nombre del archivo: ', name);
        link.download = name;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDownloadPhotos = (photos) => {
        if(photos.length > 1){
            handleDownloadZip(photos)
        }
        else downloadURL(photos[0].photoUrl, photos[0].originalname)
    }

    const handleDownloadZip = async (photos) => {
        const photosDownloadInfo = photos.map(p => {return {key: p.key, name: p.originalname}} )
        const params = {
            photos_info: photosDownloadInfo
        }
        //console.log(params)
        //hay que ver de deseleccionar en los items también setSelectedPhotos([]);
        setLoading(prev => prev+1)
        try{
            //const res = await axios.post('../api/photos/downloadPhotos', params);
            await axios({
                url: '../api/photos/downloadPhotos',
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
                    a.download = filename || 'fotos.zip';
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

    const onDeletePhotos = (photos) => {
        let message;
        if(photos.length === 1) {
            message = `¿Está seguro/a de eliminar la foto "${photos[0].originalname}" del álbum?`;
        }
        else {
            message = `¿Está seguro/a de eliminar las ${photos.length} fotos seleccionadas del álbum?`;
        }

        setDeletePhotoConfirmationModal(
            {
                title: "Eliminar fotos",
                message: message,
                photos: photos,
                showModal: true
            }
        )
    }

    return (
        <>
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" className='Modal' size="xl">
            <Modal.Header className='mx-2'>
                <Modal.Title>Álbum de fotos</Modal.Title>
                <div className='d-flex align-items-center gap-3'>
                    {props.permissions.SAVE_PHOTO?
                    <Button className="d-flex px-1 btn btn-primary-modal" style={{'borderRadius': '0.5rem'}} onClick={()=> {setShowPhotosUploadModal(true); props.handleCloseModal()}}>
                        <AddPhotoAlternateRoundedIcon/>Agregar fotos
                    </Button>
                    :
                    null
                    }
                    <CloseButton onClick={props.handleCloseModal}></CloseButton>
                </div>
            </Modal.Header>
            {/* <hr className="mt-0"/> */}
            <Modal.Body className='pt-0'>
                <div className="mt-2 mx-2">
                    <div className="d-flex flex-row justify-content-between">
                        <div className="d-flex flex-row align-items-center">
                            <h4>Fotos&nbsp;</h4>
                            {loading ?
                            <Spinner as="h5" animation="border" role="status" size='sm' aria-hidden="true"/>
                            :
                            <h5 className='text-tertiary'>{totalPhotos}</h5>
                            }
                        </div>
                        <div className="d-flex flex-row align-items-center">
                            <h4>Total ocupado&nbsp;</h4>
                            {loading ?
                            <Spinner as="h5" className='mx-3' animation="border" role="status" size='sm' aria-hidden="true"/>
                            :
                            <h5 className='text-tertiary'>{ (Math.round(totalSize*100))/100} MB</h5>
                            }
                        </div>
                    </div>
                    {/* <hr className="mt-0" /> */}
                    {loading?
                    <div className="d-flex flex-column gap-1" style={{ maxHeight: "30rem", overflowY: "auto" }}>
                    <Row xs={1} md={2} lg={3} className='m-0 g-4'>
                        {[1,2,3].map((number) => {
                            return (
                                <Card key={number} className='m-0 p-0'>
                                    <Placeholder animation="wave" className="rounded" 
                                        style={{backgroundColor: 'var(--text-ultra-muted)', width: '100%', aspectRatio: '1/1' }}
                                    />
                                    <Card.Body className='d-flex flex-row justify-content-between py-2 px-3'>
                                        <Card.Text className='m-0 d-flex flex-column'>
                                            {/*<h6>asdfasdf</h6>*/}
                                            <Placeholder animation="wave" className="mb-2 rounded"
                                                style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.5rem', width: '10rem' }}
                                            />
                                            <Placeholder animation="wave" className="mb rounded"
                                                style={{ backgroundColor: 'var(--text-ultra-muted)', height: '1.25rem', width: '8rem' }}
                                            />                                            
                                        </Card.Text>
                                        <Dropdown>
                                            <Dropdown.Toggle as={CustomToggle} className="text-primary">
                                            </Dropdown.Toggle>
                                        </Dropdown>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </Row>
                </div>
                    :
                    photos.length === 0 ?
                        <h5>No hay fotos en el álbum</h5>
                        :
                        <div className="d-flex flex-column gap-1" style={{ maxHeight: "30rem", overflowY: "auto" }}>
                            <Row xs={1} md={2} lg={3} className='m-0 g-4'>
                                {photos.map((photo) => {
                                    return (
                                        <Card key={photo._id} className={photo.isSelected?'photos-view-selected m-0 p-0':'m-0 p-0'}>
                                            <Card.Img 
                                                className='photos-view-img' 
                                                variant='top' 
                                                src={photo.photoUrl? photo.photoUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6KDwElxUJaLARG4ve14It5XKKBHfFxOxL_jLuQCv7qKyZUH8LbjSDHaKqMzQIMfpL0Ro&usqp=CAU'} 
                                                onClick={() => handleSelectPhoto(photo)}/>
                                            <Card.Body className='d-flex flex-row justify-content-between py-2 px-3'>
                                                <Card.Text className='m-0'>
                                                    <h6>{photo.originalname}</h6>
                                                    <span>Tamaño: {getFormattedSize(photo.size)}</span>
                                                </Card.Text>
                                                <Dropdown>
                                                    <Dropdown.Toggle as={CustomToggle} className="text-primary">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align="end" style={{'minWidth': '0rem', 'borderRadius': '0.5rem'}} className="photos-view-menu py-0">
                                                        <Dropdown.Item className='px-1'>
                                                            <Button
                                                                className="d-flex w-100 align-items-center p-1 btn btn-primary-modal"
                                                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                                                onClick={()=>{ handleDownloadPhotos([photo]) }}
                                                            >
                                                                <FileDownloadOutlinedIcon />
                                                                Descargar
                                                            </Button>
                                                        </Dropdown.Item>
                                                        {props.permissions.DELETE_PHOTO?
                                                        <Dropdown.Item className='pb-1 px-1 pt-0'>
                                                            <Button
                                                                className="d-flex w-100  align-items-center p-1 btn btn-danger"
                                                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                                                onClick={() => { onDeletePhotos([photo]) }}
                                                            >
                                                                <DeleteIcon />
                                                                Eliminar
                                                            </Button>
                                                        </Dropdown.Item>
                                                        :
                                                        null
                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </Row>
                        </div>
                    }
                    {selectedPhotos.length === 0?
                    null:
                    <div className='d-flex flex-row mt-2 me-2 gap-2 justify-content-end align-items-center'>
                        <h6 className='m-0'>{selectedPhotos.length} archivos seleccionados</h6>
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
                                onClick={()=>{ handleDownloadPhotos(selectedPhotos) }}
                            >
                                <FileDownloadOutlinedIcon />
                            </Button>
                            {
                            props.permissions.DELETE_PHOTO?
                            <Button
                                className="d-flex p-2 btn btn-danger"
                                style={{ 'borderRadius': '0.5rem', 'fontSize': '1rem' }}
                                onClick={() => { onDeletePhotos(selectedPhotos) }}
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
                                <Pagination.Item key={number} active={page === number} onClick={()=>getPhotosPage(number)}>{number}</Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        <PhotosUploadModal
            showModal={showPhotosUploadModal}
            handleCloseModal={()=> {setShowPhotosUploadModal(false); props.handleOpenModal() }}
            event_id={props.event_id}
        />
        <InfoModal
            showModal={infoModal.showModal}
            handleCloseModal={() => { setInfoShowModal({showModal: false}); getPhotos(1, amountPerPage)}}
            message={infoModal.message}
            img={SuccessPhoneGirl}
        />
        <YesNoConfirmationModal
            {...deletePhotoConfirmationModal}
            handleConfirm={handleDeletePhotos}
            handleCloseModal={()=>{setDeletePhotoConfirmationModal({showModal: false})}}
        />
        <LoadingModal
            showModal={loading}
        />
        </>
    )
}