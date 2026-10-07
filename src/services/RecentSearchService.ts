import { HttpClient } from '../libs/http/http-client'
import type { FlightSearchCriteria, RecentSearch } from '../types/flight'
import { MAX_RECENT_SEARCHES } from '../constants/general'
import { getSearchKey } from '../utils/getSearchKey'

class RecentSearchService {
  getSearches = (userId: number) =>
    HttpClient.get<RecentSearch[]>(`/600/users/${userId}/recentSearches`, {
      _sort: 'createdAt,id',
      _order: 'desc,desc',
    })

  saveSearch = (userId: number, criteria: FlightSearchCriteria) =>
    HttpClient.post<RecentSearch>('/600/recentSearches', {
      ...criteria,
      userId,
      createdAt: new Date().toISOString(),
    })

  refreshSearches = async (userId: number) => {
    const searches = await this.getSearches(userId)
    const seenKeys = new Set<string>()
    const kept: RecentSearch[] = []
    const removed: RecentSearch[] = []

    for (const search of searches) {
      const key = getSearchKey(search)

      if (seenKeys.has(key) || kept.length >= MAX_RECENT_SEARCHES) {
        removed.push(search)
      } else {
        seenKeys.add(key)
        kept.push(search)
      }
    }

    const results = await Promise.allSettled(
      removed.map(search => HttpClient.instance.delete(`/600/recentSearches/${search.id}`)),
    )
    return {
      searches: kept,
      cleanupFailed: results.some(result => result.status === 'rejected'),
    }
  }
}

export default new RecentSearchService()
