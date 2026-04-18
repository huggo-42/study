import * as Schema from "@effect/schema/Schema";
import * as AggregateRoot from "./AggregateRoot.js";
import * as AggregateMessage from "./AggregateMessage.js";
import * as Effect from "effect/Effect";

const ProductAggregate = AggregateRoot.AggregateRoot({
	aggregateRootName: "products"
})

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

export class ReadProductName extends Schema.TaggedRequest<ReadProductName>()(
	"ReadProductName",
	{
		payload: ProductAggregate.Query({}),
		success: Schema.Boolean,
		failure: Schema.Never
	}
) {
}


export class ProductNameChanged extends Schema.TaggedClass<ProductNameChanged>()(
	"ProductNameChanged",
	ProductAggregate.Event({
		oldName: Schema.NonEmptyString,
		newName: Schema.NonEmptyString
	})
) {
}

export class ProductDiscontinued extends Schema.TaggedClass<ProductDiscontinued>()(
	"ProductDiscontinued",
	ProductAggregate.Event({
		reason: Schema.String
	})
) {
}

const MemberAggregate = AggregateRoot.AggregateRoot({
	aggregateRootName: "members"
})

export class MemberJoined extends Schema.TaggedClass<MemberJoined>()(
	"MemberJoined",
	MemberAggregate.Event({})
) {
}

export interface EventSourcedAggregateArgs<A extends AggregateRoot.AggregateRoot<string>> {
	events: 
}

function makeEventSourcedAggregate<A extends AggregateRoot.AggregateRoot<string>>(
	aggregateRoot: A
) {
	return <Events extends ReadonlyArray<AggregateMessage.AggregateMessage.AnyForAggregate<A>>>(...events: Events) =>
		<R>(updateAggregateState: (event: Schema.Schema.Type<Events[number]>) => Effect.Effect<void, never, R>): EventJournal<A, Schema.Schema.Type<Events[number]> => {
		}
}

interface EventJournal<A extends AggregateRoot.AggregateRoot<string>, Events> {
	append(event: Events): Effect.Effect<void, never, void>
}

const ProductEventJournal = makeEventSourcedAggregate(ProductAggregate)(ProductNameChanged, ProductDiscontinued)(
	event => {
		switch (event._tag) {
			case "ProductNameChanged":
				return Effect.logInfo("Product name now is ", event.newName)
			case "ProductDiscontinued":
				return Effect.logInfo("Product with id ", event._id, " is now discontinued")
		}
	}
)

const ProductAggregateJournal2 = makeEventSourcedAggregate(MemberAggregate)(MemberJoined, MemberJoined)
