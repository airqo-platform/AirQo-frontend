import React from 'react';
import NotificationBanner from './src/components/NotificationBanner';
import { TopBar } from './src/components/nav';
import Footer from './src/components/Footer';
import HomePage from "./src/pages/HomePage";
import MapSection from './src/components/MapSection/MapSection';

const App = () => (
    <div>
        <NotificationBanner />
        <TopBar />
        <HomePage />
        <Footer />
    </div>
);

export default App;
