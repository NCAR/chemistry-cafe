import {Route, Routes} from 'react-router-dom';
import Settings from './webPages/settings';
import LoggedIn from './webPages/loggedIn';
import FamilyPage from './webPages/family';
import LogIn from './webPages/logIn';
import SpeciesPage from './webPages/species';
import ReactionsPage from './webPages/reactions';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LogIn />} />
            <Route path="/LoggedIn" element={<LoggedIn />} />
            <Route path="/FamilyPage" element={<FamilyPage />} />
            <Route path="/SpeciesPage" element={<SpeciesPage />} />
            <Route path="/ReactionsPage" element={<ReactionsPage />} />
            <Route path="/Settings" element={<Settings />} />
        </Routes>
    );
}

export default App;
