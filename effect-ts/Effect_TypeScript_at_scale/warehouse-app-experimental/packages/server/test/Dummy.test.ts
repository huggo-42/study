import { describe, expect, it } from "@effect/vitest"
import { ProductApi } from "@template/domain/ProductApi"
import { HttpApiClient } from "@effect/platform"
import { NodeHttpClient } from "@effect/platform-node"
import { Effect } from "effect"

describe("Dummy", () => {
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
