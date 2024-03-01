import { Button } from 'react-bootstrap';
import { Family, Mechanism, ProperyType, Reaction, Species, TagMechanism } from './API_Interfaces';
import 'bootstrap/dist/css/bootstrap.css';

export type ButtonData = Family | Mechanism | ProperyType | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string) => {
  switch (category) {
    case 'Family':
      return familyButton(button as Family);
    case 'Mechanism':
      return mechanismButton(button as Mechanism);
    case 'ProperyType':
      return propertyTypeButton(button as ProperyType);
    case 'Reaction':
      return reactionButton(button as Reaction);
    case 'Species':
      return speciesButton(button as Species);
    case 'TagMechanism':
      return tagMechanismButton(button as TagMechanism);
    default:
      return null;
  }
};

const familyButton = ({ uuid, name, isdel }: Family) => (
  <Button style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const mechanismButton = ({ uuid, name, isdel }: Mechanism) => (
  <Button style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const propertyTypeButton = ({ uuid, name, units, validation, isdel }: ProperyType) => (
  <Button style={{ width: '100%' }} {...{ uuid, units, validation, isdel }}>
    {name}
  </Button>
);

const reactionButton = ({ uuid, type, isdel }: Reaction) => (
  <Button style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const speciesButton = ({ uuid, type, isdel }: Species) => (
  <Button style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const tagMechanismButton = ({ uuid, tag, isdel }: TagMechanism) => (
  <Button style={{ width: '100%' }} {...{ uuid, isdel }}>
    {tag}
  </Button>
);

export default renderButton;
