import React, { useEffect, useState } from "react";
import API from "../api/axios";

function Users() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const res = await API.get("/users");
      console.log("USERS:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  return (
    <div className="box">
      <h2>Users Page</h2>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map((user, index) => (
          <div key={index} className="user">
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Users;