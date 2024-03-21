import { useNavigate } from 'react-router-dom';

  const Settings = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
        return (
          <button type="button" onClick={handleClick}>
            Home
          </button>
        );

    }

    export default Settings;