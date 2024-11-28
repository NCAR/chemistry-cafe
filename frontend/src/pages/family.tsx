import React, { useState } from "react";

import RenderFamilyTree from "../components/RenderFamilyTree";
import RenderSpeciesReactionTable from "../components/RenderSpeciesReactionTable";
import { CreateFamilyModal, CreateMechanismModal } from "../components/Modals";

import { StyledDetailBox } from "./familyStyling";

import { Header, Footer } from "../components/HeaderFooter";

import "../styles/family.css";
import { Family, Mechanism } from "../API/API_Interfaces";

const FamilyPage = () => {
  const [selectedMechanism, setSelectedMechanism] = useState<Mechanism | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedMechanismId, setSelectedMechanismId] = useState<string | null>(
    null,
  );

  const [selectedMechanismName, setSelectedMechanismName] = useState<
    string | null
  >(null);

  const [createdFamilyBool, setCreatedFamilyBool] = useState<boolean>(false);
  const [createFamilyOpen, setCreateFamilyOpen] = React.useState(false);
  const handleCreateFamilyOpen = () => setCreateFamilyOpen(true);
  const handleCreateFamilyClose = () => setCreateFamilyOpen(false);

  const [createdMechanismBool, setCreatedMechanismBool] =
    useState<boolean>(false);
  const [createMechanismOpen, setCreateMechanismOpen] = React.useState(false);
  const handleCreateMechanismOpen = () => setCreateMechanismOpen(true);
  const handleCreateMechanismClose = () => setCreateMechanismOpen(false);

  return (
    <section className="layoutFam">
      <div className="headerBar">
        <Header></Header>
      </div>

      <div className="familiesMenu" style={{ overflow: "auto" }}>
        <RenderFamilyTree
          selectedMechanism={selectedMechanism}
          setSelectedMechanism={setSelectedMechanism}
          selectedFamily={selectedFamily}
          setSelectedFamily={setSelectedFamily}
          selectedFamilyId={selectedFamilyId}
          setSelectedFamilyId={setSelectedFamilyId}
          setSelectedMechanismId={setSelectedMechanismId}
          setSelectedMechanismName={setSelectedMechanismName}
          handleCreateFamilyOpen={handleCreateFamilyOpen}
          handleCreateMechanismOpen={handleCreateMechanismOpen}
          createdFamilyBool={createdFamilyBool}
          setCreatedFamilyBool={setCreatedFamilyBool}
          createdMechanismBool={createdMechanismBool}
          setCreatedMechanismBool={setCreatedMechanismBool}
        />
      </div>

      <div className="footerBar">
        <Footer></Footer>
      </div>
      <div className="speciesReactions">
        <StyledDetailBox>
          <RenderSpeciesReactionTable
            selectedFamilyID={selectedFamilyId}
            selectedMechanismID={selectedMechanismId}
            selectedMechanismName={selectedMechanismName}
          />
        </StyledDetailBox>
      </div>

      <CreateFamilyModal
        open={createFamilyOpen}
        onClose={handleCreateFamilyClose}
        setCreatedFamilyBool={setCreatedFamilyBool}
      />
      <CreateMechanismModal
        open={createMechanismOpen}
        onClose={handleCreateMechanismClose}
        selectedFamilyId={selectedFamilyId}
        setCreatedMechanismBool={setCreatedMechanismBool}
      />
    </section>
  );
};

export default FamilyPage;
