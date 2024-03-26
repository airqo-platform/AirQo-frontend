import React, { useState, useEffect } from 'react'
import SideBar from '@components/sidebar'
import Menu from 'src/assets/icons/Menu'
import { Alert } from 'flowbite-react'
import { useSelector, useDispatch } from 'src/services/redux/utils'
import { ToastContainer } from 'react-toastify'
import { toggleDarkMode } from 'src/services/redux/DarkModeSlice'

interface LayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  const dispatch = useDispatch()
  const [isSidebarVisible, setSidebarVisible] = useState(false)
  const alert = useSelector((state) => state.darkMode?.alert)

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible)
  }

  const darkMode = useSelector((state) => state.darkMode.darkMode)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      dispatch(toggleDarkMode())
    }
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return (
    <div className="flex flex-row h-screen">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div
        className={`fixed z-20 lg:relative ${
          isSidebarVisible ? '' : 'hidden lg:block'
        }`}
      >
        <SideBar />
      </div>
      <div className="relative h-full w-full flex-1 bg-gray-100 p-4 text-black dark:text-white dark:bg-gray-800 overflow-y-auto">
        {alert.visibility && (
          <Alert color={alert.type} rounded>
            <span className="font-medium">{alert.message}</span>
          </Alert>
        )}
        <div className="w-full flex justify-between py-4">
          <h1 className="font-bold dark:text-white capitalize text-2xl md:text-3xl">
            {pageTitle}
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden">
            <Menu />
          </button>
        </div>
        {children}
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
