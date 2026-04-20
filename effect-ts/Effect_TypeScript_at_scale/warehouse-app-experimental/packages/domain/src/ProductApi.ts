import { HttpApiGroup, HttpApiEndpoint, HttpApi } from "@effect/platform"
import { Schema } from "effect"

export class Product extends Schema.TaggedClass<Product>()("Product", {
	name: Schema.NonEmptyString,
	description: Schema.Option(Schema.String)
}) { }

export class ProductApiGroup extends HttpApiGroup.make("products").add(
	HttpApiEndpoint.get("getAllProducts", "/products").addSuccess(Schema.Array(Product))
) { }

export class ProductApi extends HttpApi.make("api").add(ProductApiGroup) { }
