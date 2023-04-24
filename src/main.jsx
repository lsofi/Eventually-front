import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMySubscriptionType } from "./shared/shared-methods.util";

const handleGenericErrors = (axiosError) => {
  try {
    const messages = axiosError.response.data.message;
    if (!Array.isArray(messages)) {
      toast.error('Lo sentimos, no pudimos procesar tu solicitud. Intentalo de nuevo más tarde');
      return;
    }
    messages.forEach(message => {
      if (message.includes('#')){
        const messageArray = message.split('#');
        if (messageArray[0] === 'generic') toast.error(messageArray[1]);
        if (messageArray[0] === 'warning') toast.warning(messageArray[1]);
        if (messageArray[0] === 'premium'){
          toast.warning(messageArray[1]);
          if (getMySubscriptionType() !== 'premium') toast(<a href="/settings/premium" target="_blank" className="no-decorations">¡Suscribite a nuestra aplicación para obtener un usuario premium!</a>)
        }
      }
    })
  } catch (error) {
      //console.log(error)
  }
}

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  const defaultOptions = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
  config.headers = { ...defaultOptions, ...config.headers
  };
  config.baseURL = '.'; //pasar a variable de entorno
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

axios.interceptors.response.use(
  undefined,
  error => {
    console.log(error);
    handleGenericErrors(error);
    return Promise.reject(error);
  }
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <ToastContainer
          theme="colored"
          position="top-right"
          autoClose={5000}
          limit={3}
          newestOnTop
          hideProgressBar={true}
          pauseOnFocusLoss={false}
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </React.StrictMode>
  </>
);