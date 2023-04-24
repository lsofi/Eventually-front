import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './DropFileInput.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import AddItemCloud from "../../resources/images/AddItemCloud.png"

export default function DropFileInput ( props ) {
    const wrapperRef = useRef(null);

    const onDragEnter = () => wrapperRef.current.classList.add('dragover');

    const onDragLeave = () => wrapperRef.current.classList.remove('dragover');

    const onDrop = () => wrapperRef.current.classList.remove('dragover');

    return (
        <>
            <div ref={wrapperRef} className="drop-file-input" onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop} style={!props.modify? {opacity: '0.6'}: {}}>
                <div className="drop-file-input__label">
                    <img src={AddItemCloud} alt="" />
                    <p>Arrastra y suelta para agregar la imagen</p>
                </div>
                <input type="file" value='' onChange={props.onFileDrop} disabled={!props.modify} multiple={false} style={!props.modify? {cursor: 'initial'}: {}}/>
            </div>
            {
                props.fileList.length > 0 && props.showList ? (
                    <div className="drop-file-preview w-100">
                        <p className="drop-file-preview__title">
                            Listo para agregar
                        </p>
                        {
                            props.fileList.map((item, index) => (
                                <div key={index} className="drop-file-preview__item align-items-center">
                                    <FontAwesomeIcon style={{fontSize: '2.5rem'}} icon={faFileImage}/>
                                    <div className="drop-file-preview__item__info">
                                        <p className="m-0" style={{wordBreak: "break-all"}}>{item.name}</p>
                                        <p className="m-0">{Math.round(item.size/1024)}KB</p>
                                    </div>
                                    <span className="drop-file-preview__item__del" onClick={() => props.fileRemove(item)}><FontAwesomeIcon icon={faTimesCircle}/></span>
                                </div>
                            ))
                        }
                    </div>
                ) : null
            }
        </>
    );
}

DropFileInput.propTypes = {
    onFileChange: PropTypes.func
}