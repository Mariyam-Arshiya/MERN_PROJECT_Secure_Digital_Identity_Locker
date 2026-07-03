import React,{useState} from "react";

import API from "../api/axios";

import {useNavigate} from "react-router-dom";

function Register(){

const navigate=useNavigate();

const [data,setData]=useState({

name:"",

email:"",

password:""

});

const register=async(e)=>{

e.preventDefault();

await API.post(

"/auth/register",

data

);

alert("Registration Success");

navigate("/login");

};

return(
<>
Create Account

<input

placeholder="Name"

onChange={(e)=>

setData({

...data,

name:e.target.value

})

}

/>

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

<button onClick={register}>Register</button>

</>
);

}

export default Register;
