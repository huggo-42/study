import { describe, expect, it } from "@effect/vitest"
import { ProductApi } from "@template/domain/ProductApi"
import { HttpApiClient } from "@effect/platform"
import { NodeHttpClient } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { UserService } from "../src/UserService.js"
import { SqliteClient } from "@effect/sql-sqlite-node"

const TestLayer = UserService.Default.pipe(
	Layer.provide(SqliteClient.layer({
		filename: "mydb.db"
	}))
)

describe("Dummy", () => {
	it.effect.only(
		"creates a user",
		() => Effect.gen(function*() {
			const userService = yield* UserService
			yield* userService.signup({
				email: "test@test.com",
				name: "John",
				surname: "Doe",
				birthday: new Date(1993, 10, 5),
			})
		}).pipe(
			Effect.provide(TestLayer)
		)
	)

	it.effect(
		"Should pass",
		() => Effect.gen(function*() {
			const client = yield* HttpApiClient.make(ProductApi, {
				baseUrl: "http://localhost:3000/"
			})

			const products = yield* client.products.getAllProducts()
			expect(products.length).toEqual(2)
		}).pipe(
			Effect.provide(NodeHttpClient.layer)
		)
	)
})
