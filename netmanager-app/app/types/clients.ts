import { UserDetails } from './users';
  
  export interface AccessToken {
    _id: string
    permissions: string[]
    scopes: string[]
    expiredEmailSent: boolean
    token: string
    client_id: string
    name: string
    expires: string
    createdAt: string
    updatedAt: string
    __v: number
  }
  
  export interface Client {
    _id: string
    isActive: boolean
    ip_addresses: string[]
    name: string
    client_secret: string
    user: UserDetails
    access_token: AccessToken
  }
  
  