/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink } from 'react-router-dom'
import React, { useEffect } from 'react'
import Logo from '/images/airqo.png'
import { useSelector } from 'src/services/redux/utils'
import Files from 'src/assets/icons/Files'
import Reports from 'src/assets/icons/Reports'
import Settings from 'src/assets/icons/Settings'
import { useLocation } from 'react-router-dom'

interface SidebarItemProps {
  icon: React.ReactNode
  LinkText: string
  linkPath: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  LinkText,
  linkPath,
}) => {
  const location = useLocation()

  return (
    <NavLink
      to={linkPath}
      className={({ isActive }) =>
        `flex items-center space-x-2 w-full p-2 rounded transition-all duration-300 ${
          isActive || (location.pathname === '/view' && linkPath === '/')
            ? 'bg-gray-800'
            : ''
        }`
      }
    >
      {icon}
      <p>{LinkText}</p>
    </NavLink>
  )
}

const Index: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const darkMode = useSelector((state) => state.darkMode.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="h-screen">
      <div className="w-64 h-full bg-[#145dff] text-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-4 flex justify-start items-center">
            <NavLink
              to="/"
              className="block mb-2 flex space-x-2 items-center justify-start w-full"
            >
              <img
                src={Logo}
                alt="AQ_Report logo"
                className="w-14 h-14 mx-auto rounded-full"
              />
              <p className="text-left w-full text-lg font-semibold">
                AQ Report
              </p>
            </NavLink>
          </div>
          <hr />
          <div className="space-y-2 p-4">
            <SidebarItem
              icon={<Reports />}
              linkPath="/"
              LinkText="Report Generator"
            />
            <SidebarItem
              icon={<Files />}
              linkPath="/files"
              LinkText="Saved Files"
            />
            <SidebarItem
              icon={<Settings />}
              linkPath="/settings"
              LinkText="Settings"
            />
          </div>
        </div>
        {/* trademark and poweredby */}
        <div
          className="text-center text-white
         text-sm p-4"
        >
          <p>© {currentYear} AQ Report</p>
          <small>Powered by AirQo</small>
        </div>
      </div>
    </div>
  )
}

export default Index
