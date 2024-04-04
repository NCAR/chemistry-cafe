import {Route, Routes} from 'react-router-dom';
import Settings from './webPages/settings';
import LoggedIn from './webPages/loggedIn';
import FamilyPage from './webPages/family';
import FamilyMechanismPage from './webPages/familyMechanism';
import LogIn from './webPages/logIn';
import Mechanisms from './webPages/mechanisms';
import SpeciesPage from './webPages/species';

function App() {

    return (
        <div>

            <Routes>
                <Route path="/" element={<LogIn />} />
                <Route path="/LoggedIn" element={<LoggedIn />} />
                <Route path="/FamilyPage" element={<FamilyPage />} />
                <Route path="/FamilyMechanismPage" element={<FamilyMechanismPage />} />
                <Route path="/SpeciesPage" element={<SpeciesPage />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Mechanisms" element={<Mechanisms />} />
            </Routes>

        
        </div>
    );
}

export default App;
