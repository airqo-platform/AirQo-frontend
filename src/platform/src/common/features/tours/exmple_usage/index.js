// Example 1: Prioritized Auto-Start (Layout)
// Trigger global tours before route tours automatically when a user logs in.
// 'use client';
// import { useEffect } from 'react';
// import { useTour } from '@/features/tours/contexts/TourProvider';
// import { useSession } from 'next-auth/react';

// export default function RootLayout({ children }) {
//   const { attemptStartTours, run } = useTour();
//   const {  session } = useSession();
//   const userId = session?.user?.id;

//   useEffect(() => {
//     // Attempt to start tours (prioritizing global) once the user is logged in and no tour is running
//     if (userId && !run) {
//       console.log("RootLayout: User logged in. Attempting to start tours.");
//       const timer = setTimeout(() => {
//         attemptStartTours(); // This will check globalOnboarding first
//       }, 1500); // Delay to ensure page content loads

//       return () => clearTimeout(timer);
//     }
//   }, [userId, run, attemptStartTours]); // Re-run if user logs in/out or tour stops

//   return (
//     <html lang="en">
//       <body>
//         {children}
//       </body>
//     </html>
//   );
// }

// Example 2: Manual Start (Global Tour, Route Tour, Standalone Popup)
// Trigger tours or popups manually, for example, via a "Help" button or after a specific user action.
// 'use client';
// import { useTour } from '@/features/tours/contexts/TourProvider';
// import Button from '@/common/components/Button'; // Adjust path

// export default function DashboardHeader() {
//   const { startGlobalTour, startTourForCurrentPath, startStandalonePopup, run } = useTour();

//   const handleStartGlobalOnboarding = () => {
//     if (!run) startGlobalTour('globalOnboarding');
//   };

//   const handleStartCurrentPageRouteTour = () => {
//     if (!run) startTourForCurrentPath();
//   };

//   const handleShowNewFeaturePopup = () => {
//     if (!run) startStandalonePopup('newFeatureInfo');
//     // To force show even if seen: startStandalonePopup('newFeatureInfo', { force: true });
//   };

//   return (
//     <header className="dashboard-header p-4 bg-gray-100 flex justify-between items-center">
//       <h1 className="text-xl font-bold">Dashboard</h1>
//       <div className="flex space-x-2">
//         <Button onClick={handleStartGlobalOnboarding}>Start Global Tour</Button>
//         <Button onClick={handleStartCurrentPageRouteTour}>Start Page Tour</Button>
//         <Button onClick={handleShowNewFeaturePopup}>Show Info Popup</Button>
//       </div>
//     </header>
//   );
// }

// Example 3: Action-Triggered Step (Analytics Page)
// Show a tour step that waits for the user to perform an action.
// 'use client';
// import { useEffect, useCallback } from 'react';
// import { useTour } from '@/features/tours/contexts/TourProvider';
// import Button from '@/common/components/Button'; // Adjust path

// export default function AnalyticsPage() {
//   const { startTourForCurrentPath, run } = useTour();

//   // Auto-start the analytics tour when the page loads
//   useEffect(() => {
//     if (!run) {
//       const timer = setTimeout(() => {
//         console.log("AnalyticsPage: Starting tour for /user/analytics");
//         startTourForCurrentPath();
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [startTourForCurrentPath, run]);

//   // Handler for the button that triggers the tour action
//   const handleViewMoreDataClick = useCallback(() => {
//     console.log("AnalyticsPage: 'View More Data' button clicked.");
//     // ... perform the actual action (e.g., navigate, open modal) ...

//     // Dispatch the custom event to signal the tour provider
//     // This event name MUST match the `payload` in `awaitedAction`
//     window.dispatchEvent(new CustomEvent('USER_CLICKED_BUTTON'));
//   }, []);

//   return (
//     <div className="analytics-page p-4">
//       <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
//       <div className="mt-8 p-4 border rounded">
//         <h2 className="text-xl mb-2">Reports</h2>
//         <p>Summary of key metrics...</p>
//         {/* The button the tour step points to */}
//         <Button
//           onClick={handleViewMoreDataClick}
//           className="show-view-more-data-button mt-2"
//         >
//           View Detailed Report
//         </Button>
//       </div>
//     </div>
//   );
// }
