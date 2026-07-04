import React, { useState, useEffect } from "react";

import API from "../api/axios";

import { useNavigate, useParams } from "react-router-dom";

function EditUser(){

const { id } = useParams();

const navigate = useNavigate();

const [user, setUser] = useState({

name: "",

email: "",

password: ""

});

useEffect(()=>{

const getUser = async()=>{

const res =

await API.get(`/users/${id}`);

setUser(res.data);

};

getUser();

},[id]);

const update = async(e)=>{

e.preventDefault();

await API.put(

`/users/update/${id}`,

user

);

alert("Updated");

navigate("/users");

};

return(
<>
Edit User

<input

value={user.name}

onChange={(e)=>

setUser({

...user,

name:e.target.value

})

}

/>

<input

value={user.email}

onChange={(e)=>

setUser({

...user,

email:e.target.value

})

}

/>

<button onClick={update}>Update</button>

</>
);

}

export default EditUser;
