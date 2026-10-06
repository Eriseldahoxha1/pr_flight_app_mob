import { HttpClient } from '../libs/http/http-client'
import type { FlightSearchCriteria, RecentSearch } from '../types/flight'

class RecentSearchService {
  getSearches = (userId: number) =>
    HttpClient.get<RecentSearch[]>('/640/recentSearches', { userId, _sort: 'createdAt,id', _order: 'desc,desc' })

  saveSearch = (userId: number, criteria: FlightSearchCriteria) =>
    HttpClient.post<RecentSearch>('/600/recentSearches', {
      ...criteria,
      userId,
      createdAt: new Date().toISOString(),
    })

  refreshSearches = async (userId: number) => {
    const searches = await this.getSearches(userId)
    const results = await Promise.allSettled(
      searches.slice(10).map(search => HttpClient.instance.delete(`/600/recentSearches/${search.id}`)),
    )
    return {
      searches: searches.slice(0, 10),
      cleanupFailed: results.some(result => result.status === 'rejected'),
    }
  }
}

export default new RecentSearchService()
