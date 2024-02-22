import React, { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './bootstrap/css/bootstrap.min.css';

interface DynamicScrollableListProps {
  buttonArray: any[];
  renderButton: (button: any) => ReactNode;
  cols: number;
  size: string;
}

const DynamicScrollableList: React.FC<DynamicScrollableListProps> = ({ buttonArray, renderButton, cols, size }) => {
  const columnWidth: number = 12 / cols;

  return (
    <Container fluid style={{ maxWidth: size }}>
      <Row>
        {buttonArray.map((button, index) => (
          <Col key={index} xs={columnWidth}>
            {renderButton(button)}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DynamicScrollableList;
