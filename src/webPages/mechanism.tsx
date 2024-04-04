import { useNavigate } from 'react-router-dom';
import ButtonSystemGrid from '.././buttonSystem/ButtonSystemGrid';
import { getMechanismsFromFamily, getTagMechanismsFromMechanism } from '.././buttonSystem/API/API_GetMethods';
import { useFamilyUuid, useMechanismUuid, useTagMechanismUuid} from '../buttonSystem/GlobalVariables';
import { StyledHeader, StyledActionBar, StyledActionBarButton, StyledDetailBox } from '../buttonSystem/RenderButtonsStyling';
import Button from "@mui/material/Button";
import "./family.css";

const MechanismPage = () => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/');

    const { familyUuid } = useFamilyUuid();
    const { mechanismUuid, handleMechanismsClick } = useMechanismUuid();
    const { handleTagMechanismClick } = useTagMechanismUuid();
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

                    <div className="modal" id="modal1">
                        MODAL
                    </div>

                <div className="ML">
                    <ButtonSystemGrid buttonArray={[getMechanismsFromFamily(familyUuid as string)]} handleClick={handleMechanismsClick} category={'MechanismsFromFamily'} height={'60vh'} cols={1}/>
                </div>

                <StyledDetailBox>
                    <ButtonSystemGrid buttonArray={[getTagMechanismsFromMechanism(mechanismUuid as string)]} handleClick={handleTagMechanismClick} category={'TagMechanismsFromMechanism'} height={'80vh'} cols={1} />
                </StyledDetailBox>
            </section>
        );
}

export default MechanismPage;