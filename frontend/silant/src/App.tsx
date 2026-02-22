import './App.css';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Login from './routes/login';

function App() {
    return (
        <Router>
            <Routes>
                <Route>
                    <Route path='/login' element={< Login />} />
                </Route>
            </Routes>
        </Router>
    )
};

export default App;
