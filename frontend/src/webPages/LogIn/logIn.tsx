import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

import "./logIn.css";
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import { Footer } from '../Components/HeaderFooter';
import Holidays from '../Components/Holidays';

interface User {
    access_token: string;
}

interface Profile {
    picture: string;
    name: string;
    email: string;
}

const LogIn = () => {
    const { setUser } = useAuth();
    const [user, setLocalUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoggedOut, setIsLoggedOut] = useState(false); // Track logout state for re-render
    const navigate = useNavigate();
    const handleClick = () => navigate('/LoggedIn');
    const [aboutOpen, setAboutOpen] = useState(false);
    const handleAboutOpen = () => setAboutOpen(true);
    const handleAboutClose = () => setAboutOpen(false);

    const handleAbout = () => {
        handleAboutOpen();
    };

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            setLocalUser(codeResponse);
            setIsLoggedOut(false); // Reset to logged-in state
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
        if (user) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    const profileData = res.data;
                    setProfile(profileData);

                    if (!profileData.email) {
                        console.error('Profile data does not contain an email.');
                        alert('Profile data is missing email information.');
                        return;
                    }

                    axios.get(`http://localhost:8080/api/User/email=${profileData.email}`)
                        .then((response) => {
                            if (response.status === 200 && response.data) {
                                const updatedUser = {
                                    access_token: user.access_token,
                                    ...response.data
                                };
                                setLocalUser(updatedUser);
                                const contextUser = {
                                    uuid: response.data.uuid,
                                    log_in_info: response.data.log_in_info,
                                    role: response.data.role || 'unverified'
                                };
                                setUser(contextUser);
                            } else {
                                axios.post('http://localhost:8080/api/User/create', JSON.stringify(profileData.email), {
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then((response) => {
                                    const newUser = {
                                        access_token: user.access_token,
                                        ...response.data
                                    };
                                    setLocalUser(newUser);
                                    const contextUser = {
                                        uuid: response.data.uuid,
                                        log_in_info: response.data.log_in_info,
                                        role: response.data.role || 'unverified'
                                    };
                                    setUser(contextUser);
                                    alert('New user created successfully');
                                })
                                .catch((error) => {
                                    console.error('Error creating user:', error);
                                    alert('Error creating user:' + error + ":" + profileData.email);
                                });
                            }
                        })
                        .catch((error) => {
                            console.error('Error checking user existence:', error);
                            alert('Error checking user existence' + error);
                        });
                })
                .catch((err) => {
                    console.error('Error fetching user profile:', err);
                    alert('Error fetching profile');
                });
        }
    }, [user, setUser]);

    const logOut = () => {
        googleLogout();
        setProfile(null);
        setLocalUser(null);
        setUser(null);
        setIsLoggedOut(true); // Set logged-out state
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

    return (
        <section className="layoutLogIn" key={isLoggedOut ? 'logged-out' : 'logged-in'}>
            <Holidays />
            <div className="M2">
                <Box sx={{ width: '100%', maxWidth: 700 }}>
                    <Typography variant="h2" sx={{ color: 'white' }}>
                        Chemistry Cafe
                    </Typography>
                </Box>
            </div>
            <div className='M3'>
                <Box>
                    <Typography variant="h6" sx={{ color: '#C3D7EE' }}>
                        A collaborative tool to share, edit, manage, and export chemical mechanisms across the scientific community
                        and into MusicBox Interactive. <br />
                    </Typography>
                </Box>
            </div>
            <div className="M4">
                <br />
                <br />
                <p></p>
                {profile ? (
                    <div>
                        <Box sx={{ bgcolor: '#C3D7EE', borderWidth: '2px' }}>
                            <img src={profile.picture} alt="user profile" />
                            <h3>User Logged in</h3>
                            <p>Name: {profile.name}</p>
                            <p>Email Address: {profile.email}</p>
                            <br />
                            <br />
                        </Box>
                        <p></p>
                        <Button variant='contained' onClick={handleClick} color='success' sx={{ width: '50%' }}>PROCEED</Button>
                        <Button variant='contained' onClick={logOut} color='error' sx={{ width: '50%' }}>Log out</Button>
                        <p></p>
                    </div>
                ) : (
                    <Button variant='contained' onClick={() => login()} endIcon={<GoogleIcon />} sx={{ width: '50%' }}>Sign in</Button>
                )}
            </div>

            <div className='M5'>
                <Button variant='contained' onClick={handleClick} endIcon={<NoAccountsIcon />} sx={{ width: '50%' }}>
                    Continue as Guest
                </Button>
            </div>

            <div className='M7'>
                <Button variant='contained' onClick={handleAbout} sx={{ width: '50%' }}>
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
                            Sydney Ferris, Josh Hare, Nishka Mittal, Oreoluwa Ogunleye, Brittain Schiller  <br></br>Fall 2024 Capstone Team<br></br>  <br></br>
                            Paul Cyr, Brandon Longuet, Brian Nguyen <br></br> Spring 2024 Capstone Team <br></br> <p></p>
                            Kyle Shores <br></br> Spring 2024 Capstone Sponsor Representative
                        </Typography>
                    </Box>
                </Modal>
            </div>

            <div className='L9LogIn'>
                <Footer></Footer>
            </div>
        </section>
    );
}

export default LogIn;
