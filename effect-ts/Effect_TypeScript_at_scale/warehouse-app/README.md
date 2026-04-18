# Effect Monorepo Template

This template provides a solid foundation for building scalable and maintainable TypeScript applications with Effect. 

## Running Code

This template leverages [tsx](https://tsx.is) to allow execution of TypeScript files via NodeJS as if they were written in plain JavaScript.

To execute a file with `tsx`:

```sh
pnpm tsx ./path/to/the/file.ts
```

## Operations

**Building**

To build all packages in the monorepo:

```sh
pnpm build
```

**Testing**

To test all packages in the monorepo:

```sh
pnpm test
```


================================================================================

# Notes
```index.ts
import * as Schema from "@effect/schema/Schema";
import * as AggregateRoot from "./AggregateRoot.ts";

const ProductAggregate = AggregateRoot.AggregateRoot({
	aggregateRootName: "products"
})

// export class ChangeProductNameWithSchema extends Schema.TaggedRequest<ChangeProductNameWithSchema>()("ChangeProductNameWithSchema", {
// 	payload: {
// 		newName: Schema.NonEmptyString
// 	},
// 	success: Schema.Boolean,
// 	failure: Schema.Never
// }) { }
// Here we're missing the additional information we want to have, that we have added before
// We could do something like the following to fix:
// export class ChangeProductNameWithSchema extends Schema.TaggedRequest<ChangeProductNameWithSchema>()("ChangeProductNameWithSchema", {
// 	payload: {
// 		_id: Schema.UUID,
// 		_aggregateRoot: Schema.tag("products"),
// 		newName: Schema.NonEmptyString
// 	},
// 	success: Schema.Boolean,
// 	failure: Schema.Never
// }) { }
// this would be the same thing
// now that we've remembered this way, there's a new idea

export class ChangeProductName extends Schema.TaggedRequest<ChangeProductName>()(
	"ChangeProductNameWithSchema",
	{
		payload: ProductAggregate.Command({
			newName: Schema.NonEmptyString
		}),
		success: Schema.Boolean,
		failure: Schema.Never
	}
) {
}

const message = ChangeProductName.make({
	_id: "message-aaa",
	_aggregateId: "product-abc",
	newName: "New Product"
})

/*
export class ChageProductName extends ProductAggregate.Command<ChageProductName>()({
	_tag: "ChageProductName",
	payload: {
		newName: Schema.NonEmptyString
	},
	success: Schema.Boolean,
	failure: Schema.Never
}) { }

*/
```
