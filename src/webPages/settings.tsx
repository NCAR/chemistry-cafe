import { useNavigate } from 'react-router-dom';

  const Settings = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
        return (
          <div>
            SETTINGS
            <button type="button" onClick={handleClick}>
            Home
          </button>
          </div>
          
        );

    }

    export default Settings;