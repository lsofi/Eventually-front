import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import { useJsApiLoader, GoogleMap, MarkerF} from '@react-google-maps/api'
import LoadingModal from './LoadingModal';
import { getCoordinates, getAddressAll } from '../../services/map.service';
import eventuallyMarker from '../../resources/images/eventually-marker.png'
import startingPointMarker from '../../resources/images/starting-point-marker.png'


const mapUrl = `https://maps.googleapis.com/maps/api/js?v=3.exp`;

const AnyReactComponent = ({ text }) => <div>{text}</div>;

const centroCordobaLatLng = { lat: -31.420011, lng: -64.188823 };

const axiosApi = axios.create();

export default function MapModal( props ){

    const [ markerPosition, setMarkerPosition ] = useState(undefined);
    const [ positionChanged, setPositionChanged ] = useState(false);

    useEffect(()=>{
        if (!props.showModal) return;
        if (props.address && props.address.coordinates) setMarkerPosition(JSON.parse(props.address.coordinates))
        if (props.address && props.formChanged) setCoordinates(props.address); 
    }, [props.showModal])

    const darkMode = document.body.classList.contains('dark');

    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: decodeURI(apiKey).trim()
    })

    const getLatitudeLongitude = (event) => {
        if (!props.modify) return;
        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();

        const latLng = {lat: latitude, lng: longitude};

        // getAddress(latLng);
        setPositionChanged(true);
        setMarkerPosition(latLng);
    }

    const setCoordinates = async (address) => {
        const coordinates = await getCoordinates(address);
        if (!coordinates) return;
        const addressObj = {...props.address, coordinates: JSON.stringify(coordinates)};
        setMarkerPosition(coordinates);
        props.handleSetAddress(addressObj);
    }

    const setAddressAll = async (latLng) => {
        const address = await getAddressAll(latLng);
        
        if (props.address && props.address.alias) address.alias = props.address.alias;
        props.handleSetAddress(address);
    }

    const handleClose = () => {
        setPositionChanged(false);
        props.handleCloseModal();
    }

    const handleConfirm = () => {
        if (markerPosition && markerPosition.lat && markerPosition.lng && positionChanged && props.modify) setAddressAll(markerPosition);
        setPositionChanged(false);
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={handleClose} size="xl" style={{zIndex: '10000'}}>
            {!props.modify?
                <Modal.Header className="d-flex justify-content-end px-4 py-3">
                    <CloseButton onClick={handleClose}/>
                </Modal.Header> : null}
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <div style={{height: '80vh', width: '100%'}}>
                    {!isLoaded?
                    <h2>Cargando Mapa...</h2> 
                    :
                    <div style={{ height: '80vh', width: '100%' }}>
                        <GoogleMap
                            mapContainerClassName='map-container'
                            mapContainerStyle={{width: '100%', height: '100%'}}
                            center={markerPosition? markerPosition: centroCordobaLatLng}
                            zoom={markerPosition? 15: 13}
                            onClick={getLatitudeLongitude}
                            options={{streetViewControl: false, mapTypeControl: false}}>
                            <MarkerF position={markerPosition}/>
                            {props.eventAddress && props.eventAddress.coordinates?
                                <MarkerF 
                                    icon={{
                                        url: eventuallyMarker
                                    }} 
                                    title='Evento'
                                    position={JSON.parse(props.eventAddress.coordinates)}/>
                            :null}
                            {props.startingPointAddress && props.startingPointAddress.coordinates?
                                <MarkerF 
                                    icon={{
                                        url: startingPointMarker
                                    }} 
                                    title='Punto de partida'
                                    position={JSON.parse(props.startingPointAddress.coordinates)}/>
                            :null}
                        </GoogleMap>
                    </div>
                    }
                </div>
            </Modal.Body>
            {props.modify?<Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                    Guardar
                </Button>
            </Modal.Footer> : null}
        </Modal>
    );
}