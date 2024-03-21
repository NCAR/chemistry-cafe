import React from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies } from '.././buttonSystem/API_Methods';

  const FamilyPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
        return (
            <div>
                <button type="button" onClick={handleClick}>
                    Go Home from Family
                </button>
                <ButtonSystemGrid buttonArray={[getFamilies()]} category={'Family'} size={'30%'} cols={1} />
            </div>
        );

    }

    export default FamilyPage;