import { HttpClient } from '../libs/http/http-client'
import { AuthResponse, LoginUserInput } from '../types/auth'

class AuthService {
  login = async (payload: LoginUserInput) => await HttpClient.post<AuthResponse>('login', payload)
}

export default new AuthService()
