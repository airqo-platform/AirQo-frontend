import ProfileTabs from "./components/ProfileTabs"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <ProfileTabs />
    </div>
  )
}

