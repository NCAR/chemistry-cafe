import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../buttonSystem/RenderButtonsStyling';

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickMech = () => navigate('/FamilyPage');
    const handleClickSettings = () => navigate('/Settings');
        return (
          <div>
            LOGGED IN
            <StyledButton onClick={handleClickMech}>
              Mechanisms
            </StyledButton>
            <StyledButton onClick={handleClickSettings}>
              Settings
            </StyledButton>
          </div>
        );

    }

    export default LoggedIn;