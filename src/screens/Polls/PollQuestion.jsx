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


export default function PollQuestion( props ) {

    const [ warningCount, setWarningCount ] = useState(0);
    const [ update, setUpdate ] = useState(!props.question.question);

    const modify = props.modify || update;

    const getQuestionType = (type) => {
        if (type === 'multiple_choice_simple') return 'Pregunta de selección simple';
        else if (type === 'multiple_choice_multiple') return 'Pregunta de selección múltiple';
        else if (type === 'number') return 'Pregunta de barra de deslizamiento';
        else return 'Pregunta de entrada de texto';
    }

    const handleOnChangeQuestion = (e) => {
        let value = e.target.value;
        const name = e.target.name;
        if (name === 'max_length') {
            if (isNaN(value)) return;
            value = Number(value);
        }
        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === props.question.question_id) return {...question, [name]: value}
            else return question;
        });
        props.setPollQuestions(newQuestions);
        if (props.errors && props.errors[name]) props.setErrors(prev => ({...prev, [props.question.question_id]: {... prev[props.question.question_id], [name]: null}}))
    }

    const handleOnChangePossibleAnswer = (e, question_id, answer_id) => {
        const value = e.target.value;
        // const name = e.target.name;
        const question = props.pollQuestions.find((question) => (question.question_id === question_id));
        const newQuestionAnswers = question.possible_answers.map((answer) => {
            if (answer.answer_id === answer_id) return {...answer, answer: value}
            else return answer;
        })
        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === question_id) return {...question, possible_answers: newQuestionAnswers}
            else return question;
        });
        props.setPollQuestions(newQuestions);
        if (props.errors && props.errors[answer_id]) props.setErrors(prev => ({...prev, [props.question.question_id]: {... prev[props.question.question_id], [answer_id]: null}}))
    }

    const handleDeletePossibleAnswer = (question_id, answer_id) => {
        const question = props.pollQuestions.find((question) => (question.question_id === question_id));
        const newQuestionAnswers = question.possible_answers.filter((answer) => {
            return answer.answer_id !== answer_id
        })
        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === question_id) return {...question, possible_answers: newQuestionAnswers}
            else return question;
        });
        props.setPollQuestions(newQuestions);
    }

    const handleAddPossibleAnswer = (question_id) => {
        const newQuestionAnswers = props.question.possible_answers;
        if (newQuestionAnswers.filter((answer)=>(!answer.answer)).length > 1){
            if (warningCount > 0) return;    
            toast.warning('No puede agregar más opciones mientras haya opciones incompletas');
            updateWaringCount();
            return;
        }
        newQuestionAnswers.push({answer_id: getRanHex(24), answer: ''})
        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === question_id) return {...question, possible_answers: newQuestionAnswers}
            else return question;
        });
        props.setPollQuestions(newQuestions);
    }

    const handleOnChangeAnswer= (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        let answers = [];

        if (props.question.type === 'text') answers = [value]
        else if (props.question.type === 'multiple_choice_simple') answers = [e.target.id]
        else {
            answers = props.question.answers? props.question.answers : []
            if (value) answers.push(e.target.id)
            else if (!value) answers = answers.filter(answer => answer !== e.target.id);
        }

        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === props.question.question_id) return {...question, answers: answers}
            else return question;
        });
        props.setPollQuestions(newQuestions);
    }

    const handleOnChangeSlider = (newValue) => {
        console.log(newValue);
        const newQuestions = props.pollQuestions.map((question)=> {
            if (question.question_id === props.question.question_id) return {...question, answers: [newValue]}
            else return question;
        });
        props.setPollQuestions(newQuestions);
    }

    const handleDeleteQuestion = () => {
        const newQuestions = props.pollQuestions.filter((question) => (question.question_id !== props.question.question_id));
        props.setPollQuestions(newQuestions);
    }

    const updateWaringCount = () => {
        setWarningCount(prev => prev + 1);
        setTimeout(()=>{
            setWarningCount(prev => prev - 1)
        }, 6000)
    }

    const handleToggleUpdate = () => {
        if(update){
            const newErrors = props.findErrorsQuestion(props.question, false);
            if ( Object.keys(newErrors).length > 0 ) return;
        }
        setUpdate(prev => !prev)
    }

    const getMarks = () => {
        if (!props.question.mark0 || !props.question.mark100)
            return [{value: 0, label: props.question.mark0}, {value: 100, label: props.question.mark100}];
        const mark0 = props.question.mark0.replace('$', '').replace(',', '.');
        const mark100 = props.question.mark100.replace('$', '').replace(',', '.');
        if (isNaN(mark0) || isNaN(mark100))
            return [{value: 0, label: props.question.mark0}, {value: 100, label: props.question.mark100}];
        const min = Number(mark0);
        const max = Number(mark100);
        return [{value: min, label: props.question.mark0}, {value: max, label: props.question.mark100}];
    }

    const getMinMax = () => {
        if (!props.question.mark0 || !props.question.mark100) return {min: 0, max: 100}
        const mark0 = props.question.mark0.replace('$', '').replace(',', '.');
        const mark100 = props.question.mark100.replace('$', '').replace(',', '.');
        if (isNaN(mark0) || isNaN(mark100)) return {min: 0, max: 100}
        const min = Number(mark0);
        const max = Number(mark100);
        return {min: min, max: max};
    }

    const minMax = getMinMax();

    const answerInArray = (answers, answer_id) => {
        if (!answers || !answers.length) return false;
        return answers.findIndex(answer => answer == answer_id) !== -1;
    }

    const onSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        // <div className="bg-card color-black d-flex flex-column m-3" style={{borderRadius: "1rem", overflow: "hidden"}}>
        <div className="question-card">
            <Form onSubmit={onSubmit}>
                <div className="d-flex flex-column align-items-start gap-2">
                    {modify?
                    <div className='w-100 d-flex flex-column position-relative'>
                        <div className="position-absolute top-0 end-0">
                            <CloseButton title="Eliminar pregunta" onClick={()=>handleDeleteQuestion()}/>
                        </div>
                        <Form.Group>
                            <Form.Label>Pregunta N°{props.index + 1}</Form.Label>
                            <Form.Control as="textarea" isInvalid={ !!props.errors? props.errors.question : false } placeholder="" name="question" 
                                            value={props.question.question} maxLength={300} onChange={handleOnChangeQuestion}/>
                            <Form.Control.Feedback type="invalid">{props.errors? props.errors.question: ''}</Form.Control.Feedback>
                            <Form.Text className="text-end">{props.question.question? props.question.question.length: 0} de 300</Form.Text>
                        </Form.Group>
                    </div>:
                    <h4 className="m-0">{props.index + 1}. {props.question.question}</h4>}
                    <Alert className="question-type-alert text-title">{getQuestionType(props.question.type)}</Alert>
                </div>
                <hr className="mx-0 my-2" style={{height: '2px'}}/>
                <div>
                    {['multiple_choice_simple', 'multiple_choice_multiple'].includes(props.question.type)?
                        <>
                        {modify? 
                            <> 
                                {props.question.possible_answers.length < 2? 
                                    <span className="text-danger">Debe ingresar al menos dos opciones</span> : null
                                }
                                {props.question.possible_answers.map((answer, key)=>(
                                    <div className='d-flex align-items-center my-2' style={{gap: '0.5rem'}} key={key}>
                                        <Form.Group className="w-100">
                                            <Form.Control type="text" placeholder="Ingresá una opción" name="answer" value={answer.answer} maxLength={50}
                                                        onChange={(e) =>handleOnChangePossibleAnswer(e, props.question.question_id, answer.answer_id)}
                                                        isInvalid={props.errors && props.errors[answer.answer_id]? !!props.errors[answer.answer_id]: false}
                                                        />
                                            <Form.Control.Feedback type="invalid">{props.errors && props.errors[answer.answer_id]? props.errors[answer.answer_id]: ''}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Button className="delete-btn d-flex" title="Eliminar opción" onClick={()=>handleDeletePossibleAnswer(props.question.question_id, answer.answer_id)}><FontAwesomeIcon icon={faTimesCircle}/></Button>
                                    </div>
                                ))}
                                <div className="d-flex justify-content-center mt-3">
                                    <Button className="btn-primary-modal px-3" onClick={()=>handleAddPossibleAnswer(props.question.question_id)}>Añadir opción</Button>
                                </div>
                                <hr className="mx-0 my-2" style={{height: '2px'}}/>
                                <span className="bold">Vista previa</span>
                            </> : null}
                        {props.question.possible_answers.map((answer)=>(
                            <div className='d-flex align-items-center mb-2' style={{gap: '0.5rem'}} key={answer.answer_id}>
                                <Form.Check type={props.question.type === 'multiple_choice_simple'? 'radio' : 'checkbox'} 
                                            id={answer.answer_id} name="group" onChange={handleOnChangeAnswer}
                                            checked={answerInArray(props.question.answers, answer.answer_id)}
                                            disabled={!props.answer}
                                            />
                                <Form.Label className="mb-0" htmlFor={answer.answer_id}>{answer.answer}</Form.Label>
                            </div>
                        ))}
                        </>
                    :
                    props.question.type === 'number'?
                    <>
                        {modify?
                        <>
                            <div className="d-flex justify-content-around gap-3">
                                <Form.Group>
                                    <Form.Label>Mínimo</Form.Label>
                                    <Form.Control type="text" placeholder="" name="mark0" value={props.question.mark0} maxLength={15}
                                                onChange={handleOnChangeQuestion} isInvalid={props.errors? !!props.errors.mark0 : false}/>
                                    <Form.Control.Feedback type="invalid">{props.errors? props.errors.mark0: ''}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Máximo</Form.Label>
                                    <Form.Control type="text" placeholder="" name="mark100" value={props.question.mark100} maxLength={15}
                                                onChange={handleOnChangeQuestion} isInvalid={props.errors? !!props.errors.mark100 : false}/>
                                    <Form.Control.Feedback type="invalid">{props.errors? props.errors.mark100: ''}</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <hr className="mx-0 my-2" style={{height: '2px'}}/>
                            <span className="bold">Vista previa</span>
                        </> : null}
                        <div className="px-5">
                            {/* //TODO Si el mark0 y mark100 son números cambiar el min y max */}
                            <Slider
                                min={minMax.min}
                                max={minMax.max}
                                step={(minMax.max - minMax.min)/100}
                                value={props.question.answers? props.question.answers[0] : (minMax.max - minMax.min)/2}
                                marks={getMarks()}
                                disabled={!props.answer}
                                className="slider-question"
                                onChangeCommitted={(event, newValue)=> handleOnChangeSlider(newValue)}
                                valueLabelDisplay
                            />
                        </div>
                    </>
                    :
                    <>
                        {modify?
                        <>
                            <div className="d-flex justify-content-between">
                                <Form.Group>
                                    <Form.Label>Cantidad máxima de caracteres</Form.Label>
                                    <Form.Control type="text" name="max_length" value={props.question.max_length} maxLength={3}
                                                onChange={handleOnChangeQuestion} isInvalid={props.errors? !!props.errors.max_length : false}/>
                                    <Form.Control.Feedback type="invalid">{props.errors? props.errors.max_length: ''}</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <hr className="mx-0 my-2" style={{height: '2px'}}/>
                            <span className="bold">Vista previa</span>
                        </> : null}
                        <Form.Group className='d-flex flex-column'>
                            <Form.Control as="textarea"  placeholder={modify? 'Se mostrará una entrada de texto como esta.' : ''}
                                            name="answer" disabled={!props.answer} value={props.question.answers? props.question.answers[0]: ''}
                                            onChange={handleOnChangeAnswer}/>
                            <Form.Text className="text-end">{props.question.answers && props.question.answers[0]? props.question.answers[0].length : 0} de {props.question.max_length}</Form.Text>
                        </Form.Group>
                    </>}
                    {props.update?
                        <>
                        <hr className="mx-0 my-3" style={{height: '2px'}}/>
                        <div className="d-flex w-100 justify-content-end">
                            <Button className="btn-primary-modal px-3" onClick={()=>handleToggleUpdate()} title="Editar pregunta">
                                <FontAwesomeIcon icon={update? faCheck : faPencil}/>
                            </Button>
                        </div>
                        </> : null}
                </div>
            </Form>
        </div>
    )
}
