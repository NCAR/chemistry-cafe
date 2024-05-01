import 'bootstrap/dist/css/bootstrap.css';
import styled from 'styled-components';

export const StyledHeader = styled.header`
  padding: 20px;
  text-align: left;
`;

export const StyledDetailBox = styled.section`
  display: block;
  width: 98%;
  height: 80vh;
  background-color: #C3D7EE;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  position: relative;
  padding: 10px;
  grid-column: 2 / span 5;
  grid-row: 2 / span 2;
  overflow: hidden;
`;