import React from "react";

import {
BrowserRouter,
Routes,
Route
}
from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import EditUser from "./pages/EditUser";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";

import {
AuthProvider
}
from "./context/AuthContext";

function App(){

return(

<AuthProvider>

<BrowserRouter>

<Navbar/>

<Routes>

<Route path="/"
element={<Register/>}
/>

<Route path="/login"
element={<Login/>}
/>

<Route path="/dashboard"

element={

<ProtectedRoute>

<Dashboard/>

</ProtectedRoute>

}

/>

<Route path="/users"

element={

<ProtectedRoute>

<Users/>

</ProtectedRoute>

}

/>

<Route path="/edit/:id"

element={

<ProtectedRoute>

<EditUser/>

</ProtectedRoute>

}

/>

</Routes>

</BrowserRouter>

</AuthProvider>

);

}

export default App;
