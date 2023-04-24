import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlassCheers, faHandHoldingMedical, faExchangeAlt, faCarAlt, faQuestionCircle, faPencilRuler, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import SubscriptionForm from '../../components/SubscriptionForm';
import CreditCardForm from '../../components/CreditCardForm';

export default function PremiumSubscriptionPage( props ) {
    
    const [ subscriptionForm, setSubscriptionForm ] = useState({show: false});
    
    return (
        <div className="d-flex w-100 flex-column nav-bar-content justify-content-center align-items-center">
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ margin: "2rem 0" }}>
                <div className="d-flex align-items-center justify-content-center">
                    <div className="premium-label-eventually text-title lg">Eventually&nbsp;</div>
                    <div className="premium-label-premium lg">Premium</div>
                </div>
                <h2 className="text-center mt-2 premium-label-plan">¡Tenemos el mejor plan para vos!</h2>
                <div className="card premium-subscribe-card align-items-center mt-4 mx-2" style={{borderRadius: '1rem'}}>
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="premium-label-eventually">Eventually&nbsp;</div>
                        <div className="premium-label-premium">Premium</div>
                    </div>
                    <div className="premium-benefits-container mt-3 w-80-sm">
                        <div>
                            <FontAwesomeIcon icon={faGlassCheers}/>
                            Más eventos en simultaneo
                        </div>
                        <div > 
                            <FontAwesomeIcon icon={faHandHoldingMedical}/>
                            Crear más servicios
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faExchangeAlt} style={{transform: 'rotate(90deg)'}}/>
                            Más de 100 megas para fotos y archivos
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faCarAlt}/>
                            Más vehículos en Carpooling
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faQuestionCircle}/>
                            Más encuestas y preguntas
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faPencilRuler}/>
                            ¡Tus propias plantillas personalizadas!
                        </div>
                    </div>
                    {props.subscriptionType === 'premium'? 
                        <div className="text-blue bold mt-2" style={{fontSize: '1.25rem'}}>¡Ya lo tenés!</div>
                        :
                        <Button className="mt-3" style={{fontSize: '1.25rem'}} onClick={()=>setSubscriptionForm({show:true})}>Suscribirse</Button>
                    }
                </div>
            </div>
            <div className="premium-table-container">
                <table className="text-center">
                    <tr>
                        <th></th>
                        <th>
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <div className="d-flex align-items-end" style={{lineHeight: '1'}}>
                                    <div className="responsive-font-size lg text-title">Eventually&nbsp;</div>
                                    <div className="responsive-font-size md text-title font-hans">Basic</div>
                                </div>
                                <div className="text-tertiary responsive-font-size md">GRATIS</div>
                            </div>
                        </th>
                        <th>
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <div className="d-flex align-items-end" style={{lineHeight: '1'}}>
                                    <div className="responsive-font-size lg text-title">Eventually&nbsp;</div>
                                    <div className="responsive-font-size md text-blue font-hans">Premium</div>
                                </div>
                                <div className="text-tertiary d-flex align-items-end" style={{lineHeight: '1'}}>
                                    A&nbsp;
                                    <div className="responsive-font-size md">$3000</div>
                                    /mes
                                </div>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <td>Creación de eventos</td>
                        <td className="table-data">Hasta 2 eventos en simultáneo</td>
                        <td className="table-data">Ilimitado</td>
                    </tr>
                    <tr>
                        <td>Creación de servicios</td>
                        <td className="table-data">Un sólo servicio por usuario</td>
                        <td className="table-data">Ilimitado</td>
                    </tr>
                    <tr>
                        <td>Más de 100 megas por carpeta de archivos</td>
                        <td className="table-data"><FontAwesomeIcon className="text-danger-eventually" icon={faTimesCircle}/></td>
                        <td className="table-data"><FontAwesomeIcon className="text-success-eventually" icon={faCheckCircle}/></td>
                    </tr>
                    <tr>
                        <td>Más de 100 megas en el álbum de fotos</td>
                        <td className="table-data"><FontAwesomeIcon className="text-danger-eventually" icon={faTimesCircle}/></td>
                        <td className="table-data"><FontAwesomeIcon className="text-success-eventually" icon={faCheckCircle}/></td>
                    </tr>
                    <tr>
                        <td>Cantidad de vehículos en el Carpooling</td>
                        <td className="table-data">Hasta 2 vehículos por evento</td>
                        <td className="table-data">Ilimitado</td>
                    </tr>
                    <tr>
                        <td>Encuestas</td>
                        <td className="table-data">Una encuesta de hasta 10 preguntas por evento</td>
                        <td className="table-data">Ilimitado</td>
                    </tr>
                    <tr>
                        <td>Poder guardar plantillas personalizadas</td>
                        <td className="table-data"><FontAwesomeIcon className="text-danger-eventually" icon={faTimesCircle}/></td>
                        <td className="table-data"><FontAwesomeIcon className="text-success-eventually" icon={faCheckCircle}/></td>
                    </tr>
                    <tr>
                        <td>Perfil destacado</td>
                        <td className="table-data"><FontAwesomeIcon className="text-danger-eventually" icon={faTimesCircle}/></td>
                        <td className="table-data"><FontAwesomeIcon className="text-success-eventually" icon={faCheckCircle}/></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td className="table-data">
                            <div className="d-flex flex-column gap-1 align-items-center">
                                <div className="text-tertiary responsive-font-size md">GRATIS</div>
                                {props.subscriptionType === 'basic'? <div className="text-blue">¡Ya lo tenés!</div>: null}
                            </div>
                        </td>
                        <td className="table-data">
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <div className="text-tertiary d-flex align-items-end" style={{lineHeight: '1'}}>
                                    <div style={{whiteSpace: 'nowrap'}}>A&nbsp;</div>
                                    <div className="responsive-font-size md">$3000</div>
                                    /mes
                                </div>
                                {props.subscriptionType === 'premium'? 
                                    <div className="text-blue">¡Ya lo tenés!</div>
                                    :
                                    <Button className="responsive-font-size md" onClick={()=>setSubscriptionForm({show:true})}>Suscribirse</Button>
                                }
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <SubscriptionForm
                showModal={subscriptionForm.show}
                handleCloseModal={()=>setSubscriptionForm({show: false})}
            />
        </div>
    )
}
