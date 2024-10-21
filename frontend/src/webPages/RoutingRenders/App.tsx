import {Route, Routes} from 'react-router-dom';
import Settings from '../Settings/settings';
import LoggedIn from '../LogIn/loggedIn';
import FamilyPage from '../Family/family';
import LogIn from '../LogIn/logIn';
import RoleManagement from '../Roles/RoleManagement';
import './App.css'; // Assuming CSS is applied globally
import Banner from '../Components/CookieBanner';

function App() {

    return (
        <div>
            <Banner />
            <Routes>
                <Route path="/" element={<LogIn />} />
                <Route path="/LoggedIn" element={<LoggedIn />} />
                <Route path="/FamilyPage" element={<FamilyPage />} />
                <Route path="/Roles" element={<RoleManagement />} />
                <Route path="/Settings" element={<Settings />} />
            </Routes>
        </div>
        
    );
}

export default App;
