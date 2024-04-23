import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import NavDropDown from './NavDropDown';
import { Drawer } from '@mui/material';

export const Header = () => {
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

    return(
        <div style={{backgroundColor: 'green', height: '70%'}}>
            <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <NavDropDown />
            </Drawer>
            {/* <Button sx={{backgroundColor: 'red'}}>
                CHEMISTRY CAFE
            </Button> */}
        </div>
    );
};


export const Footer = () => {
    return(
        <div style={{backgroundColor: 'green', height: '100%',width: '100%'}}>
            <Button sx={{backgroundColor: 'red', height: '100%'}}>
                FOOT
            </Button>
        </div>
        
        
    );
};
