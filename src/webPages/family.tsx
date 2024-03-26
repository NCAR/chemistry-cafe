import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '.././buttonSystem/API_Methods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import "./family.css";

const FamilyPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { handleFamilyMechanismClick } = useMechanismUuid();

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
                    <StyledActionBarButton as="a" href="/">Publish</StyledActionBarButton>
                    <StyledActionBarButton as="a" href="/FamilyPage">Share</StyledActionBarButton>
                    <StyledActionBarButton as="a" href="/">Get DOI</StyledActionBarButton> 
                </StyledActionBar>

                <div className="ML">
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    {/* <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleFamilyMechanismClick} category={'MechanismsFromFamily'} height={'80vh'} cols={1} /> */}
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'60vh'} cols={1}/>
                </StyledDetailBox>
            </section>
        );
}

export default FamilyPage;