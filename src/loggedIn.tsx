import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from './buttonSystem/ButtonSystemGrid';
import { getFamilies } from './buttonSystem/API_Methods';

  const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
        return (
          <div>
            <button type="button" onClick={handleClick}>
              Go Home
            </button>
          
            <ButtonSystemGrid buttonArray={[getFamilies()]} category={'Family'} size={'30%'} cols={1} />
          </div>
        );

    }

    export default LoggedIn;