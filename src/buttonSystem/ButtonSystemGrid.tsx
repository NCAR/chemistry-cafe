import React, {useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {renderButton, ButtonData } from './RenderButtons';

interface ButtonSystemGridProps {
  buttonArray: Promise<ButtonData[]>[];
  category: string;
  cols: number;
  size: string;
}

const ButtonSystemGrid: React.FC<ButtonSystemGridProps> = ({ buttonArray, category, cols, size }) => {
  const [resolvedButtons, setResolvedButtons] = useState<ButtonData[]>([]);

  useEffect(() => {
    Promise.all(buttonArray)
      .then((resolved) => {
        const flattenedButtons: ButtonData[] = resolved.reduce((acc, curr) => acc.concat(curr), []);
        setResolvedButtons(flattenedButtons);
      })
      .catch((error) => {
        console.error('Error fetching buttons:', error);
        setResolvedButtons([]);
      });
  }, [buttonArray]);

  const columnWidth: number = 12 / cols;

  return (
    <Container fluid style={{ maxWidth: size }}>
      <Row>
        {resolvedButtons.map((button, index) => (
          <Col key={index} xs={columnWidth}>
            {renderButton(button, category)}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ButtonSystemGrid;
