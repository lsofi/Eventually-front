import React, {useState} from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from "react-bootstrap/Alert";
import CloseButton from "react-bootstrap/CloseButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faPencil, faCheck} from '@fortawesome/free-solid-svg-icons';
import { getRanHex } from '../../shared/shared-methods.util';
import { toast } from 'react-toastify';
import Slider from '@mui/material/Slider';
import { getMenuItemUnstyledUtilityClass } from '@mui/base';
import { Tooltip, BarChart, XAxis, YAxis, Bar, ResponsiveContainer } from 'recharts';


export default function PollQuestionReview( props ) {
    
    const darkMode = localStorage.getItem('darkMode') === 'true' ? true : false;

    const colors = !darkMode? 
        ["#ffa96c", "#e280a2", "#FF8E3C", "#d9376e"] // Claro
        :
        ["#ffa96c", "#e280a2", "#d9376e", "#FF8E3C"] // Oscuro

    let results;
    let marks;
    if (['multiple_choice_simple', 'multiple_choice_multiple'].includes(props.question.type)){
        results = props.question.results.map((result, index) =>({
            answer: result.answer,
            Cantidad: result.contador,
            fill: colors[index % colors.length]
        }))
    }

    const getQuestionType = (type) => {
        if (type === 'multiple_choice_simple') return 'Pregunta de selección simple';
        else if (type === 'multiple_choice_multiple') return 'Pregunta de selección múltiple';
        else if (type === 'number') return 'Pregunta de barra de deslizamiento';
        else return 'Pregunta de entrada de texto';
    }

    const onSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const getMarks = () => {
        const results = props.question.results;
        return [
            {value: 0, label: ""}, 
            {value: results.promedio, label: "Promedio"},
            {value: 10, label: ""}, 
        ];
    }

    if (props.question.type === 'number') marks = getMarks();

    return (
        // <div className="bg-card color-black d-flex flex-column m-3" style={{borderRadius: "1rem", overflow: "hidden"}}>
        <div className="question-card">
            <div className="d-flex flex-column align-items-start gap-2">
                <h4 className="m-0">{props.index + 1}. {props.question.question}</h4>
                <Alert className="question-type-alert text-title">{getQuestionType(props.question.type)}</Alert>
            </div>
            <hr className="mx-0 my-2" style={{height: '2px'}}/>
            <div>
                {['multiple_choice_simple', 'multiple_choice_multiple'].includes(props.question.type)?
                    <div className='d-flex'>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={results}>
                                <XAxis dataKey="answer"/>
                                <YAxis/>
                                <Tooltip />
                                <Bar dataKey="Cantidad" stroke='#2a2a2a' strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                :
                props.question.type === 'number'?
                    <div className='px-5'>
                        <div className='d-flex justify-content-around mb-4'>
                            <div className="d-grid">
                                <div className="d-flex gap-3 align-items-center">
                                    <h5 className="m-0">Cantidad de respuestas:</h5><h6 className='m-0'>{props.question.results.cantRespuestas}</h6>
                                </div>
                                <div className="d-flex gap-3 align-items-center">
                                    <h5 className="m-0">Respuesta promedio:</h5><h6 className='m-0'>{props.question.results.promedio}</h6>
                                </div>
                            </div>
                            <div className="d-grid">
                                <div className="d-flex gap-3 align-items-center">
                                    <h5 className="m-0">Mínimo:</h5><h6 className='m-0'>{props.question.results.min}</h6>
                                </div>
                                <div className="d-flex gap-3 align-items-center">
                                    <h5 className="m-0">Máximo:</h5><h6 className='m-0'>{props.question.results.max}</h6>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-3">
                            <p className="bold">{props.question.mark0? props.question.mark0 : 0}</p>
                            <Slider
                                min={!isNaN(props.question.mark0)? props.question.mark0 : 0}
                                max={!isNaN(props.question.mark100)? props.question.mark100: 100}
                                value={props.question.results.promedio}
                                disabled={true}
                                className="slider-question"
                                marks={marks}
                            />
                            <p className="bold">{props.question.mark100? props.question.mark100: 100}</p>
                        </div>
                    </div>
                :
                    <div className='p-2' style={{maxHeight: '30rem', overFlowY: 'auto'}}>
                        {props.question.results.map((answer, index)=> (
                            <p key={`answer-${index}`}>"{answer}"</p>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}
