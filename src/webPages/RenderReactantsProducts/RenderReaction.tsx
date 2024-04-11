import React, { useEffect, useState } from 'react';
import { Container} from 'react-bootstrap';
import { ReactantProductList } from '../../API/API_Interfaces'; 
import { StyledRow, BoldQuantity, ReactionLabels } from './RenderReactantsProductsStyling';

interface RenderReactantProductsProps {
  reactants: Promise<ReactantProductList[]>[];
  products: Promise<ReactantProductList[]>[];
}

const RenderReaction: React.FC<RenderReactantProductsProps> = ({ reactants, products }) => {
  const [reactantsList, setReactantsList] = useState<ReactantProductList[]>([]);
  const [productsList, setProductsList] = useState<ReactantProductList[]>([]);

  useEffect(() => {
    Promise.all(reactants)
      .then((resolved) => {
        const flattenedReactants: ReactantProductList[] = resolved
          .reduce((acc, curr) => acc.concat(curr || []), [])
          .filter(leftSide => leftSide !== null);
          setReactantsList(flattenedReactants);
      })
      .catch((error) => {
        console.error('Error fetching reactants:', error);
        setReactantsList([]);
      });
  }, [reactants]);

  useEffect(() => {
    Promise.all(products)
      .then((resolved) => {
        const flattenedProducts: ReactantProductList[] = resolved
          .reduce((acc, curr) => acc.concat(curr || []), [])
          .filter(rightSide => rightSide !== null);
          setProductsList(flattenedProducts);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setProductsList([]);
      });
  }, [products]);

  const renderChemicalNotation = (items: ReactantProductList[]) => {
    return (
      <ReactionLabels>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BoldQuantity>{item.quantity}</BoldQuantity> {item.type}
            {index < items.length - 1 && " + "}
          </React.Fragment>
        ))}
      </ReactionLabels>
    );
  };

  return (
    <Container>
      <StyledRow>
        <ReactionLabels>
          {reactantsList.length > 0 && renderChemicalNotation(reactantsList)} → {productsList.length > 0 && renderChemicalNotation(productsList)}
        </ReactionLabels>
      </StyledRow>
    </Container >
  );
};

export default RenderReaction;
