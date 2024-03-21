import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '.././buttonSystem/API_Methods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';

  const FamilyPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');
    
    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { handleMechanismClick } = useMechanismUuid();

        return (
            <div>
                <button type="button" onClick={handleClick}>
                    Go Home from Family
                </button>
                <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} size={'30%'} cols={1}/>
                <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleMechanismClick} category={'MechanismsFromFamily'} size={'30%'} cols={1} />
            </div>
        );

    }

    export default FamilyPage;