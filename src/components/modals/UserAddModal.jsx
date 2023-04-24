import React, { useCallback, useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { AsyncTypeahead, Highlighter } from 'react-bootstrap-typeahead';
import axios from 'axios';

import DefaultProfilePhotoDog from "../../resources/images/DefaultProfilePhotoDog.png";

export default function UserAddModal( props ) {
    
    const [ linkCopied, setLinkCopied ] = useState(false);
    const [ linkGenerated, setLinkGenerated ] = useState(false);
    const [ options, setOptions ] = useState([]);
    const [ searchIsLoading, setSearchIsLoading ] = useState(false);
    const [ username, setUsername ] = useState("");

    const handleSearch = useCallback(async (query) => {
        setSearchIsLoading(true);
        try{
            let res = await axios.get(`../api/user/getUsersWithFilter?user=${query}`);
            setOptions(res.data);
        }
        catch(err){
            console.log(err)
            setOptions([]);
        }
        setSearchIsLoading(false);
    }, []);

    useEffect(()=> {
        // if (props.showModal && props.showInviteLink) {
        //     props.handleInviteLink()
        // }
        setLinkCopied(false);
        setLinkGenerated(false);
        setOptions([])
    }, [props.showModal])

    const copyToClipboard = (text) => {
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData("Text", text);
    
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            let textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return prompt("Copy to clipboard: Ctrl+C, Enter", text);
            }
            finally {
                document.body.removeChild(textarea);
            }
        }
    }

    const generateLink = () => {
        try{
            props.handleInviteLink();
            setLinkGenerated(true);
        }
        catch(err){
            console.log(error)
        }
    }

    const handleCopyLink = () => {
        //navigator.clipboard.writeText(props.inviteLink)
        copyToClipboard(props.inviteLink)
        setLinkCopied(true);
    }

    const handleWhatsAppPress = () => {
        const message = `Hola, te invito a mi evento "${props.eventTitle}": ${props.inviteLink}`; // replace with the message you want to send
        const mobileUrl = `whatsapp://send?text=${message}`;

        if (navigator.share && navigator.canShare({ mobileUrl })) {
            navigator.share({
            title: '',
            text: message,
            mobileUrl,
        });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }
    }

    const filterBy = () => true;

    return (
        <Modal show={props.showModal} onHide={props.handleCancel} backdrop="static" className='Modal'>
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center user-add-modal">
                <h5 className="text-center">{props.message}</h5>
                <Form style={{width: '90%'}} onSubmit={props.handleConfirm}>
                    <Form.Group>
                        <Form.Label>Nombre de usuario o email</Form.Label>
                        <AsyncTypeahead
                            delay={200}
                            emptyLabel="No se encontraron usuarios."
                            filterBy={filterBy}
                            highlightOnlyResult={true}
                            id="username-typeahead"
                            isLoading={searchIsLoading}
                            isInvalid={ !!props.errors }
                            labelKey="username"
                            minLength={3}
                            onChange={(selected)=> {if(!!selected[0]) props.handleOnChange(selected[0].username)}}
                            onInputChange={(t) => {props.handleOnChange(t)}}
                            onSearch={handleSearch}
                            options={options}
                            placeholder="Ingresá el nombre de usuario o email a agregar"
                            searchText="Buscando usuarios..."
                            renderMenuItemChildren={(option, props) => (
                                <div key={option._id} className='d-flex flex-row align-items-center gap-1'>
                                    <img src={option.small_photo? option.small_photo : DefaultProfilePhotoDog} className="option-photo"/>
                                    <div className='d-flex flex-column'>
                                        <div className="d-flex flex-row align-items-center bold text-tertiary" style={{fontSize: "1rem"}}>
                                            <Highlighter search={props.text}>
                                                {`@${option.username}`}
                                            </Highlighter>
                                        </div>
                                        <div className="d-flex flex-row align-items-center text-title" style={{fontSize: "0.9rem"}}>
                                            <Highlighter search={props.text}>
                                                {`${option.name} ${option.lastname}`}
                                            </Highlighter>
                                        </div>
                                    </div>
                                </div>
                            )
                            }
                        />
                        <span className="text-danger">{props.errors}</span>
                        {/* <Form.Control 
                            type="text" 
                            name="user"
                            isInvalid={ !!props.errors }
                            placeholder="Ingrese el nombre de usuario o email a agregar" 
                            onChange={props.handleOnChange}
                            maxLength={50}
                        /> */}
                        {/* <Form.Control.Feedback type="invalid">{props.errors}</Form.Control.Feedback> */}
                    </Form.Group>

                    {// Si se tiene que mostrar el showInviteLink
}
                    {props.showInviteLink?
                        <Form.Group>
                            <Form.Label className='mt-2'>O puedes usar un link de invitación:</Form.Label>
                            <div className='d-flex flex-row justify-content-center'>
                            {!linkGenerated?
                                <Button disabled={props.loadingLink} className="btn-primary-modal px-2" onClick={generateLink}>
                                    Generar link de invitación
                                </Button>
                                :
                                <>
                                    <Form.Control 
                                        disabled={true}
                                        type="text"
                                        name="invitelink"
                                        placeholder="Generando link de invitación..."
                                        value={props.inviteLink}
                                    />
                                    <Button disabled={props.loadingLink} className="px-1" style={{borderRadius: '0px', background: 'none', color: 'var(--text-title)'}} onClick={handleCopyLink}>
                                        {linkCopied ?
                                            <AssignmentTurnedInOutlinedIcon/>
                                            :
                                            <ContentPasteOutlinedIcon/>
                                        }
                                    </Button>
                                    <Button disabled={props.loadingLink} className="px-1" style={{borderRadius: '0px', background: 'none', color: "green"}} onClick={handleWhatsAppPress}>
                                        <WhatsAppIcon/>
                                    </Button>
                                </>
                            }
                            </div>
                            <span className="text-success mt-1" style={{fontSize: '0.9rem'}}>{linkCopied ? '¡Link copiado en portapapeles!' : null}</span>
                        </Form.Group>
                    :
                    null
                    }
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={props.handleCancel}>
                    Cancelar
                </Button>
                {!(props.loading)?
                    <Button className="btn-primary-modal px-3" onClick={props.handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    );
}
