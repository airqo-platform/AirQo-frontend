import React from 'react'
import Layout from 'src/layout/Layout'
import { useDispatch, useSelector } from 'src/services/redux/utils'
import { toggleDarkMode } from 'src/services/redux/DarkModeSlice'

const Index = () => {
  const dispatch = useDispatch()
  const darkMode = useSelector((state) => state.darkMode.darkMode)

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode())
  }

  return (
    <Layout pageTitle="Application Settings">
      <div className="flex flex-col ">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-400 dark:text-gray-200">
            Report Settings
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                disabled
                className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Auto-generate reports
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                disabled
                className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Set default recipients for reports
              </label>
            </div>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <h2 className="text-xl font-semibold text-gray-400 dark:text-gray-200">
            General Settings
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center mb-4">
              <input
                id="default-checkbox"
                type="checkbox"
                checked={darkMode}
                onChange={handleToggleDarkMode}
                className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Enable dark mode
              </label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Index
