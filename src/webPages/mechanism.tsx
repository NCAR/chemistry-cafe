import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getFamilies, getMechanismsFromFamily } from '.././buttonSystem/API/API_GetMethods';
import { useFamilyUuid, useMechanismUuid } from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox, StyledModal } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import "./family.css";

const MechanismPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const { familyUuid, handleFamilyClick } = useFamilyUuid();
    const { handleFamilyMechanismClick } = useMechanismUuid();
    // var modal1 = document.getElementById("modal1");
    // var but1 = document.getElementById("actionBut1");
    // function openModal(): void{
    //     if(modal1 !== null){
    //         modal1.style.display = "block";
    //     }
    // }
    // const callModal = () => openModal;

        return (
            <section className="layout">

                <div className="TL">
                    <StyledHeader>
                        PATH HERE
                    </StyledHeader>
                    <button type="button" onClick={handleClick}>
                        Go Home from Mechanism
                    </button>
                    
                </div>

                <StyledActionBar>
                    <StyledActionBarButton as="a" href="/FamilyPage">Publish</StyledActionBarButton>
                    <StyledActionBarButton id="actionBut1" as="a">
                        Share
                    </StyledActionBarButton>
                    <StyledActionBarButton as="a" href="/">Get DOI</StyledActionBarButton> 
                </StyledActionBar>

                <StyledModal>
                    <div className="modal" id="modal1">
                        MODAL
                    </div>
                </StyledModal>

                <div className="ML">
                    <ButtonSystemGrid buttonArray={[getFamilies()]} handleClick={handleFamilyClick} category={'Families'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleFamilyMechanismClick} category={'MechanismsFromFamily'} height={'80vh'} cols={1} />
                </StyledDetailBox>
            </section>
        );
}

export default MechanismPage;