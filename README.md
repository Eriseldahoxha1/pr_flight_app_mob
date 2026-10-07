# Flight App

A mobile app for searching flights and keeping track of the ones you're interested in. Sign in, search one-way or round-trip flights between airports, check the details of each flight and save the ones you want to come back to. It runs on iOS and Android and follows your phone's light or dark mode, or you can pick one yourself.

## Features

- **Login** with email and password. The session is restored when the app restarts.
- **Home:** a search form (origin, destination, departure date and an optional return date) with the user's 10 most recent searches below it. Tapping a recent search fills in the form.
- **Search Results:** outbound flights, plus return flights for round trips, with pull-to-refresh. Each card shows the flight number, airline, times and a favorite button.
- **Flight Details:** times, airports, aircraft, gates and status, with a Save / Remove favorite button. It opens from both Search Results and Favorite Flights.
- **Favorite Flights:** saved flights, which you can remove. Favorites are kept between restarts.
- **Profile:** user info, an Appearance setting (System / Light / Dark) and logout with a confirmation dialog.
- **More:** Settings, Help, About and Contact placeholder screens.

## Tech stack

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| App            | Expo SDK 57 (React Native 0.86), TypeScript (strict)             |
| Navigation     | React Navigation: a native stack and bottom tabs                 |
| State          | Redux Toolkit (the only state management library)                |
| Backend        | json-server with json-server-auth (mock REST API with JWT login) |
| Device storage | `expo-secure-store` (session), AsyncStorage (theme choice)       |
| Tests          | Jest (`jest-expo`) and React Native Testing Library              |

## Setup

### Prerequisites

- **Node.js 22.13 or newer.** Expo SDK 57 needs it.
- **iOS:** the Expo Go app on an iPhone, or the iOS Simulator (macOS with Xcode).
- **Android:** the Expo Go app on a phone, or an Android Studio emulator.
- The phone and the computer must be on the **same Wi-Fi network**.

### 1. Install

```bash
npm ci
```

### 2. Point the app to the mock API

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `.env` for the device running the app:

| Device                           | API URL                              |
| -------------------------------- | ------------------------------------ |
| iOS Simulator on the same Mac    | `http://localhost:3001`              |
| Android Studio emulator          | `http://10.0.2.2:3001`               |
| Physical iPhone or Android phone | `http://<your-computer-LAN-IP>:3001` |

Restart Expo after changing `.env`. If requests fail, check that the mock server is running, the URL uses port `3001`, both devices are on the same network, and the computer's firewall allows the connection. An Expo tunnel does not tunnel the separate mock API.

### 3. Start the mock API

```bash
npm run server
```

This serves the mock API on port `3001`. Keep it running.

On the first run, the database (`src/server/db.json`, not tracked by git) is created from `src/server/seed.json`, with the flight dates moved so the first flight departs tomorrow. Searches, favorites and registered users are saved in `db.json` and kept between runs. To start over with fresh data and upcoming dates, run:

```bash
npm run server:reset
```

### 4. Start the app

In a second terminal:

```bash
npm start
```

Then scan the QR code with the iPhone Camera app, or with Expo Go on Android. You can also press `i` for the iOS Simulator or `a` for the Android emulator.

### Demo account

| Email              | Password     |
| ------------------ | ------------ |
| `demo@example.com` | `Flight123!` |

