"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const NotFoundContent = () => {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-2xl transform transition-all hover:scale-105">
        <h1 className="text-9xl font-bold text-gray-800 mb-4 animate-bounce">404</h1>
        <p className="text-2xl text-gray-600 mb-6">Oops! The page you are looking for does not exist.</p>
        <p className="text-lg text-gray-500 mb-8">
          You tried to access <span className="font-mono text-gray-700 bg-gray-100 p-1 rounded">{pathname}</span>, but
          it is not available.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}

const NotFound = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}

export default NotFound
