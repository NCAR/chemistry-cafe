import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';

  const Settings = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/LoggedIn');

    const style = {
      height: '75px',
      width: '500px',
    };

        return (
          <section className='layout'>
            <div className='M3'>
              <ButtonGroup orientation='vertical' variant='contained'>
                <Button sx={style} onClick={handleClick}>
                  Back
                </Button>
                <Button sx={style}>
                  WIP
                </Button>
              </ButtonGroup>
            </div>
          </section>
        );

    }

    export default Settings;