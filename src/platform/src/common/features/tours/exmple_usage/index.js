// --- Example 1: Starting a Route-Based Tour Automatically ---
// 'use client';
// import { useEffect } from 'react';
// import { useTour } from '@/features/tours/contexts/TourProvider';

// export default function AnalyticsPage() {
//   const { startTourForCurrentPath, run } = useTour();

//   useEffect(() => {
//     if (!run) { // Prevent conflicts if a tour is already running
//       const timer = setTimeout(() => {
//         console.log("AnalyticsPage: Attempting to start tour for /user/analytics");
//         startTourForCurrentPath(); // Starts the tour defined for '/user/analytics' if not seen
//         // startTourForCurrentPath({ force: true }); // For testing/resetting
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [startTourForCurrentPath, run]);

//   return (
//     <div className="analytics-page">
//       {/* Your page content */}
//       <div className="analytics-filters">Filters</div>
//       <div className="analytics-main-chart">Chart</div>
//       <button className="analytics-export-button">Export</button>
//     </div>
//   );
// }

// --- Example 2: Starting a Global Tour Manually ---
// 'use client';
// import { useEffect, useState } from 'react';
// import { useTour } from '@/features/tours/contexts/TourProvider';
// import { useSession } from 'next-auth/react'; // Assuming you use next-auth
// import Button from '@/common/components/Button'; // Your button component

// export default function GlobalHeader() {
//   const { startGlobalTour, run } = useTour();
//   const { data: session } = useSession();
//   const [showTourButton, setShowTourButton] = useState(false);

//   // Show the tour button only if the user is logged in and no tour is running
//   useEffect(() => {
//     if (session?.user?.id && !run) {
//        // Check if the global onboarding tour has been seen
//        // You might need to import tourStorage or create a helper in the context
//        // For simplicity, let's just show the button if logged in and no tour runs
//        // A more robust check would be:
//        // const seen = tourStorage.isTourSeen('globalOnboarding', session.user.id);
//        // setShowTourButton(!seen);
//        setShowTourButton(true);
//     } else {
//        setShowTourButton(false);
//     }
//   }, [session, run]);

//   const handleStartOnboarding = () => {
//      console.log("GlobalHeader: User clicked 'Start Tour'");
//      startGlobalTour('globalOnboarding'); // Starts the global tour by its key
//      // startGlobalTour('globalOnboarding', { force: true }); // Force start
//   };

//   return (
//     <header className="main-header">
//       {/* ... other header content ... */}
//       <nav className="main-navigation">
//         {/* ... navigation items ... */}
//       </nav>
//       {showTourButton && (
//         <Button
//           variant="filled"
//           onClick={handleStartOnboarding}
//           className="ml-4"
//         >
//           Start Tour
//         </Button>
//       )}
//       <div className="user-profile-button"> {/* Target for tour step */ }
//          Profile
//       </div>
//     </header>
//   );
// }

// --- Example 3: Using Tour State in Components ---
// File: Any component that needs to know tour status
// 'use client';
// import { useTour } from '@/features/tours/contexts/TourProvider';

// export default function SomeComponent() {
//   const { run, currentTourKey, currentTourType } = useTour();

//   if (run) {
//     return (
//       <div>
//         A {currentTourType} tour ('{currentTourKey}') is currently active.
//         {/* Maybe disable certain interactions or show a different UI state */}
//       </div>
//     );
//   }

//   return <div>Normal content when no tour is running.</div>;
// }

// Triggering an Action
// 'use client';
// import { useEffect } from 'react';
// import Button from '@/common/components/Button'; // Adjust path

// export default function QuickActionsComponent() {

//   const handleQuickActionClick = () => {
//     console.log("QuickActionsComponent: Quick action clicked!");
//     // ... perform the action ...

//     // Dispatch a custom event to signal the action was completed
//     // This event name should match the `payload` in `awaitedAction`
//     window.dispatchEvent(new CustomEvent('USER_CLICKED_QUICK_ACTION'));
//   };

//   return (
//     <div className="home-quick-actions p-2 border rounded">
//       <Button onClick={handleQuickActionClick}>Do Quick Action</Button>
//       {/* Other quick actions... */}
//     </div>
//   );
// }
