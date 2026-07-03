import React,{useContext} from "react";

import {Navigate} from "react-router-dom";

import {AuthContext} from "../context/AuthContext";

function ProtectedRoute({children}){

const {user}=useContext(AuthContext);

if(!user)

return ;

return children;

}

export default ProtectedRoute;
