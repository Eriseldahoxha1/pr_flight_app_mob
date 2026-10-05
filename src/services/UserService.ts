import { HttpClient } from '../libs/http/http-client'
import { User } from '../types/user'

class UserService {
  getUser = async (id: number, accessToken: string) => {
    const user = await HttpClient.get<User>(`600/users/${id}`, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }
}

export default new UserService()
