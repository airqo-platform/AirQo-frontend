# Changelog

All notable changes to the AirQo Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2025-07-31

### 🚀 Major Features Added

#### **Guided Tours & Onboarding**

- **Interactive User Tours**: Implemented comprehensive guided tour system using `react-joyride` for new user onboarding
- **Global Onboarding Steps**: Added multi-step onboarding process with improved content and actionable insights
- **Tour Management**: Built tour storage management and automatic trigger functionality across layouts

#### **Enhanced Organization Management**

- **Organization Settings Overhaul**: Complete redesign of organization settings with multi-tab interface
- **Domain Management**: Added domain settings form for managing organization URLs with validation and availability checks
- **Advanced Theme Management**: Implemented organization-level theme customization with user synchronization
- **Logo Management**: Enhanced logo upload and management with Cloudinary integration
- **Permission System**: Built comprehensive roles and permissions management with API integration

#### **Advanced Data Analytics & Visualization**

- **Air Quality Charts**: Implemented sophisticated chart components with export functionality (PDF, PNG, CSV)
- **Interactive Map Enhancements**: Added PM10 support, improved popup design, and enhanced node visualization
- **Data Download Improvements**: Multi-select functionality for pollutants with improved formatting options
- **Real-time Analytics**: Enhanced data fetching with caching and performance optimizations

#### **UI/UX Enhancements**

- **Icon Library Migration**: Migrated from `react-icons` to custom `@airqo/icons-react` library (v0.2.2)
- **Mobile Bottom Navigation**: Added mobile-first navigation component for improved mobile user experience
- **Responsive Design Improvements**: Enhanced layout consistency across different screen sizes
- **Loading States**: Implemented skeleton loaders and improved loading indicators throughout the platform

### ✨ Features

#### **Authentication & User Management**

- Enhanced password reset flow with improved validation and toast notifications
- Token-based user creation details and preferences update APIs
- Improved email verification component with better state management
- Custom button and input components for better user interaction
- Site selection enhancements with country filter and search functionality

#### **Data Management**

- Advanced CSV parsing improvements in DataDownload component
- Multi-select pollutant filtering with checkbox interface
- Time picker functionality for custom date ranges
- Location autocomplete with improved search results
- Enhanced data table with debounced search and filtering

#### **Map & Visualization**

- Runtime error boundary implementation for better error handling
- Map node type persistence with Redux integration
- Dynamic image loading and caching for air quality icons
- Mobile detection hooks for responsive map interactions
- Improved map controls and utilities

#### **Organization Features**

- Member management with role assignment functionality
- Advanced client management for admin users
- Organization switching with improved UI feedback
- Permission-based access control throughout the platform
- Enhanced organization dashboard with device summaries

### 🛠️ Improvements

#### **Performance Optimizations**

- **SWR Integration**: Implemented global SWR provider for optimized data fetching and caching
- **Session Management**: Optimized NextAuth session structure for reduced data duplication
- **API Client**: Enhanced error handling and retry logic in API communications
- **State Management**: Improved Redux state management with better error boundaries

#### **Code Quality**

- **Component Refactoring**: Streamlined components for better maintainability
- **TypeScript Support**: Enhanced TypeScript integration across components
- **Clean Code**: Removed unused components and improved code organization
- **Testing**: Added Cypress integration for end-to-end testing

#### **Developer Experience**

- **Docker Support**: Added Docker configuration with docker-compose setup
- **Build Optimization**: Improved build process and dependency management
- **Linting & Formatting**: Enhanced ESLint and Prettier configurations
- **Documentation**: Added comprehensive README examples and API documentation

### 🐛 Bug Fixes

#### **UI/UX Fixes**

- Fixed layout inconsistencies in GlobalTopbar across different screen sizes
- Corrected grid layout issues in skeleton components
- Resolved icon replacement issues throughout the platform
- Fixed container max-width issues in various layouts
- Improved toast positioning and styling consistency

#### **Functionality Fixes**

- Fixed CSV data parsing and export functionality
- Resolved authentication payload issues with site selection
- Corrected spelling errors in API endpoint names
- Fixed chart scrolling and interaction issues
- Resolved mobile navigation and sidebar issues

#### **API & Data Fixes**

- Enhanced error handling in data fetching operations
- Fixed session management and token validation
- Improved API response handling and error states
- Resolved data filtering and search functionality issues

### 🔧 Technical Improvements

#### **Dependencies**

- **React 18.2.0**: Maintained stable React version with latest security updates
- **Next.js 14.2.0**: Upgraded to latest stable Next.js for improved performance
- **@airqo/icons-react 0.2.2**: Custom icon library for consistent branding
- **Framer Motion 12.6.3**: Enhanced animations and micro-interactions
- **SWR 2.3.3**: Advanced data fetching and caching
- **React Joyride 2.9.3**: Interactive guided tours
- **Recharts 2.5.0**: Advanced charting capabilities

#### **Infrastructure**

- **Docker Configuration**: Complete containerization setup
- **Environment Management**: Improved environment variable handling
- **Build Process**: Optimized build pipeline and asset management
- **Deployment**: Enhanced deployment configurations with ArgoCD integration

### 📱 Mobile Enhancements

- **Mobile-First Navigation**: Dedicated mobile bottom navigation component
- **Responsive Components**: All components optimized for mobile devices
- **Touch Interactions**: Improved touch handling for mobile users
- **Performance**: Optimized loading and rendering for mobile devices

### 🔒 Security

- **Token Management**: Enhanced token-based authentication system
- **Session Handling**: Improved session management and validation
- **API Security**: Enhanced API endpoint protection and validation
- **User Permissions**: Granular permission system implementation

### 🌟 User Experience

- **Onboarding**: Comprehensive guided tour system for new users
- **Feedback System**: Enhanced toast notifications and user feedback
- **Loading States**: Improved loading indicators and skeleton screens
- **Error Handling**: Better error messages and recovery options
- **Accessibility**: Enhanced keyboard navigation and screen reader support

---

## [2.0.11] - 2024-XX-XX

### Added

- Basic platform functionality
- Initial air quality monitoring features
- User authentication system
- Organization management
- Data visualization components

### Changed

- Core platform architecture improvements
- UI/UX enhancements

### Fixed

- Various bug fixes and stability improvements

---

## Release Notes

### Platform Architecture

- **Frontend**: Next.js 14.2.0 with React 18.2.0
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS with DaisyUI components
- **Charts**: Recharts for data visualization
- **Maps**: Mapbox GL for interactive mapping
- **Authentication**: NextAuth.js for secure authentication
- **Testing**: Cypress for end-to-end testing
- **Icons**: Custom @airqo/icons-react library

### Key Integrations

- **Cloudinary**: Image and logo management
- **PostHog**: Analytics and user tracking
- **SWR**: Data fetching and caching
- **Framer Motion**: Smooth animations
- **React Joyride**: Interactive guided tours

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Node.js Requirements

- **Supported Versions**: Node.js 16.x to 20.x
- **Recommended**: Node.js 18.x for optimal performance

---

_For more detailed information about specific changes, please refer to the individual commit messages in the git history._
