import StatePill from "./StatePill";

export default function EventCard( props ) {
    return (
        <div className="event-card" onClick={props.onClick}>
            <img src={props.img}/>
            <div className="d-flex flex-column mx-3" style={{width: '100%'}}>
                <div className="d-flex justify-content-between flex-wrap" style={{gap: '1rem'}}>
                    <div className="d-flex gap-2 align-items-center mb-1 flex-wrap">
                        <h4 className="m-0 bold">{props.title}</h4>
                        <StatePill state={props.state}/>
                    </div>
                    <h4 className=' m-0 text-tertiary bold'>{props.date}</h4>
                </div>
                <hr className="mx-0 my-1" style={{height: '2px'}}/>
                <div className="fields-grid flex-wrap mt-2 mx-2 text-muted">
                    <div className="d-flex">
                        <h6 className="bold text-field-name">Lugar:</h6>
                        <h6 className="text-field">{props.place}</h6>
                    </div>
                    <div className="d-flex">
                        <h6 className="bold text-field-name">Tipo:</h6>
                        <h6 className="text-field">{props.type}</h6>
                    </div>
                    <div className="d-flex">
                        <h6 className="bold text-field-name">Privacidad:</h6>
                        <h6 className="text-field">{props.isPrivate? 'Privado': 'Público'}</h6>
                    </div>
                    <div className="d-flex">
                        <h6 className="bold text-field-name">Hora:</h6>
                        <h6 className="text-field">{props.time}</h6>
                    </div>
                </div>
            </div>
        </div>
    );
} 