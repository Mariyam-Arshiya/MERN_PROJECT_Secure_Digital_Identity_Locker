import React,{useContext} from "react";

import {Navigate} from "react-router-dom";

import {AuthContext} from "../context/AuthContext";

function ProtectedRoute({children}){

const {user,booting}=useContext(AuthContext);

if(booting)

return <div className="page-state">Loading secure session...</div>;

if(!user)

return <Navigate to="/login" replace/>;

return children;

}

export default ProtectedRoute;
