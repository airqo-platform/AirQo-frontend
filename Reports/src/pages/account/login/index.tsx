import { Link } from 'react-router-dom'
import Logo from '/images/airqo.png'

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center">
          <img src={Logo} alt="AirQo" className="w-20 mb-5" />
        </div>
        <h2 className="text-3xl font-bold mb-10 text-gray-800 text-center">
          Welcome to AirQo
        </h2>
        <form className="space-y-5">
          <input
            type="text"
            placeholder="Username/Email"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 font-medium"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 font-medium"
          />
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = '/'
            }}
            className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Forgot password?{' '}
          <Link to="#" className="text-blue-500">
            Reset here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
