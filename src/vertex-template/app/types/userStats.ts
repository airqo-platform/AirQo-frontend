export interface User {
    userName?: string
    email?: string
    firstName?: string
    lastName?: string
    _id?: string
  }
  
  export interface UserCategory {
    number: number
    details: User[]
  }
  
  export interface UserStats {
    users: UserCategory
    active_users: UserCategory
    api_users: UserCategory
  }
  
  export interface UserStatsResponse {
    success: boolean
    message: string
    users_stats: UserStats
  }
  