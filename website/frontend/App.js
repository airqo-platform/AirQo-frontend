import React from 'react';
import NotificationBanner from './src/components/NotificationBanner';
import { TopBar } from './src/components/nav';
import Footer from './src/components/Footer';
import HomePage from "./src/pages/HomePage";
import GetApp from './src/components/get-app/GetApp';

const App = () => (
    <div>
        <NotificationBanner />
        <TopBar />
        <HomePage />
        <GetApp />
        <Footer />
    </div>
);

export default App;
