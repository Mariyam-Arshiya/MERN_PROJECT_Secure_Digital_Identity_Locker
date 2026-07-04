import React,{useState,useContext} from "react";

import API from "../api/axios";

import {useNavigate} from "react-router-dom";

import {AuthContext} from "../context/AuthContext";

function Login(){

const navigate=useNavigate();

const {setAuth}=useContext(AuthContext);

const [data,setData]=useState({

email:"",

password:""

});

const login=async(e)=>{

e.preventDefault();

try{

const res=

await API.post(

"/auth/login",

data

);

setAuth(res.data);

alert(res.data.suspicious ? "Login successful. New device or IP detected." : "Login Successful");

navigate("/dashboard");

}catch(error){

alert(error.response?.data?.message || "Login failed");

}

};

return(
<div className="auth-shell">

<form className="auth-card" onSubmit={login}>

<span className="eyebrow">Secure Vault Access</span>

<h1>Login</h1>

<p>Use your account to open your encrypted digital identity locker.</p>

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

<button type="submit">Login</button>

</form>

</div>
);

}

export default Login;
