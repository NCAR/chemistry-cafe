import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import NavDropDown from './NavDropDown';
import { Drawer } from '@mui/material';
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';
// import Modal from '@mui/material/Modal';
// import Typography from '@mui/material/Typography';

export const Header = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

    return(
        <Paper square={true} variant='outlined'>
            <Button onClick={toggleDrawer(true)}>
                <DensitySmallSharpIcon sx={{fontSize: 50}}></DensitySmallSharpIcon>
            </Button> 
            <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <NavDropDown />
            </Drawer>
        </Paper>
    );
};


export const Footer = () => {
    const handleBugClick = () => {
        window.open("https://github.com/NCAR/chemistrycafe/issues", "_blank");
    };

    const handleAccessibilityClick = () => {
        window.open("https://www.ucar.edu/accessibility", "_blank");
    }

    const [, setAboutOpen] = useState(false);
    const handleAboutOpen = () => setAboutOpen(true);
    const handleAbout = () => {
        handleAboutOpen();
    };

    const [, setCollabOpen] = useState(false);
    const handleCollabOpen = () => setCollabOpen(true);
    const handleCollab = () => {
        handleCollabOpen();
    };

    const [, setSponsorOpen] = useState(false);
    const handleSponsorOpen = () => setSponsorOpen(true);
    const handleSponsor = () => {
        handleSponsorOpen();
    };

    return(
        <Paper component="footer" square={true} variant='outlined'>
            <Container maxWidth="lg" sx={{display: "flex"}}>
                <Box component="img" src={"src/assets/nsf-stackseal-logo-lockup-dark.png"} sx={{height: "100px", width: "auto", pr: 10}}>
                </Box>
                <Box sx={{pr: 10}}>
                    <Button onClick={handleAbout}>
                        About
                    </Button>
                </Box>
                <Box sx={{pr: 10}}>
                    <Button onClick={handleCollab}>
                        Collaborators
                    </Button>
                </Box>
                <Box sx={{pr: 10}}>
                    <Button onClick={handleSponsor}>
                        Sponsors
                    </Button>
                </Box>
                <Box sx={{pr: 10}}>
                    <Button onClick={handleBugClick} variant="text">
                        Report a bug
                    </Button>
                </Box>
                <Box sx={{pr: 10}}>
                    <Button onClick={handleAccessibilityClick}>
                        Accessibility
                    </Button>
                </Box>
            </Container>        
        </Paper>
    );
};
