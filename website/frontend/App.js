import React from 'react';
import NotificationBanner from './src/components/NotificationBanner';
import { TopBar } from './src/components/nav';
import Footer from './src/components/Footer';

const App = () => (
    <div>
        <NotificationBanner />
        <TopBar />
        <Footer />
    </div>
);

export default App;
