import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';

import { Header, Footer } from '../components/HeaderFooter';

import "../styles/loggedIn.css";

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickSettings = () => navigate('/Settings');

    const style = {
      height: '75px',
      width: '500px',
    };
        return (
          <section className='layoutLoggedIn'>

            <div className='L1LoggedIn'>
              <Header></Header>
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

            <div className='L9LoggedIn'>
              <Footer></Footer>
            </div>
            
          </section>
          
        );

    }

    export default LoggedIn;