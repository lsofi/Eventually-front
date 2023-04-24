import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SearchInput( props ) {
    
    return (
        <div className="search-input d-flex flex-row align-items-center" style={{width: props.width, height: props.height}}>
            <input type="text" className="explore-input borderless" onChange={props.handleOnChange} placeholder= {props.placeholder ? props.placeholder : "Explorar..."}></input>
            <button className="btn-search borderless"><FontAwesomeIcon icon={faSearch}/></button>
        </div>
    );
}