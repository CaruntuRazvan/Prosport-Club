import React from "react";

const HomePage = ({ user }) => {
  return (
    <div>
      <h2>Welcome to the Home Page!</h2>
      {user ? (
        <p>You are logged in as <strong>{user.name}</strong>.</p>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default HomePage;
