import { Button } from 'react-bootstrap';
import { Family, Mechanism, Reaction, Species, TagMechanism } from './API_Interfaces';
import { familiesOnClick, familyOnClick, mechanismsOnClick, mechanismOnClick, mechanismsFromFamilyOnClick, reactionsOnClick, reactionOnClick, reactionsFromTagMechanismOnClick, 
  allSpeciesOnClick, speciesOnClick, speciesFromTagMechanismOnClick, tagMechanismsOnClick, tagMechanismOnClick, tagMechanismsFromMechanismOnClick } from './OnClickMethods';
import 'bootstrap/dist/css/bootstrap.css';

export type ButtonData = Family | Mechanism | Reaction | Species | TagMechanism;

export const renderButton = (button: ButtonData, category: string) => {
  switch (category) {
    case 'Families':
      return familiesButton(button as Family);
    case 'Family':
      return familyButton(button as Family);
    case 'Mechanisms':
      return mechanismsButton(button as Mechanism);
    case 'Mechanism':
      return mechanismButton(button as Mechanism);
    case 'MechanismsFromFamily':
      return mechanismsFromFamilyButton(button as Mechanism);
    case 'Reactions':
      return reactionsButton(button as Reaction);
    case 'Reaction':
      return reactionButton(button as Reaction);
    case 'ReactionsFromTagMechanism':
      return reactionsFromTagMechanismButton(button as Reaction);
    case 'AllSpecies':
      return allSpeciesButton(button as Species);
    case 'Species':
      return speciesButton(button as Species);
    case 'SpeciesFromTagMechanism':
      return speciesFromTagMechanismButton(button as Species);
    case 'TagMechanisms':
      return tagMechanismsButton(button as TagMechanism);
    case 'TagMechanism':
      return tagMechanismButton(button as TagMechanism);
    case 'TagMechanismsFromMechanism':
      return tagMechanismsFromMechanismButton(button as TagMechanism);
    default:
      return null;
  }
};

const familiesButton = ({ uuid, name, isdel }: Family) => (
  <Button onClick={familiesOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const familyButton = ({ uuid, name, isdel }: Family) => (
  <Button onClick={familyOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const mechanismsButton = ({ uuid, name, isdel }: Mechanism) => (
  <Button onClick={mechanismsOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const mechanismButton = ({ uuid, name, isdel }: Mechanism) => (
  <Button onClick={mechanismOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const mechanismsFromFamilyButton = ({ uuid, name, isdel }: Mechanism) => (
  <Button onClick={mechanismsFromFamilyOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {name}
  </Button>
);

const reactionsButton = ({ uuid, type, isdel }: Reaction) => (
  <Button onClick={reactionsOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const reactionButton = ({ uuid, type, isdel }: Reaction) => (
  <Button onClick={reactionOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const reactionsFromTagMechanismButton = ({ uuid, type, isdel }: Reaction) => (
  <Button onClick={reactionsFromTagMechanismOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const allSpeciesButton = ({ uuid, type, isdel }: Species) => (
  <Button onClick={allSpeciesOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const speciesButton = ({ uuid, type, isdel }: Species) => (
  <Button onClick={speciesOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const speciesFromTagMechanismButton = ({ uuid, type, isdel }: Species) => (
  <Button onClick={speciesFromTagMechanismOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {type}
  </Button>
);

const tagMechanismsButton = ({ uuid, tag, isdel }: TagMechanism) => (
  <Button onClick={tagMechanismsOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {tag}
  </Button>
);

const tagMechanismButton = ({ uuid, tag, isdel }: TagMechanism) => (
  <Button onClick={tagMechanismOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {tag}
  </Button>
);

const tagMechanismsFromMechanismButton = ({ uuid, tag, isdel }: TagMechanism) => (
  <Button onClick={tagMechanismsFromMechanismOnClick} style={{ width: '100%' }} {...{ uuid, isdel }}>
    {tag}
  </Button>
);

export default renderButton;
