//creaete a postauth screen
import React from 'react';
import { useNavigate } from 'react-router-dom';
//

export default function PostAuth(props) {
    const navigate = useNavigate();
    
    //get the token from the url
    const token = window.location.href.split('t=')[1];
    //save the token in the local storage
    //clean the token from the url
    

    //redirect to the login screen
    props.handleLogIn(token);

    navigate('/events');
    
    return <div />;
    }