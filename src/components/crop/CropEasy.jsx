import { Dialog, DialogActions, DialogContent, Typography, Slider} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react'
import { useState } from 'react'
import { Button } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/CropImage';


const CropEasy = ({photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto, aspect_ratio, round, setModalLoading}) => {
    const [crop, setCrop] = useState({x:0, y:0});
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const cropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const cropImage = async () => {
        try{
            if (setModalLoading) setModalLoading(prev=>prev+1);
            const {file, url} = await getCroppedImg(photoURL, croppedAreaPixels, rotation)
            setPhotoURL(url);
            setPhoto(url);
            setOpenCrop(false);
            if (setModalLoading) setModalLoading(prev=>prev-1);
            submitPhoto(file);
        } catch (error){
            console.log(error);
        }
    }

    return (
        <Dialog open={true}>
            <DialogContent dividers 
            sx={{
                background:"#333", 
                position:"relative", 
                height:400, 
                width:"auto", 
                minWidth:{sm:500},
            }}>
                <Cropper
                image={photoURL}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect_ratio}
                cropShape={round? "round": ""}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropChange={setCrop}
                onCropComplete={cropComplete}
                />
            </DialogContent>
            <DialogActions sx={{ flexDirection:"column", px:3, py:2 }} style={{backgroundColor: 'var(--card)'}}>
                <Box sx={{mb:1}} className="w-80-sm">
                    <Typography>Zoom: {zoomPercent(zoom)}</Typography>
                    <Slider valueLableDisplay="auto" step={0.05} valueLableFormat={zoomPercent} min={1} max={3} value={zoom} onChange={(e, zoom) => setZoom(zoom)}/>
                </Box>
                <Box sx={{mb:1}} className="w-80-sm">
                    <Typography>Rotación: {rotation}</Typography>
                    <Slider valueLableDisplay="auto" min={0} step={5} max={360} value={rotation} onChange={(e, rotation) => setRotation(rotation)}/>
                </Box>
                <Box sx={{ display:"flex", gap:2, flexWrap: "wrap" }}>
                    <Button className="btn-secondary-modal px-3" onClick={()=>setOpenCrop(false)}>
                        Cancelar
                    </Button>
                    <Button className="btn-primary-modal px-3" onClick={cropImage}>
                        Confirmar
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default CropEasy

const zoomPercent = (value) =>{
    return `${Math.round(value *100)}%`
}