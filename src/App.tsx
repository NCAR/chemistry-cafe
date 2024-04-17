import {Route, Routes} from 'react-router-dom';
import Settings from './webPages/settings';
import LoggedIn from './webPages/loggedIn';
import FamilyPage from './webPages/family';
import LogIn from './webPages/logIn';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LogIn />} />
            <Route path="/LoggedIn" element={<LoggedIn />} />
            <Route path="/FamilyPage" element={<FamilyPage />} />
            <Route path="/Settings" element={<Settings />} />
        </Routes>
    );
}

export default App;
