import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '../buttonSystem/ButtonSystemGrid';
import { getFamilies } from '../buttonSystem/API_Methods';

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickMech = () => navigate('/FamilyPage');
    const handleClickSettings = () => navigate('/Settings');
        return (
          <div>
            LOGGED IN
            <button type="button" onClick={handleClickMech}>
              Mechanisms
            </button>
            <button type="button" onClick={handleClickSettings}>
              Settings
            </button>
          </div>
        );

    }

    export default LoggedIn;