## Database

There are 4 main tables:

`tournaments`

- `id`: tournament id
- `name`: tournament name
- `created_at`: creation time

`players`

- `id`: player id
- `name`: player name
- `created_at`: creation time

`tournament_players`

- `id`: relation record id
- `tournament_id`: related tournament id
- `player_id`: related player id
- `created_at`: when this player joined this tournament
- unique constraint on (`tournament_id`, `player_id`) to avoid duplicate joins

`matches`

- `id`: match id
- `tournament_id`: related tournament id
- `player1_id`: first player
- `player2_id`: second player
- `winner_id`: winner player id; `null` means draw
- `created_at`: match record creation time
- unique constraint on (`tournament_id`, `player1_id`, `player2_id`) to avoid duplicate pair records

## API

Below is what is currently implemented.

### Player APIs

- `GET /players`
    - Returns an array of players.
- `GET /players/:id`
    - Returns one player object; `404` if not found.
- `POST /players`
    - Body: `{ name: string }`
    - Returns the created player object.
- `PUT /players/:id`
    - Body: `{ name: string }`
    - Returns updated player object; `404` if not found.
- `DELETE /players/:id`
    - Returns `204` on success; `404` if not found.
- `GET /players/:id/tournaments`
    - Returns an array of tournaments joined by this player.
- `GET /players/:id/matches`
    - Returns an array of matches this player participated in.

### Tournament APIs

- `GET /tournaments`
    - Returns an array of tournaments.
- `GET /tournaments/:id`
    - Returns one tournament object; `404` if not found.
- `POST /tournaments`
    - Body: `{ name: string }`
    - Returns the created tournament object.
- `PUT /tournaments/:id`
    - Body: `{ name: string }`
    - Returns updated tournament object; `404` if not found.
- `DELETE /tournaments/:id`
    - Returns a success message object; `404` if not found.
- `GET /tournaments/:id/players`
    - Returns an array of players in that tournament.
- `POST /tournaments/:id/players`
    - Body: `{ playersList: string[] }`
    - Batch add players to the tournament.
    - Returns an object with `added` list and (if partial) `failed` list.
- `DELETE /tournaments/:id/players/:playerId`
    - Removes one player from a tournament.
    - Returns `204` on success; `404` if relation not found.
- `GET /tournaments/:id/matches`
    - Returns an array of matches in this tournament.

### Match APIs

- `POST /matches`
    - Body: `{ tournamentId: string, player1Id: string, player2Id: string, winnerId: string | null }`
    - Returns created match object.
- `GET /matches/:id`
    - Returns one match object; `404` if not found.
- `PUT /matches/:id`
    - Body: `{ player1Id: string, player2Id: string, winnerId: string | null }`
    - Returns updated match object; `404` if not found.
- `DELETE /matches/:id`
    - Returns `204` on success; `404` if not found.

### Leaderboard APIs

Status here is simplified to two values: `started` and `finished`.

- `GET /leaderboard/:id`
    - Returns one leaderboard object for the given tournament id.
    - The object contains tournament meta (`tournamentId`, `tournamentName`, `status`, `totalPlayers`, `totalMatches`, `playedMatches`) and `leaderboard` array.
- `GET /leaderboard?name=<tournamentName>`
    - Returns an array of leaderboard objects for all tournaments with that name.
