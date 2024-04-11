import { Family, Mechanism, Reaction, Species, TagMechanism } from '../API/API_Interfaces';
import { StyledFamilyButton, StyledMechanismsFromFamilyButton, StyledTagMechanismsFromMechanismButton, StyledSpeciesFromTagMechanismButton, StyledReactionsFromTagMechanismButton, StyledMechanismsButton } from './RenderButtonsStyling';
import 'bootstrap/dist/css/bootstrap.css';

export type ButtonData = Family | Mechanism | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string, handleClick: (uuid: string) => void, uuid: string) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family, handleClick, uuid);
    case 'Mechanisms':
      return mechanismsButton(button as Mechanism, handleClick, uuid);
    case 'MechanismsFromFamily':
      return mechanismsFromFamilyButton(button as Mechanism, handleClick, uuid);
    case 'TagMechanismsFromMechanism':
      return tagMechanismsFromMechanismButton(button as TagMechanism, handleClick);
    case 'SpeciesFromTagMechanism':
      return speciesFromTagMechanismButton(button as Species, handleClick, uuid);
    case 'ReactionsFromTagMechanism':
      return reactionsFromTagMechanismButton(button as Reaction, handleClick, uuid);
    default:
      return null;
  }
};


const familiesButton = ({ uuid, name}: Family, handleClick: (uuid: string) => void, familyUuid: string) => (
  <StyledFamilyButton active={familyUuid === uuid ? 'true' : 'false'}onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {name}
  </StyledFamilyButton>
);

const mechanismsButton = ({ uuid, name}: Mechanism, handleClick: (uuid: string) => void, mechanismUuid: string) => (
  <StyledMechanismsButton active={mechanismUuid === uuid ? 'true' : 'false'} onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {name}
  </StyledMechanismsButton>
);

const mechanismsFromFamilyButton = ({ uuid, name}: Mechanism, handleClick: (uuid: string) => void, mechanismUuid: string) => (
  <StyledMechanismsFromFamilyButton active={mechanismUuid === uuid ? 'true' : 'false'} onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {name}
  </StyledMechanismsFromFamilyButton>
);

const tagMechanismsFromMechanismButton = ({ uuid, tag}: TagMechanism, handleClick: (uuid: string) => void) => (
  <StyledTagMechanismsFromMechanismButton active={'false'} onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {tag}
  </StyledTagMechanismsFromMechanismButton>
);

const speciesFromTagMechanismButton = ({ uuid, type}: Species, handleClick: (uuid: string) => void, speciesUuid: string) => (
  <StyledSpeciesFromTagMechanismButton active={speciesUuid === uuid ? 'true' : 'false'} onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {type}
  </StyledSpeciesFromTagMechanismButton>
);

const reactionsFromTagMechanismButton = ({ uuid, type, reactant_list_uuid, product_list_uuid}: Reaction, handleClick: (uuid: string, reactant_list_uuid?: string, product_list_uuid?: string) => void, reactionUuid: string) => (
  <StyledReactionsFromTagMechanismButton active={reactionUuid === uuid ? 'true' : 'false'} onClick={() => handleClick(uuid, reactant_list_uuid, product_list_uuid)} style={{ width: '100%' }}>
    {type}
  </StyledReactionsFromTagMechanismButton>
);



export default renderButton;
