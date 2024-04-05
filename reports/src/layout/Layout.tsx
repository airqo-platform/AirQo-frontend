import React, { useState, useEffect } from 'react'
import SideBar from '@components/sidebar'
import { Alert } from 'flowbite-react'
import Navigation from 'src/components/navBar'
import { useSelector } from 'src/services/redux/utils'
import { ToastContainer } from 'react-toastify'

interface LayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false)
  const alert = useSelector((state) => state.darkMode?.alert)
  const darkMode = useSelector((state) => state.darkMode.darkMode)

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="flex flex-row h-screen">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarVisible(false)}
        ></div>
      )}
      <div
        className={`fixed z-20 lg:relative ${
          isSidebarVisible ? '' : 'hidden lg:block'
        }`}
      >
        <SideBar />
      </div>
      <div className="relative h-full w-full flex-1 bg-gray-100 text-black dark:text-white dark:bg-gray-800 overflow-y-auto">
        <Navigation
          isSidebarVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <div className="p-4">
          {alert.visibility && (
            <Alert color={alert.type} rounded>
              <span className="font-medium">{alert.message}</span>
            </Alert>
          )}
          <div className="w-full flex justify-start py-4">
            <h1 className="font-bold dark:text-white capitalize text-2xl md:text-3xl">
              {pageTitle}
            </h1>
          </div>
          {children}
        </div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  )
}

export default Layout
