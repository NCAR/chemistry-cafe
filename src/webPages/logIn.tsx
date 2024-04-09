import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import "./logIn.css";
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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

    const navigate = useNavigate();
    const handleClick = () => navigate('/LoggedIn');

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
                    // navigate('/LoggedIn');
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

        return (
          <section className="layout">
            <div className="L1">
                <Box component="img" src={"src/assets/TAMULogo.png"} alt={"Texas A&M"} sx={{ height: "300px", width: "auto" }} />
            </div>
            <div className="M1">
                <Box component="img" src={"src/assets/NSF-NCAR_Lockup-UCAR-Dark.png"} alt={"Texas A&M"} sx={{ height: "275px", width: "auto" }} />
            </div>
            <div className="M3">
                <Box sx={{ width: '100%', maxWidth: 700 }}>
                    <Typography variant="h1">
                        Chemistry Cafe
                    </Typography>
                </Box>
            </div>
            <div className="M4">
                <br />
                <br />
                <p></p>
                {profile ? (
                    <div>
                        <img src={profile.picture} alt="user profile" />
                        <h3>User Logged in</h3>
                        <p>Name: {profile.name}</p>
                        <p>Email Address: {profile.email}</p>
                        <br />
                        <br />
                        <Button onClick={handleClick}>PROCEED</Button>
                        <Button onClick={logOut}>Log out</Button>
                        
                    </div>
                ) : (
                    <Button onClick={() => login()}>Sign in with Google 🚀</Button>
                )}
            </div>

            <div className='M5'>
                <Button type="button" onClick={handleClick}>
                    Continue as Guest
                </Button>
            </div>

          </section>
        );

    }

    export default LogIn;