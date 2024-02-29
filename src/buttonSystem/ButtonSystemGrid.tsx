import React, { ReactNode, useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';


interface ButtonSystemGridProps {
  buttonArray: Promise<any[]>[];
  renderButton: (button: any) => ReactNode;
  cols: number;
  size: string;
}

const ButtonSystemGrid: React.FC<ButtonSystemGridProps> = ({ buttonArray, renderButton, cols, size }) => {
  const [resolvedButtons, setResolvedButtons] = useState<any[]>([]);

  useEffect(() => {
    Promise.all(buttonArray)
      .then((resolved) => {
        const flattenedButtons = resolved.flat();
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
            {renderButton(button)}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ButtonSystemGrid;
