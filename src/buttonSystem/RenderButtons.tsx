import { Family, Mechanism, Reaction, Species, TagMechanism } from '../API/API_Interfaces';
import 'bootstrap/dist/css/bootstrap.css';
import { StyledFamilyButton, StyledMechanismsFromFamilyButton, StyledTagMechanismsFromMechanismButton, StyledSpeciesFromTagMechanismButton, StyledReactionsFromTagMechanismButton, StyledMechanismsButton } from './RenderButtonsStyling';

export type ButtonData = Family | Mechanism | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string, handleClick: (uuid: string, reactant_list_uuid?: string, product_list_uuid?: string) => void) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family, handleClick);
    case 'Mechanisms':
      return mechanismsButton(button as Mechanism, handleClick);
    case 'MechanismsFromFamily':
      return mechanismsFromFamilyButton(button as Mechanism, handleClick);
    case 'TagMechanismsFromMechanism':
      return tagMechanismsFromMechanismButton(button as TagMechanism, handleClick);
    case 'SpeciesFromTagMechanism':
      return speciesFromTagMechanismButton(button as Species, handleClick);
    case 'ReactionsFromTagMechanism':
      return reactionsFromTagMechanismButton(button as Reaction, handleClick);
    default:
      return null;
  }
};

const familiesButton = ({ uuid, name}: Family, handleClick: (uuid: string) => void) => (
  <StyledFamilyButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid}}>
    {name}
  </StyledFamilyButton>
);

const mechanismsButton = ({ uuid, name}: Mechanism, handleClick: (uuid: string) => void) => (
  <StyledMechanismsButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid}}>
    {name}
  </StyledMechanismsButton>
);

const mechanismsFromFamilyButton = ({ uuid, name}: Mechanism, handleClick: (uuid: string) => void) => (
  <StyledMechanismsFromFamilyButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid}}>
    {name}
  </StyledMechanismsFromFamilyButton>
);

const tagMechanismsFromMechanismButton = ({ uuid, tag}: TagMechanism, handleClick: (uuid: string) => void) => (
  <StyledTagMechanismsFromMechanismButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid}}>
    {tag}
  </StyledTagMechanismsFromMechanismButton>
);

const speciesFromTagMechanismButton = ({ uuid, type}: Species, handleClick: (uuid: string) => void) => (
  <StyledSpeciesFromTagMechanismButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid}}>
    {type}
  </StyledSpeciesFromTagMechanismButton>
);

const reactionsFromTagMechanismButton = ({ uuid, type, reactant_list_uuid, product_list_uuid}: Reaction, handleClick: (uuid: string, reactant_list_uuid?: string, product_list_uuid?: string) => void) => (
  <StyledReactionsFromTagMechanismButton onClick={() => handleClick(uuid, reactant_list_uuid, product_list_uuid)} style={{ width: '100%' }} {...{ uuid, reactant_list_uuid, product_list_uuid}}>
    {type}
  </StyledReactionsFromTagMechanismButton>
);

export default renderButton;
