import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Masonry from '@mui/lab/Masonry';
import InfoModal from '../../components/modals/InfoModal';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/modals/LoadingModal';
import PollQuestionReview from "./PollQuestionReview";


export default function PollReview() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event_id = urlParams.get('event_id'); // Saves the param from the URL
    const poll_id = urlParams.get('poll_id');

    const [ poll, setPoll ] = useState({event_id: event_id, visible: false});
    const [ pollQuestions, setPollQuestions ] = useState([]);
    const [ infoModal, setInfoModal ] = useState({show: false});
    const [ loading, setLoading ] = useState(0);

    const navigate = useNavigate();

    useEffect(()=>{
        getPoll();
    },[])

    const getPoll = async () => {
        if (!event_id || !poll_id) return;
        setLoading(prev => prev + 1)
        try{
            const pollCall = axios.get(`../api/poll/getPoll?poll_id=${poll_id}&event_id=${event_id}`)
            const resultsCall = axios.get(`../api/poll/getResultPoll?poll_id=${poll_id}&event_id=${event_id}`);
            const resPoll = await pollCall;
            const resResults = await resultsCall;
            console.log(resResults.data);
            setPoll({
                name: resPoll.data.name,
                cant_answers: resResults.data.cant_answers
            });
            setPollQuestions(resResults.data.questions);
        } catch (error) {
            console.log(error);
        }
        setLoading( prev => prev - 1)
    }

    const handleCloseInfoModal = () => {
        setInfoModal({show:false});
        navigate(`/events/event?event_id=${event_id}`);
    }

    return (
        <div className="body d-flex flex-column nav-bar-content padding-navbar">
            <Breadcrumb className="w-100 mt-2">
                    <Breadcrumb.Item onClick={()=>navigate(`/events/event?event_id=${event_id}`)}>Volver al evento</Breadcrumb.Item>
                    <Breadcrumb.Item onClick={()=>navigate(`/events/viewPoll?event_id=${event_id}&poll_id=${poll_id}`)}>Volver a la encuesta</Breadcrumb.Item>
            </Breadcrumb>
            {poll.name?
            <>
                <div className="d-flex align-items-start flex-column gap-2">
                    <h2>Reporte "{poll.name}"</h2>
                    {poll.cant_answers?
                        <span>Se registraron {poll.cant_answers} respuestas</span>
                        :
                        <span>No se registraron respuestas todavía</span>
                    }
                </div>
                <div className="mt-3">
                    <h3>Preguntas</h3>
                    <Masonry columns={{xs: 1, lg: 2}} className="mx-0 mb-5">
                        {pollQuestions && pollQuestions.length? 
                            pollQuestions.map((question, index)=> (
                                <PollQuestionReview
                                    question={question}
                                    index={index}
                                    key={index}
                                />
                            ))
                            : null
                        }
                    </Masonry>
                </div>
            </>: null}
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
