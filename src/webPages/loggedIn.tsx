import { useNavigate } from 'react-router-dom';
import { StyledButton } from '../buttonSystem/RenderButtonsStyling';
import "./loggedIn.css";

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickMech = () => navigate('/Mechanisms');
    const handleClickSettings = () => navigate('/Settings');
        return (
          <section className='layout'>
            <div className="M2">
              <StyledButton onClick={handleClickFam}>
                Family
              </StyledButton>
            </div>
            <div className="M3">
              <StyledButton onClick={handleClickMech}>
                Mechanisms
              </StyledButton>
            </div>
            <div className="M4">
              <StyledButton onClick={handleClickSettings}>
                Settings
              </StyledButton>
            </div>
          </section>
        );

    }

    export default LoggedIn;