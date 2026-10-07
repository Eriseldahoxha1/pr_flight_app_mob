import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

const STORAGE_KEY = 'session'

type SavedSession = {
  accessToken: string
  userId: number
}

class SessionService {
  read = async (): Promise<SavedSession | null> => {
    const savedSession = await getItemAsync(STORAGE_KEY)

    if (!savedSession) {
      await Promise.all([deleteItemAsync('accessToken'), deleteItemAsync('userId')])
      return null
    }

    const session: unknown = JSON.parse(savedSession)

    if (
      typeof session !== 'object' ||
      session === null ||
      !('accessToken' in session) ||
      typeof session.accessToken !== 'string' ||
      !session.accessToken.trim() ||
      !('userId' in session) ||
      typeof session.userId !== 'number' ||
      !Number.isInteger(session.userId)
    ) {
      throw new SyntaxError('Invalid saved session')
    }

    return { accessToken: session.accessToken, userId: session.userId }
  }

  save = (session: SavedSession): Promise<void> => setItemAsync(STORAGE_KEY, JSON.stringify(session))

  clear = (): Promise<void> => deleteItemAsync(STORAGE_KEY)
}

export default new SessionService()
