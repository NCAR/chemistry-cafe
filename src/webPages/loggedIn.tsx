import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import DensitySmallSharpIcon from '@mui/icons-material/DensitySmallSharp';


  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickMech = () => navigate('/Mechanisms');
    const handleClickSettings = () => navigate('/Settings');

    const [openDrawer, setOpenDrawer] = React.useState(false);
    const toggleDrawer = (newOpenDrawer: boolean) => () => {
      setOpenDrawer(newOpenDrawer);
    };
    const goHome = () => navigate('/LoggedIn');
    const goFamily = () => navigate('/FamilyPage');
    const goMech = () => navigate('/Mechanisms');
    const goLogOut = () => navigate('/');

    const DrawerList = (
      <Box sx={{width: 250}} role="presentation" onClick={toggleDrawer(false)}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={goHome}>
              <ListItemText primary={"Home"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={goFamily}>
              <ListItemText primary={"Families"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={goMech}>
              <ListItemText primary={"Mechanisms"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={goLogOut}>
              <ListItemText primary={"Log Out"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    );

    const style = {
      height: '75px',
      width: '500px',
    };
        return (
          <section className='layout'>

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
                <Button sx={style} onClick={handleClickMech}>
                  Mechanisms
                </Button>
                <p></p>
                <Button sx={style} onClick={handleClickSettings}>
                  Settings
                </Button>
              </ButtonGroup>
            </div>
            
            <div>
              <Drawer
              open={openDrawer} onClose={toggleDrawer(false)}
              >
                {DrawerList}
              </Drawer>
            </div>
          </section>
          
        );

    }

    export default LoggedIn;