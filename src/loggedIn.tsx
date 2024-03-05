import React from 'react';
import { useNavigate } from 'react-router-dom';

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
        return (
          <button type="button" onClick={handleClick}>
            Go Home
          </button>
        );

    }

    export default LoggedIn;