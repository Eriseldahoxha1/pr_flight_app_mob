import { HttpClient } from '../libs/http/http-client'
import type { FlightSearchCriteria, RecentSearch } from '../types/flight'

class RecentSearchService {
  getSearches = (userId: number) =>
    HttpClient.get<RecentSearch[]>('/640/recentSearches', { userId, _sort: 'createdAt,id', _order: 'desc,desc' })

  saveSearch = async (userId: number, criteria: FlightSearchCriteria) => {
    await HttpClient.post<RecentSearch>('/600/recentSearches', {
      ...criteria,
      userId,
      createdAt: new Date().toISOString(),
    })

    const searches = await this.getSearches(userId)
    await Promise.all(searches.slice(10).map(search => HttpClient.instance.delete(`/600/recentSearches/${search.id}`)))
    return searches.slice(0, 10)
  }
}

export default new RecentSearchService()
