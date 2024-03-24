import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '.././buttonSystem/API_Methods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarA, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import "./family.css";

const FamilyPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { handleMechanismClick } = useMechanismUuid();

        return (
            <section className="layout">

                <div className="TL">
                    <StyledHeader>
                        PATH HERE
                    </StyledHeader>
                    <button type="button" onClick={handleClick}>
                        Go Home from Family
                    </button>
                </div>

                <StyledActionBar>
                    <StyledActionBarA>
                        HELLO
                    </StyledActionBarA>
                </StyledActionBar>

                <div className="ML">
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} size={'30%'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleMechanismClick} category={'MechanismsFromFamily'} size={'30%'} cols={1} />
                </StyledDetailBox>
            </section>
        );
}

export default FamilyPage;