import StatePill from "./StatePill";
import Placeholder from "react-bootstrap/Placeholder";

export default function PublicEventCard( props ) {
    return (
        props.placeholder? 
        <div className="public-event-card">
            <Placeholder animation="wave" className="m-1 rounded" 
                style={{backgroundColor: 'var(--text-ultra-muted)', height: '10rem', width: '10rem'}}
            />
            <div className="d-flex flex-column mx-3 align-items-center" style={{width: '100%'}}>
                <hr className="mx-0 my-1 w-80-sm" style={{height: '2px'}}/>
                <div className="d-flex gap-2 flex-column">
                    <Placeholder animation="wave" className="m-1 rounded" 
                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '2.5rem', width: '15rem'}}
                    />
                    <Placeholder animation="wave" className="m-1 rounded" 
                        style={{backgroundColor: 'var(--text-ultra-muted)', height: '2.5rem', width: '15rem'}}
                    />
                </div>
            </div>
        </div> 
        :
        <div className="public-event-card" onClick={props.onClick}>
            <img src={props.img}/>
            <div className="d-flex flex-column mx-3 align-items-center" style={{width: '100%'}}>
                <hr className="mx-0 my-1 w-80-sm" style={{height: '2px'}}/>
                <div className="d-flex justify-content-center flex-wrap" style={{gap: '1rem'}}>
                    <div className="d-flex gap-2 flex-column">
                        <h4 className="m-0 bold text-center">{props.title}</h4>
                        <h4 className=' m-0 text-tertiary text-center bold'>{props.date} {props.time}</h4>
                    </div>
                </div>
                <div className="flex-wrap w-80-sm mt-3 text-muted">
                    <div className="d-flex gap-3">
                        <h6 className="bold text-field-name">Lugar:</h6>
                        <h6 className="text-field">{props.place}</h6>
                    </div>
                    <div className="d-flex gap-3">
                        <h6 className="bold text-field-name">Tipo:</h6>
                        <h6 className="text-field">{props.type}</h6>
                    </div>
                </div>
            </div>
        </div>
    );
} 