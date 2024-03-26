import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@services/redux/store'
import BounceLoader from 'react-spinners/BounceLoader'

// Use React.lazy for code splitting
const Reports = lazy(() => import('./pages/Reports'))
const ReportForm = lazy(() => import('./components/reports'))
const ReportView = lazy(() => import('./components/reports/ReportView'))
const Files = lazy(() => import('./pages/Files'))
const Settings = lazy(() => import('./pages/settings'))

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen">
                <BounceLoader color="#006583" />
              </div>
            }
          >
            <Routes>
              <Route path="/*" element={<Reports />}>
                <Route index element={<ReportForm />} />
                <Route path="view" element={<ReportView />} />
              </Route>
              <Route path="files" element={<Files />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Router>
      </PersistGate>
    </Provider>
  )
}

export default App
