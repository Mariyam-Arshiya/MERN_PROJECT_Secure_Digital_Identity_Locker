import React,{useState,useContext} from "react";

import API from "../api/axios";

import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

function Register(){

const navigate=useNavigate();
const {setAuth}=useContext(AuthContext);

const [data,setData]=useState({

name:"",

email:"",

password:""

});

const register=async(e)=>{

e.preventDefault();

try{

const res=await API.post(

"/auth/register",

data

);

setAuth(res.data);

alert("Registration Success");

navigate("/dashboard");

}catch(error){

alert(error.response?.data?.message || "Registration failed");

}

};

return(
<div className="auth-shell">

<form className="auth-card" onSubmit={register}>

<span className="eyebrow">New Secure Locker</span>

<h1>Create Account</h1>

<p>Start a private vault for encrypted documents, uploads, share links and access logs.</p>

<input

placeholder="Name"
value={data.name}

onChange={(e)=>

setData({

...data,

name:e.target.value

})

}

/>

<input

placeholder="Email"
value={data.email}

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
value={data.password}

onChange={(e)=>

setData({

...data,

password:e.target.value

})

}

/>

<button type="submit">Register</button>

</form>

</div>
);

}

export default Register;
