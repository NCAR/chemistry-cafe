import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { renderButton, ButtonData } from './RenderButtons';

interface ButtonSystemGridProps {
  buttonArray: Promise<ButtonData[]>[];
  category: string;
  handleClick: (uuid: string) => void;
  cols: number;
  height: string;
}

const ButtonSystemGrid: React.FC<ButtonSystemGridProps> = ({ buttonArray, category, handleClick, cols, height }) => {
  const [resolvedButtons, setResolvedButtons] = useState<ButtonData[]>([]);

  useEffect(() => {
    Promise.all(buttonArray)
      .then((resolved) => {
        const flattenedButtons: ButtonData[] = resolved
          .reduce((acc, curr) => acc.concat(curr || []), [])
          .filter(button => button !== null);
        setResolvedButtons(flattenedButtons);
      })
      .catch((error) => {
        console.error('Error fetching buttons:', error);
        setResolvedButtons([]);
      });
  }, [buttonArray]);

  const columnWidth: number = 12 / cols;

  if (!resolvedButtons.length) {
    return null;
  }

  return (
    <Container fluid style={{ maxHeight: height, overflowY: 'auto' }}>
      <Row>
        {resolvedButtons.map((button, index) => (
          <Col key={index} xs={columnWidth}>
            {renderButton(button, category, handleClick)}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ButtonSystemGrid;
