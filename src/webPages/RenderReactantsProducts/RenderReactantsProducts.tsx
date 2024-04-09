import React, { useEffect, useState } from 'react';
import { Button, Container, Row} from 'react-bootstrap';
import { ReactantProductList } from '../../API/API_Interfaces'; 
import { StyledLabel, StyledInput, StyledColumn } from './RenderReactantsProductsStyling';

interface RenderReactantProductsProps {
  reactantProducts: Promise<ReactantProductList[]>[];
  reactants_or_products: string;
  handleClick: () => void;
}

const RenderReactantProducts: React.FC<RenderReactantProductsProps> = ({ reactantProducts, reactants_or_products, handleClick}) => {
    const [resolvedReactantProducts, setResolvedReactantProducts] = useState<ReactantProductList[]>([]);

    useEffect(() => {
      Promise.all(reactantProducts)
        .then((resolved) => {
          const flattenedReactantProducts: ReactantProductList[] = resolved
            .reduce((acc, curr) => acc.concat(curr || []), [])
            .filter(button => button !== null);
            setResolvedReactantProducts(flattenedReactantProducts);
        })
        .catch((error) => {
          console.error('Error fetching reactantProducts:', error);
          setResolvedReactantProducts([]);
        });
    }, [reactantProducts]);
  
    const title = reactants_or_products === 'Reactants' ? 'Reactants' : 'Products';

    return (
      <Container fluid style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Row>
          <StyledColumn>
            <StyledLabel>{title}</StyledLabel>
            <Button onClick = {handleClick} style={{ marginLeft: '5%' }}>
              Add
            </Button>
          </StyledColumn>
        </Row>
        <Row>
          <hr style={{ width: '100%', borderTop: '1px solid #53565A' }} />
        </Row>
        {resolvedReactantProducts.map((reactantProduct) => (
          <Row key={reactantProduct.reactant_product_uuid}>
            <StyledColumn>
              <StyledLabel>{reactantProduct.type}</StyledLabel>
            </StyledColumn>
            <StyledColumn>
              <StyledInput
                value={reactantProduct.quantity}
                readOnly={true}
              />
            </StyledColumn>
          </Row>
        ))}
        <Row>
          <hr style={{ width: '100%', borderTop: '1px solid #53565A' }} />
        </Row>
      </Container>
    );
};

export default RenderReactantProducts;
