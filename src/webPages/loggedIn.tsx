import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../buttonSystem/RenderButtonsStyling';
import "./loggedIn.css";
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickMech = () => navigate('/Mechanisms');
    const handleClickSettings = () => navigate('/Settings');

    const style = {
      height: '75px',
      width: '500px',
    };
        return (
          <section className='layout'>
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
          </section>
        );

    }

    export default LoggedIn;