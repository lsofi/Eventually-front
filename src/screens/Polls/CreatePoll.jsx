import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'react-bootstrap/Button';
import Tooltip from 'react-bootstrap/Tooltip';
import Dropdown from 'react-bootstrap/Dropdown';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Masonry from '@mui/lab/Masonry';
import PollQuestion from './PollQuestion';
import { getRanHex } from '../../shared/shared-methods.util';
import InfoModal from '../../components/modals/InfoModal';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/modals/LoadingModal';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function CreatePoll() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event_id = urlParams.get('event_id'); // Saves the param from the URL
    const event_name = urlParams.get('event_name');

    const [ poll, setPoll ] = useState({event_id: event_id, visible: false});
    const [ pollQuestions, setPollQuestions ] = useState([]);
    const [ errors, setErrors ] = useState({});
    const [ questionAddModal, setQuestionAddModal ] = useState({show: false});
    const [ infoModal, setInfoModal ] = useState({show: false});
    const [ loading, setLoading ] = useState(0);

    const navigate = useNavigate();

    const findErrors = () => {
        let newErrors = {};

        if (poll && !poll.name) newErrors.name = "Por favor ingrese un nombre de la encuesta."

        if (!pollQuestions.length) {
            toast.error('Debe ingresar al menos una pregunta')
            newErrors.generic = "Debe ingresar al menos una pregunta";
            return newErrors;
        }
        pollQuestions.forEach(question => {
            if (!question.question) newErrors = getNewErrorsQuestion(newErrors, question.question_id, 'question', 'Por favor ingrese una pregunta');
            if (['multiple_choice_simple', 'multiple_choice_multiple'].includes(question.type)){
                if (question.possible_answers.length < 2) newErrors = newErrors = getNewErrorsQuestion(newErrors, question.question_id, 'possible_answers', 'Debe ingresar al menos dos opciones');
                if (question.possible_answers.length)
                    question.possible_answers.forEach(answer => {
                        if (!answer.answer) newErrors = getNewErrorsQuestion(newErrors, question.question_id, answer.answer_id, 'Las opciones no pueden estar vacías')
                    })
            }
            else if (question.type === 'number'){
                if (!question.mark0) newErrors = getNewErrorsQuestion(newErrors, question.question_id, 'mark0', 'Por favor ingrese una valor mínimo')
                if (!question.mark100) newErrors = getNewErrorsQuestion(newErrors, question.question_id, 'mark100', 'Por favor ingrese una valor máximo')
            }
            else if (question.type === 'text'){
                if (!question.max_length) newErrors = getNewErrorsQuestion(newErrors, question.question_id, 'max_length', 'Por favor ingrese una cantidad máxima de caracteres')
            }
        })

        return newErrors;
    }

    const getNewErrorsQuestion = (errors, question_id, field, message) => {
        let newErrors = errors;
        newErrors = {...newErrors, [question_id]: {...newErrors[question_id], [field]: message}}
        return newErrors;
    }

    const handleOnChangeName = (e) => {
        const value = e.target.value;
        setPoll(prev => ({...prev, name: value}));
        if (!!errors.name) setErrors(prev => ({...prev, name: null}))
    }

    const handleAddQuestion = (type) => {
        const randomId = getRanHex(24);
        const possible_answers = ['multiple_choice_simple', 'multiple_choice_multiple'].includes(type)? [
            {answer: '', answer_id: getRanHex(24)},
            {answer: '', answer_id: getRanHex(24)},
        ] : null;
        const newQuestion = {
            question_id: randomId,
            question: '',
            possible_answers: possible_answers,
            type: type
        }
        setPollQuestions(prev => ([...prev, newQuestion]));
    }

    const handleCloseInfoModal = () => {
        setInfoModal({show:false});
        navigate(`/events/event?event_id=${event_id}`);
    }

    const handleOnSubmit = async () => {
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {
                event_id: event_id,
                name: poll.name,
                visible: false,
                questions: pollQuestions
            }
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                console.log(params);
                await axios.post('../api/poll/createPoll', params);
                setLoading(prev=>prev-1)
                setInfoModal({show: true, message: '¡Encuesta creada con éxito!', img: SuccessPhoneGirl});
            } catch (error) {
                console.log(error)
                setLoading(prev=>prev-1);
            }
        }
    }

    const onSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }


    return (
        <div className="body d-flex flex-column nav-bar-content padding-navbar">
            <Breadcrumb className="w-100 mt-2">
                    <Breadcrumb.Item onClick={()=>navigate(`/events/event?event_id=${event_id}`)}>Volver al evento</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-start mb-3">Nueva encuesta para "{event_name}"</h2>
            <div className="bg-card py-2 px-3" style={{maxWidth: "35rem", borderRadius: '1rem'}}>
                <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-2 d-flex flex-column" controlId="name">
                        <Form.Label>Nombre de la encuesta <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control isInvalid={ !!errors.name } placeholder="" name="name" autoComplete="off" 
                                    value={poll.name} maxLength={50} onChange={handleOnChangeName}/>
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </div>
            <div className="mt-3">
                <h3>Preguntas</h3>
                <Masonry columns={{xs: 1, lg: 2}} className="m-0">
                    {pollQuestions && pollQuestions.length? 
                        pollQuestions.map((question, index)=> (
                            <PollQuestion 
                                key={index}
                                index={index} 
                                question={question} 
                                errors={errors[question.question_id]}
                                modify={true}
                                setPollQuestions={setPollQuestions}
                                setErrors={setErrors}
                                pollQuestions={pollQuestions}
                            />
                        ))
                        : null
                    }
                    <div className="d-flex justify-content-center py-5">
                        <Dropdown>
                            <OverlayTrigger key={'addModule'} placement={'bottom'} overlay={<Tooltip id={'tooltip-submit'}>Agregar pregunta</Tooltip>}>
                                <Dropdown.Toggle className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center p-2 btn-add-poll">
                                        <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    </div>
                                </Dropdown.Toggle>
                            </OverlayTrigger>

                            <Dropdown.Menu variant={localStorage.getItem('darkMode') === 'true'? 'dark' : 'light'}>
                                <Dropdown.Item onClick={()=>handleAddQuestion('multiple_choice_simple')}>Selección simple</Dropdown.Item>
                                <Dropdown.Item onClick={()=>handleAddQuestion('multiple_choice_multiple')}>Selección múltiple</Dropdown.Item>
                                <Dropdown.Item onClick={()=>handleAddQuestion('number')}>Barra de deslizamiento</Dropdown.Item>
                                <Dropdown.Item onClick={()=>handleAddQuestion('text')}>Entrada de texto</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Masonry>
                <OverlayTrigger key={'submit'} placement={'left'} overlay={<Tooltip id={'tooltip-submit'}>Confirmar</Tooltip>}>
                    <Button className="event-submit-button" onClick={handleOnSubmit}><FontAwesomeIcon icon={faCheck}/></Button>
                </OverlayTrigger>
            </div>
            <InfoModal
                showModal={infoModal.show}
                message={infoModal.message}
                handleCloseModal={handleCloseInfoModal}
                img={infoModal.img}
            />
            <LoadingModal showModal={loading}/>
        </div>
    )
}
