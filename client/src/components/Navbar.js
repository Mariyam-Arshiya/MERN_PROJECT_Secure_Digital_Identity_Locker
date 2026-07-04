import React,{useContext} from "react";
import { Link,useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {

  const {user,logout}=useContext(AuthContext);
  const navigate=useNavigate();

  const signOut=()=>{
    logout();
    navigate("/login");
  };

  return (
    <nav className="top-nav">
      <h2>Secure Digital Identity Locker</h2>

      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {!user && (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
        {!user && (
          <li>
            <Link to="/">Register</Link>
          </li>
        )}
        {user && (
          <li>
            <button className="nav-button" onClick={signOut}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
