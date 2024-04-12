import { useState, useEffect, useRef } from 'react'
import { AiOutlineBell } from 'react-icons/ai'
import { BsPerson } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import Menu from 'src/assets/icons/Menu'

const links = [
  { to: '/help', text: 'Help' },
  { to: '/settings', text: 'Settings' },
  { to: '/login', text: 'Logout' },
]

interface NavbarProps {
  isSidebarVisible: boolean
  setSidebarVisible: (value: boolean) => void
}

const Navbar: React.FC<NavbarProps> = ({
  isSidebarVisible,
  setSidebarVisible,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const node = useRef<HTMLDivElement>(null)

  const handleClickOutside = (e: MouseEvent) => {
    if (node.current?.contains(e.target as Node)) {
      return
    }
    setIsOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="hidden lg:block" />
      <button onClick={toggleSidebar} className="lg:hidden">
        <Menu />
      </button>
      <div className="flex items-center space-x-4">
        <AiOutlineBell
          className="text-gray-600 text-2xl rounded-full bg-gray-200 p-2"
          size={34}
        />
        <div className="relative" ref={node}>
          <BsPerson
            onClick={() => setIsOpen(!isOpen)}
            size={34}
            className="text-gray-600 text-2xl cursor-pointer rounded-full bg-gray-200 p-2"
          />
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 ">
              {links.map(({ to, text }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  {text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
