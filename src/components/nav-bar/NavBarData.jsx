import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGlassCheers, faHistory, faChartBar, faHandHoldingHeart, faGlobeAmericas} from '@fortawesome/free-solid-svg-icons';

export const NavBarData = [ 
    {
        title: "Explorar",
        icon: <FontAwesomeIcon icon={faGlobeAmericas} />,
        link: "/home"
    },
    {
        title: "Eventos",
        icon: <FontAwesomeIcon icon={faGlassCheers} />,
        link: "/events"
    },
    {
        title: "Historial",
        icon: <FontAwesomeIcon icon={faHistory} />,
        link: "/history"
    },
    // {
    //     title: "Informes",
    //     icon: <FontAwesomeIcon icon={faChartBar} />,
    //     link: "/reports",
    // },
    {
        title: "Servicios",
        icon: <FontAwesomeIcon icon={faHandHoldingHeart} />,
        link: "/services",
    },
    
]