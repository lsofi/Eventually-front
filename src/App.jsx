import { createContext, useEffect, useState } from "react";
import axios from "axios";
import jwt from 'jwt-decode';
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./components/modals/Modals.css";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./screens/landing-page/LandingPage";
import NavBar from "./components/nav-bar/NavBar";
import UserConfig from "./screens/settings-page/UserConfig";
import UserRegister from "./screens/user-register/UserRegister";
import Login from "./screens/login/Login";
import EventsPage from "./screens/events/EventsPage";
import EventRegister from "./screens/events/EventRegister";
import EventConfig from "./screens/events/EventConfig";
import InvitationsPage from "./screens/events/InvitationsPage";
import InviteLinkPage from "./screens/events/InviteLinkPage";
import ServiceInvitationPage from "./screens/events/ServiceInvitationPage";
import ForgotPassword from "./screens/login/ForgotPassword";
import ResetPassword from "./screens/login/ResetPassword";
import EventHistory from "./screens/events/EventHistory";
import ServicesPage from "./screens/services/ServicesPage";
import PostAuth from "./screens/login/postauth";
import ProtectedRoutes from "./screens/login/ProtectedRoutes";
import CreatePoll from "./screens/Polls/CreatePoll";
import PollConfig from "./screens/Polls/PollConfig";
import PollReview from "./screens/Polls/PollReview";
import { toast } from "react-toastify";
import HomePage from "./screens/events/HomePage";
import PremiumSubscriptionPage from "./screens/settings-page/PremiumSubscriptionPage";
// import IO from 'socket.io-client';
import { getMySubscriptionType } from "./shared/shared-methods.util";

const connectionUrl = ':4443';
let socket;

export const userContext = createContext();

function App() {

  const emptyUser = {
    authToken: '',
    username: '',
  };
  
  const [ user, setUser ] = useState(emptyUser);
  const [ userPhoto, setUserPhoto ] = useState('');
  const [ socketConnections, setSocketConnections ] = useState(0);
  //const location = useLocation();
  
  const darkMode = localStorage.getItem('darkMode') === 'true'? true : false;

  const subscriptionType = getMySubscriptionType();
  
  useEffect(()=>{
    getUserData();
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    
    // setSocketConnections(prev=>{
    //   if (prev === 0){
    //     connectSocket();
    //   }
    //   return prev + 1;
    // });
    
    // return () => {if (socket) socket.disconnect()}
  },[]);

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    socket = IO(connectionUrl, {
        auth: {
            token: token,
            notifications: true
        },
    });
  }

  const getUserData = async () => {
    const token = localStorage.getItem('token')? localStorage.getItem('token'): '';
    if (token !== '') {
      setUser({
        authToken: token,
        username: jwt(token).username,
      });
      updatePhoto();
      getUpdatedUserData();
    }
  }

  const getUpdatedUserData = async () => {
    await updateJwt();
    const token = localStorage.getItem('token')? localStorage.getItem('token'): '';
    if (token !== '') {
      setUser({
        authToken: token,
        username: jwt(token).username,
      });
    }
  }

  const login = (token) => {
    setUser({
        authToken: token,
        username: jwt(token).username,
    });
    localStorage.setItem('token', token);
    // connectSocket();
    updatePhoto();
  }

  const logout = () => {
    setUser(emptyUser);
    localStorage.removeItem('token');
  }

  const updateUsername = (username) => {
    setUser({...user, username: username})
  }

  const updateJwt = async () => {
    try {
        const res = await axios.post('../api/auth/updateJwt');
        localStorage.setItem('token', res.data);
    } catch (error) {}
  }

  const updatePhoto = async () => {
    setUserPhoto(null);
    try {
      const res = await axios.get('../api/photos/getProfilePhoto');
      if (res.data.includes('<DOCTYPE')) return;
      setUserPhoto(res.data);
    } catch (error){}
  }


  return (
    <userContext.Provider value={{user, setUser}}>
      <Routes>
        <Route exact path="/" element={user.authToken != ''? <Navigate replace to="/home"/> : <LandingPage/>}/>
        <Route path="/" element={user.authToken != ''? <NavBar handleLogOut={logout} userPhoto={userPhoto} subscriptionType={subscriptionType} userName={user.username}/> : <LandingPage/>}>
          <Route path="home" element={<HomePage/>} />
          <Route path="settings" element={<UserConfig updateUsername={updateUsername} subscriptionType={subscriptionType} updatePhoto={updatePhoto} updateUserData={getUpdatedUserData}/>} />
          <Route path="settings/premium" element={<PremiumSubscriptionPage subscriptionType={subscriptionType}/>} />
          <Route path="events" element={<EventsPage />}/>
          <Route path="events/newevent" element={<EventRegister />}/>
          <Route path="events/event" element={<EventConfig/>}/>
          <Route path="events/createPoll" element={<CreatePoll/>}/>
          <Route path="events/updatePoll" element={<PollConfig modify={true}/>}/>
          <Route path="events/answerPoll" element={<PollConfig modify={false} answer={true}/>}/>
          <Route path="events/viewPoll" element={<PollConfig modify={false} answer={false}/>}/>
          <Route path="events/reviewPoll" element={<PollReview/>}/>
          <Route path="history" element={<EventHistory />} />
          <Route path="reports" element={<ServicesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="home"/>
          <Route path="*" element={<Navigate replace to="/home"/>}/>
        </Route>
        <Route element={<ProtectedRoutes/>}>
          <Route path="events/invitation" element={<InvitationsPage/>} />
          <Route path="invite" element={<InviteLinkPage/>} />
          <Route path="events/serviceConfirmation" element={<ServiceInvitationPage/>} />
          {/* <Route path="events/invitation" element={user.authToken != ''? <InvitationsPage/> : <Login handleLogIn={login}/>} />
          <Route path="invite" element={user.authToken != ''? <InviteLinkPage/> : <Login handleLogIn={login}/>} />
          <Route path="events/serviceConfirmation" element={user.authToken != ''? <ServiceInvitationPage/> : <Login handleLogIn={login}/>} /> */}
        </Route>
        <Route path="/signup" element={<UserRegister />} />
        <Route path="/login" element={<Login handleLogIn={login}/>} />
        <Route path="/login/forgotPassword" element={<ForgotPassword/>} />
        <Route path="/login/resetPassword" element={<ResetPassword/>} />
        <Route path="postauth" element={<PostAuth handleLogIn={login}/>} />
      </Routes>
    </userContext.Provider>
  )
}

export default App;
