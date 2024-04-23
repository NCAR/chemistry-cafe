import {Route, Routes} from 'react-router-dom';
import Settings from '../Settings/settings';
import LoggedIn from '../LogIn/loggedIn';
import FamilyPage from '../Family/family';
import LogIn from '../LogIn/logIn';
import { Header } from '../Components/HeaderFooter';

function App() {
    return (
        <div>
            
            <Routes>
                <Route path="/" element={<LogIn />} />
                <Route path="/LoggedIn" element={<LoggedIn />} />
                <Route path="/FamilyPage" element={<FamilyPage />} />
                <Route path="/Settings" element={<Settings />} />
            </Routes>
        </div>
        
    );
}

export default App;
