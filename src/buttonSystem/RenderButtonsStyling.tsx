import 'bootstrap/dist/css/bootstrap.css';
import styled from 'styled-components';

export const StyledHeader = styled.header`
padding: 20px;
text-align: left;
border-bottom: 10px solid #53565A;
`;

export const StyledActionBar = styled.nav`
display: flex;
overflow: hidden;
background-color: #53565A;
width: 100%;
height: 40%;
border-radius: 5px;
grid-column: 1 / span 2;
grid-row: 1;
`;

export const StyledActionBarButton = styled.a`
float: left;
display: block;
height: 100%;
flex-grow: 1;
color: #f2f2f2;
text-align: center;
text-decoration: none;
border-style: solid;
border-color: #012169;
`;

export const StyledDetailBox = styled.section`
display: block;
width: 100%;
height: 100%;
background-color: #C3D7EE;
border-style: solid;
border-width: 5px;
border-radius: 50px;
position: relative;
grid-column: 2 / span 2;
grid-row: 2 / span 2;
`;

export const StyledButton = styled.button`
display: block;
padding: 10px;
width: 100%;
height: 100%;
background-color: #1A658F;
border-style: solid;
border-width: 2px;
border-radius: 10px;
position: relative;
grid-column: 1;
grid-row: 2 / span 2;
`;

export const StyledFamilyButton = styled(StyledButton)`

`;

export const StyledMechanismsFromFamilyButton = styled(StyledButton)`

`;

export const StyledTagMechanismsFromMechanismButton = styled(StyledButton)`

`;



