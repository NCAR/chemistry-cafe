import styled from 'styled-components';
import { Col } from 'react-bootstrap';

export const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  color: #53565A;
  font-size: 18px; /* Bigger font size */
  font-weight: bold;
`;

export const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  padding: 10px;
  border: 2px solid #53565A;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 16px;
  color: #53565A;
`;

export const StyledColumn = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: center;
`;
