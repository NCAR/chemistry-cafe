import { Button } from "react-bootstrap";
import { Family, Mechanism, ProperyType, Reaction, Species, TagMechanism } from "./API_Interfaces";
  
export const familyButton = ({ uuid, name, isDel }: Family) => (
    <Button style={{ width: '100%' }} {...{uuid, isDel}}>
        {name}
    </Button>
);
