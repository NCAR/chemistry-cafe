import { Family, Reaction, Species, TagMechanism } from '../API/API_Interfaces';
import { StyledFamilyButton, StyledTagMechanismsFromFamilyButton, StyledSpeciesFromTagMechanismButton, StyledReactionsFromTagMechanismButton } from './RenderButtonsStyling';
import 'bootstrap/dist/css/bootstrap.css';

export type ButtonData = Family | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string, handleClick: (uuid: string) => void, uuid: string) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family, handleClick, uuid);
    case 'TagMechanismsFromFamily':
      return tagMechanismsFromFamilyButton(button as TagMechanism, handleClick);
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

const tagMechanismsFromFamilyButton = ({ uuid, tag}: TagMechanism, handleClick: (uuid: string) => void) => (
  <StyledTagMechanismsFromFamilyButton active={'false'} onClick={() => handleClick(uuid)} style={{ width: '100%' }}>
    {tag}
  </StyledTagMechanismsFromFamilyButton>
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
