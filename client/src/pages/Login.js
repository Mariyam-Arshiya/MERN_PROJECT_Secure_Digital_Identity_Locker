import React,{useState,useContext} from "react";

import API from "../api/axios";

import {useNavigate} from "react-router-dom";

import {AuthContext} from "../context/AuthContext";

function Login(){

const navigate=useNavigate();

const {setUser}=useContext(AuthContext);

const [data,setData]=useState({

email:"",

password:""

});

const login=async(e)=>{

e.preventDefault();

const res=

await API.post(

"/auth/login",

data

);

setUser(res.data);

alert("Login Successful");

navigate("/dashboard");

};

return(
<>
Login

<input

placeholder="Email"

onChange={(e)=>

setData({

...data,

email:e.target.value

})

}

/>

<input

type="password"

placeholder="Password"

onChange={(e)=>

setData({

...data,

password:e.target.value

})

}

/>

<button onClick={login}>Login</button>

</>
);

}

export default Login;