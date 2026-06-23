import { UserSignupRequestData } from "@template/domain/User";
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"

export class UserService extends Effect.Service<UserService>()("UserService", {
	effect: Effect.gen(function*() {
		const sql = yield* SqlClient.SqlClient

		// create the users table if not exists yet
		yield* sql`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					email TEXT,
					name TEXT,
					surname TEXT,
					birthday DATETIME
				)`

		const signup = Effect.fn(function*(data: UserSignupRequestData) {
			yield* sql`
					INSERT INTO users (email, name, surname, birthday)
					VALUES (${data.email}, ${data.name}, ${data.surname}, ${data.birthday.toISOString()})`
		})

		return { signup }
	})
}) { }

