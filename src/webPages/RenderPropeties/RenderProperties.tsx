import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ProperyVersion } from '../../API/API_Interfaces'; 

interface RenderPropertiesProps {
  properties: Promise<ProperyVersion[]>[];
}

const RenderProperties: React.FC<RenderPropertiesProps> = ({ properties }) => {
    const [resolvedProperties, setResolvedProperties] = useState<ProperyVersion[]>([]);

    useEffect(() => {
      Promise.all(properties)
        .then((resolved) => {
          const flattenedProperties: ProperyVersion[] = resolved
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
          <Col>
            <label>{property.name}</label>
          </Col>
          <Col>
            <input
              type={getPropertyInputType(property.validation)}
              value={getPropertyValue(property)}
            />
          </Col>
          <Col>
            <div className="unit-label">{property.units}</div>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

const getPropertyInputType = (validation: string): string => {
  switch (validation) {
    case 'string':
      return 'text';
    case 'double':
    case 'float':
      return 'number';
    default:
      return 'text';
  }
};

const getPropertyValue = (property: ProperyVersion): string => {
    if (property.validation === 'string') {
      return property.string_value;
    } else if (property.validation === 'float') {
      return property.float_value.toString(); 
    } else if (property.validation === 'double') {
      return property.double_value.toString(); 
    } 
    else {
      return '';
    }
  };

export default RenderProperties;
