import { Family, Mechanism, Reaction, Species, TagMechanism } from './API/API_Interfaces';
import 'bootstrap/dist/css/bootstrap.css';
import { StyledFamilyButton, StyledMechanismsFromFamilyButton, StyledTagMechanismsFromMechanismButton } from './RenderButtonsStyling';

export type ButtonData = Family | Mechanism | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string, handleClick: (uuid: string) => void) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family, handleClick);
    case 'MechanismsFromFamily':
      return mechanismsFromFamilyButton(button as Mechanism, handleClick);
    case 'TagMechanismsFromMechanism':
      return tagMechanismsFromMechanismButton(button as TagMechanism, handleClick);
    default:
      return null;
  }
};

const familiesButton = ({ uuid, name, isDel }: Family, handleClick: (uuid: string) => void) => (
  <StyledFamilyButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid, isDel }}>
    {name}
  </StyledFamilyButton>
);

const mechanismsFromFamilyButton = ({ uuid, name, isDel }: Mechanism, handleClick: (uuid: string) => void) => (
  <StyledMechanismsFromFamilyButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid, isDel }}>
    {name}
  </StyledMechanismsFromFamilyButton>
);

const tagMechanismsFromMechanismButton = ({ uuid, tag, isDel }: TagMechanism, handleClick: (uuid: string) => void) => (
  <StyledTagMechanismsFromMechanismButton onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid, isDel }}>
    {tag}
  </StyledTagMechanismsFromMechanismButton>
);

export default renderButton;
