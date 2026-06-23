import { Schema } from "effect"
import { HttpApiGroup, HttpApiEndpoint } from "@effect/platform"

export const UserId = Schema.UUID.pipe(
	Schema.brand("UserId")
)

export class UserSignupRequestData extends Schema.Class<UserSignupRequestData>("UserSignupRequestData")({
	email: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	surname: Schema.NonEmptyString,
	birthday: Schema.Date
}) { }

export class User extends Schema.TaggedClass<User>()("User", {
	id: UserId,
	...UserSignupRequestData.fields
}) { }

export class UserAlreadySignedUpError extends Schema.TaggedError<UserAlreadySignedUpError>()("UserAlreadySignedUpError", {
}) { }

export class UserApi extends HttpApiGroup.make("users").add(
	HttpApiEndpoint.post("signup", "/signup")
		.setPayload(UserSignupRequestData)
		.addError(UserAlreadySignedUpError)
) { }

