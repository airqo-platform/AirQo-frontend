"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to login page immediately when someone tries to access the register page
    router.push("/login")
  }, [router])
  
  // Return empty or loading state while redirecting
  return null
}