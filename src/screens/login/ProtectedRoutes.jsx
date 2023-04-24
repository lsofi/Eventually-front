import { useContext } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { userContext } from "../../App";

const useAuth = () => {
    const token = localStorage.getItem('token')? localStorage.getItem('token'): '';
    return (token !== '')
}

const ProtectedRoutes = () => {
    const location = useLocation();
    const isAuthenticated = useAuth();
    return isAuthenticated ? 
    <Outlet/> 
    : 
    <Navigate to="/login" replace state={{from: location}} />
}

export default ProtectedRoutes;