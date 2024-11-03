import '../../index.css';
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import { Header, Footer } from '../Components/HeaderFooter';
import "./loggedIn.css";

const LoggedIn = () => {
    const navigate = useNavigate();
    const handleClickFam = () => navigate('/FamilyPage');
    const handleClickSettings = () => navigate('/Settings');

    const style = {
        height: '75px',
        width: '500px',
    };

    return (
        <div data-theme="cyberpunk" className="min-h-screen flex flex-col">
            <section className='layoutLoggedIn'>
                <div className='L1LoggedIn'>
                    <Header />
                </div>

                <div className="M4 flex-grow flex items-center justify-center">
                    <ButtonGroup variant='contained' className="flex-col">
                        <Button sx={style} onClick={handleClickFam}>
                            Families
                        </Button>
                        <p></p>
                        <Button sx={style} onClick={handleClickSettings}>
                            Settings
                        </Button>
                    </ButtonGroup>
                </div>

                <div className='L9LoggedIn'>
                    <Footer />
                </div>
            </section>

            {/* Theme Test Section */}
            <div className="p-10 bg-base-200 rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold mb-4">Cyberpunk Theme Test</h1>
                <p className="text-lg">If you see this in "cyberpunk" styling, the theme is working!</p>
                <button className="btn btn-primary mt-4">Test Button</button>
            </div>
        </div>
    );
}

export default LoggedIn;
