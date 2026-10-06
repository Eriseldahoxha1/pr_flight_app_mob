import { HttpClient } from '../libs/http/http-client'
import type { Favorite } from '../types/flight'

class FavoriteService {
  getFavorites = (userId: number) =>
    HttpClient.get<Favorite[]>(`/600/users/${userId}/favorites`, { _sort: 'createdAt', _order: 'desc' })

  addFavorite = (userId: number, flightId: string) =>
    HttpClient.post<Favorite>('/600/favorites', { userId, flightId, createdAt: new Date().toISOString() })

  removeFavorite = (id: number) => HttpClient.instance.delete(`/600/favorites/${id}`)
}

export default new FavoriteService()
