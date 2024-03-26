import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import "./logIn.css";

interface User {
    access_token: string;
    // Add any other fields you expect to receive from the login response
}

interface Profile {
    picture: string;
    name: string;
    email: string;
    // Add any other fields you expect to receive from the profile response
}

  const LogIn = () => {

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
        if (user) {
            axios
                .get<Profile>(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    setProfile(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    const navigate = useNavigate();
    const handleClick = () => navigate('/LoggedIn');

        return (
          <div className="background-color">
            LOG IN

            <button type="button" onClick={handleClick}>
              Go To Logged In
            </button>

            <h2>React Google Login</h2>
            <br />
            <br />
            {profile ? (
                <div>
                    <img src={profile.picture} alt="user profile" />
                    <h3>User Logged in</h3>
                    <p>Name: {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                    <br />
                    <br />
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <button onClick={() => login()}>Sign in with Google 🚀</button>
            )}
          </div>
        );

    }

    export default LogIn;