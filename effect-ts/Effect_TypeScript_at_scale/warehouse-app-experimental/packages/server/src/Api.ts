import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"
import { Product, ProductApi } from "@template/domain/ProductApi"
import * as Option from "effect/Option"

const ProductApiLive = HttpApiBuilder.group(ProductApi, "products", (handlers) =>
	handlers.handle("getAllProducts", () => Effect.succeed([
		new Product({ name: "First Product", description: Option.none<string>() }),
		new Product({ name: "Second Product", description: Option.some("test description") })
	]))
)

export const ApiLive = HttpApiBuilder.api(ProductApi).pipe(
	Layer.provide(ProductApiLive)
)
