import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from 'src/pages/HomePage';
import ResearchPage from 'src/pages/ResearchPage';
import Press from 'src/pages/Press/Press';
import Terms from "./src/pages/Legal/Terms";

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/research" element={<ResearchPage />} />
            <Route path="/press" element={<Press />} />
            <Route path="/terms" element={<Terms />} />
        </Routes>

    </Router>
);

export default App;
