import 'bootstrap/dist/css/bootstrap.css';
import styled from 'styled-components';

export const StyledHeader = styled.header`
padding: 30px;
text-align: left;
text-decoration-line: underline
`;

export const StyledActionBar = styled.nav`
overflow: hidden;
background-color: #333;
grid-column: 2 / span 2;
grid-row: 1;
`;

export const StyledActionBarA = styled(StyledActionBar)`
float: left;
display: block;
color: #f2f2f2;
text-align: center;
padding: 14px 16px;
text-decoration: none;
`;

export const StyledDetailBox = styled.section`
display: block;
width: 100%;
height: 100%;
background-color: beige;
border-style: solid;
border-width: 5px;
border-radius: 50px;
position: relative;
grid-column: 2 / span 2;
grid-row: 2 / span 2;
`;

export const StyledFamilyButton = styled.button`
display: block;
width: 100%;
height: 100%;
background-color: maroon;
position: relative;
grid-column: 1;
grid-row: 2 / span 2;
`;

export const StyledMechanismsFromFamilyButton = styled.button`
display: block;
width: 100%;
height: 100%;
background-color: blue;
position: relative;
grid-column: 1;
grid-row: 2 / span 2;
`;



