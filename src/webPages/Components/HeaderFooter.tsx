import Box from '@mui/material/Box';
import Button from "@mui/material/Button";

export const Header = () => {
    return(
        <div style={{backgroundColor: 'green'}}>
            <Button sx={{backgroundColor: 'red'}}>
                HEADER
            </Button>
        </div>
    );
};


export const Footer = () => {
    return(
        <div style={{backgroundColor: 'green'}}>
            <Button sx={{backgroundColor: 'red'}}>
                FOOT
            </Button>
        </div>
        
        
    );
};
