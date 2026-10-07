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

The app only needs modules that Expo Go already includes, so there's no custom native code. Expo gives a fast setup on a physical phone without Xcode builds, one project for iOS and Android, and a path to store builds with EAS later.

### Navigation

- A **root stack** shows either `Auth` (Login) or `Main` (the tabs), depending on whether a session exists. After logout there's no screen to go Back to.
- **Bottom tabs** (Home, Favorite Flights, Profile, More), each with its own stack where needed. Flight Details is registered in both the Home and Favorites stacks, so Back returns to the screen you came from.

### State: Redux for shared state, local state for the rest

- **Redux** holds data that several screens use: the session, theme, recent searches and favorites. For example, the favorite heart on Search Results, Flight Details and Favorite Flights reads the same list, so a change on one screen shows up everywhere.
- **Local `useState`** holds data only one screen needs: search results, the flight on the details screen and form fields.
- API calls live in **services** and run through **async thunks**, so screens only dispatch actions and show the result. Thunks ignore stale responses, for example ones that arrive after logout.

### Data and persistence

- **Session:** the token is saved in `expo-secure-store` (Keychain/Keystore) and checked on startup. A `401` from the API logs the user out.
- **Favorites store only a `flightId`**, so details like gate and status are always current.
- **Theme** is saved with AsyncStorage. It isn't sensitive and should apply on the Login screen too.
- **UI text** lives in `src/constants/labels.ts`, which keeps wording consistent and makes translations easier to add later.

## Trade-offs and limitations

- **Arrival vs return date:** the assignment's "Arrival date" is treated as the return date of a round trip, and the UI calls it "Return Date". Leaving it empty searches one way.
- **Mock search:** the app downloads the small flights list and filters it on the device. A larger dataset would need server-side filtering and pagination.
- **Airport search debounce:** filtering waits 300 ms after typing stops. It adds a small delay to the local list, but it's ready for when search moves to an API.
- **No offline support:** favorites and recent searches are stored on the mock server only.
- **Demo data:** flight dates move to upcoming days only when the database is created or reset. After a few days, run `npm run server:reset` (this also clears favorites and history).

## Future improvements

- **Internationalization (i18n):** move `labels.ts` into translation files with a library such as `i18next` or `expo-localization` with `i18n-js`, and format dates for the user's locale.
- **RTK Query:** replace the hand-written thunks and request-ID checks for favorites, recent searches and flights with RTK Query, which handles caching, refetching, loading states and stale responses.
- **Server-side search:** filter flights and airports on the API with pagination, instead of downloading the full lists.
