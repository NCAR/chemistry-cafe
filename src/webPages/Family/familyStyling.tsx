import 'bootstrap/dist/css/bootstrap.css';
import styled from 'styled-components';

export const StyledHeader = styled.header`
  padding: 20px;
  text-align: left;
  border-bottom: 10px solid #53565A;
`;

export const StyledDetailBox = styled.section`
  display: block;
  width: 100%;
  height: 60vh;
  background-color: #C3D7EE;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  position: relative;
  grid-column: 2 / span 2;
  grid-row: 2 / span 2;
  overflow: auto;
`;