There's no sign-up screen. To create another user, run:

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret123!"}'
```

### Example searches

Flight dates are relative to the day the database was created, so the examples below use days from then:

| Origin | Destination | Departure | Return    | Result                             |
| ------ | ----------- | --------- | --------- | ---------------------------------- |
| TIA    | FCO         | Tomorrow  | —         | Two outbound flights               |
| TIA    | FCO         | Tomorrow  | In 3 days | Two outbound, one return           |
| TIA    | FCO         | In 2 days | In 4 days | One outbound, one cancelled return |
| TIA    | FRA         | In 3 days | In 5 days | Two outbound, two return           |
| TIA    | FRA         | Tomorrow  | —         | No results (shows the empty state) |

If the examples return nothing, the database is probably from an earlier day. Run `npm run server:reset`.

## Project structure

```
src/
├── components/   Reusable UI (FlightCard, ConfirmDialog, AirportPicker, SearchInput, DatePicker, RecentSearches)
├── constants/    UI text (labels.ts) and app-wide values (general.ts)
├── hooks/        useAppTheme, useToggleFavorite, useDebouncedValue
├── libs/http/    Axios client
├── navigator/    Root stack, bottom tabs, and the Home / Favorites / More stacks
├── screens/      One file per screen
├── server/       seed.json, the script that creates db.json from it, and db.json itself (ignored by git)
├── services/     API and storage calls, one class per resource
├── store/        Redux Toolkit slices (auth, theme, recentSearches, favorites) and auth thunks
├── theme/        Light and dark color tokens, spacing and typography
├── types/        Shared TypeScript types
└── utils/        Validation, date helpers and the recent-search key
__tests__/        Unit tests, mirroring src/
```

## Architecture decisions

### Expo (managed workflow)

The app only needs modules that Expo Go already includes (navigation, secure storage, AsyncStorage, vector icons), so there's no custom native code. Expo gives a fast setup on a physical iPhone without Xcode builds, the same project for iOS and Android, and a path to store builds with EAS later.

### Navigation

- A **root stack** shows either `Auth` (Login) or `Main` (the tabs), depending on whether a session exists. Only one of them is registered at a time, so after logout there's no screen to go Back to. This is the approach React Navigation recommends for auth flows.
- **Bottom tabs:** Home, Favorite Flights, Profile and More.
- Each tab with sub-pages has its **own stack**: Home → Search Results → Flight Details, Favorite Flights → Flight Details, and More → Settings / Help / About / Contact. `FlightDetailsScreen` is registered in both the Home and Favorites stacks, so Back always returns to the screen you came from.
- Profile is a single screen, so it doesn't need a stack.

### State: Redux for shared state, local state for the rest

- **Redux** holds data that several screens use: `auth` (session), `theme` (preference), `recentSearches` and `favorites`. Login, logout and restoring the session on startup are async thunks, like favorites and recent searches, so screens only dispatch actions and show the result. For example, the favorite heart on Search Results, Flight Details and Favorite Flights all read the same list, so a change on one screen shows up on the others without reloading.
- **Local `useState`** holds data that only one screen needs: search results, the flight on the details screen, and form fields.
- Async thunks keep track of their **request IDs**. Favorites and recent-search reducers ignore responses whose request no longer belongs to the current state, including after a session change.
- Favorite changes wait until the initial list loads, and list reloads are blocked during mutations. Repeated taps on the same flight are ignored while its mutation is pending; successful saves replace any existing entry for that flight in Redux.

## Trade-offs and limitations

- **Arrival versus return date:** the assignment's "Arrival date" is interpreted as a return-trip date. The UI calls it "Return Date" to make that explicit. Leaving it empty searches one way; setting it searches the reverse route on that date. A flight's own arrival timestamp is a separate value shown in results/details.
- **Mock search:** the app downloads the small flights collection and filters by route and departure date locally. The spec permits filtered mock data. A larger dataset would need server-side filtering and pagination.
- **Local flight times:** mock timestamps include airport-local time and a UTC offset. Cards/details display the time portion as supplied, while durations use the timestamp offsets. A provider returning UTC-only timestamps would require airport timezone conversion.
- **Persistence:** favorites and recent searches are stored in json-server per user. There is no offline queue or cross-device live synchronization. Repeating a search moves it to the top instead of adding a duplicate: the app saves the new entry, then deletes older copies and anything beyond the latest 10. That costs one extra delete request per repeated search, but keeps the logic in one cleanup step.
- **Past dates:** departure dates before today can't be picked, and a recent search with a past date is rejected when submitted. The return date can't be earlier than the departure date.
- **Airport search:** filtering waits 300 ms after the user stops typing. With the current local list this adds a small delay, but it's in place for when airport search moves to an API, so each pause sends one request instead of one per keystroke.
- **Language:** all text is in English. It's kept in one file, but there's no translation system yet.
- **Demo data:** seed flights are moved to upcoming dates only when the database is created or reset. An existing database keeps its dates, so after a few days the flights move into the past and `npm run server:reset` is needed. Resetting also clears favorites, recent searches and registered users. The seed's UTC offsets (`+02:00`) are kept as they are, even when the moved dates fall after the switch to winter time.

## Future improvements

- **Internationalization (i18n):** move `labels.ts` into translation files with a library such as `i18next` or `expo-localization` with `i18n-js`, and format dates for the user's locale.
- **RTK Query:** replace the hand-written thunks and request-ID checks for favorites, recent searches and flights with RTK Query, which handles caching, refetching, loading states and stale responses.
- **Server-side search:** filter flights and airports on the API with pagination, instead of downloading the full lists.
