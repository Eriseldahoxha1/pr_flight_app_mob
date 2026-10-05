import { User } from './user'

export type LoginUserInput = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  user: User
}
