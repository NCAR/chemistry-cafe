import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import "./logIn.css";
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { colors } from '@mui/material';

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

    const [aboutOpen, setAboutOpen] = React.useState(false);
    const handleAboutOpen = () => setAboutOpen(true);
    const handleAboutClose = () => setAboutOpen(false);

    const handleAbout = () => {
        handleAboutOpen();
    };

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

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const textStyle = {
        
    };

        return (
          <section className="layoutLogIn">
            <div className="M2">
                <Box sx={{ width: '100%', maxWidth: 700 }}>
                    <Typography variant="h2">
                        Chemistry Cafe
                    </Typography>
                </Box>
            </div>
            <div className='M3'>
                <Box>
                    <Typography variant="h6">
                        A collaborative tool to share, edit, manage, and export chemical mechanisms across the scientific community
                        and into MusicBox Interactive. <br></br>

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

            <div className='M7'>
                <Button onClick={handleAbout}>
                    About
                </Button>
            </div>

            <div>
                    <Modal
                        open={aboutOpen}
                        onClose={handleAboutClose}
                    >
                        <Box sx={style}>
                            <Typography variant='h4'>About</Typography>
                            <Box component="img" src={"src/assets/NSF-NCAR_Lockup-UCAR-Dark.png"} alt={"Texas A&M"} sx={{ height: "100px", width: "auto" }} />
                            <Box component="img" src={"src/assets/TAMULogo.png"} alt={"Texas A&M"} sx={{ height: "100px", width: "auto" }} />
                            <Typography variant='body1'>
                                The Chemistry Cafe tool was made possible by the collaboration between NCAR and Texas A&M through the
                                CSCE Capstone program.
                            </Typography>
                            <p></p>
                            <Typography variant='h6'>
                                Credits
                            </Typography>
                            <Typography variant='body1'>
                                Paul Cyr, Brandon Longuet, Brian Nguyen <br></br> Spring 2024 Capstone Team <br></br> <p></p>
                                Kyle Shores <br></br> Spring 2024 Capstone Sponsor Representative
                            </Typography>
                        </Box>
                    </Modal>
            </div>
          </section>
        );

    }

    export default LogIn;