import React, { useEffect, useState } from 'react';
import { Container, Row} from 'react-bootstrap';
import { PropertyVersion } from '../../API/API_Interfaces'; 
import { StyledLabel, StyledInput, StyledUnitLabel, StyledColumn } from './RenderPropertiesStyling';

interface RenderPropertiesProps {
  properties: Promise<PropertyVersion[]>[];
}

const RenderProperties: React.FC<RenderPropertiesProps> = ({ properties }) => {
    const [resolvedProperties, setResolvedProperties] = useState<PropertyVersion[]>([]);

    useEffect(() => {
      Promise.all(properties)
        .then((resolved) => {
          const flattenedProperties: PropertyVersion[] = resolved
            .reduce((acc, curr) => acc.concat(curr || []), [])
            .filter(button => button !== null);
            setResolvedProperties(flattenedProperties);
        })
        .catch((error) => {
          console.error('Error fetching properties:', error);
          setResolvedProperties([]);
        });
    }, [properties]);
  
  
    return (
    <Container fluid style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      {resolvedProperties.map((property) => (
        <Row key={property.property_version_uuid}>
          <StyledColumn>
            <StyledLabel>{property.name}</StyledLabel>
          </StyledColumn>
          <StyledColumn>
            <StyledInput
              value={getPropertyValue(property)}
              readOnly={true}
            />
          </StyledColumn>
          <StyledColumn>
            <StyledUnitLabel>{property.units ? property.units : 'N/A'}</StyledUnitLabel>
          </StyledColumn>
        </Row>
      ))}
    </Container>
  );
};

const getPropertyValue = (property: PropertyVersion): string | undefined=> {
    if (property.validation === 'string') {
      return property.string_value?.toString();
    }else if (property.validation === 'int') {
      return property.int_value?.toString(); 
    }else if (property.validation === 'double') {
      return property.double_value?.toString(); 
    } 
    else {
      return '';
    }
  };

export default RenderProperties;
