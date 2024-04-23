import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Drawer from '@mui/material/Drawer';
import NavDropDown from '../Components/NavDropDown';

import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';

import "./loggedIn.css";

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickSettings = () => navigate('/Settings');

    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };

    const style = {
      height: '75px',
      width: '500px',
    };
        return (
          <section className='layoutLoggedIn'>

            <div className='L1'>
              <Button onClick={toggleDrawer(true)}>
                <DensitySmallSharpIcon sx={{fontSize: 50}}></DensitySmallSharpIcon>
              </Button>
            </div>

            <div className="M4">
              <ButtonGroup orientation='vertical' variant='contained'>
                <Button sx={style} onClick={handleClickFam}>
                  Families
                </Button>
                <p></p>
                <Button sx={style} onClick={handleClickSettings}>
                  Settings
                </Button>
              </ButtonGroup>
            </div>
            
            <div>
              <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                <NavDropDown />
              </Drawer>
            </div>
          </section>
          
        );

    }

    export default LoggedIn;