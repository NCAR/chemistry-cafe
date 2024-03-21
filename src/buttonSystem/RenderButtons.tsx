import { Button } from 'react-bootstrap';
import { Family, Mechanism, Reaction, Species, TagMechanism } from './API_Interfaces';
import 'bootstrap/dist/css/bootstrap.css';

export type ButtonData = Family | Mechanism | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string, handleClick: (uuid: string) => void) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family, handleClick);
    case 'MechanismsFromFamily':
      return mechanismsFromFamilyButton(button as Mechanism, handleClick);
    default:
      return null;
  }
};

const familiesButton = ({ uuid, name, isdel }: Family, handleClick: (uuid: string) => void) => (
  <Button onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const mechanismsFromFamilyButton = ({ uuid, name, isdel }: Mechanism, handleClick: (uuid: string) => void) => (
  <Button onClick={() => handleClick(uuid)} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

export default renderButton;
