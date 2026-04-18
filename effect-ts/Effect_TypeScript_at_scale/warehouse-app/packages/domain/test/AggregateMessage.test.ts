import { describe, expect, it } from "@effect/vitest"
import * as Schema from "@effect/schema/Schema";
import * as AggregateRoot from "../src/AggregateRoot.js";
import * as AggregateMessage from "../src/AggregateMessage.js";
import * as Option from "effect/Option";

const ProductAggregate = AggregateRoot.AggregateRoot({
	aggregateRootName: "products"
})

export class ReadProductName extends Schema.TaggedRequest<ReadProductName>()(
	"ReadProductName",
	{
		payload: ProductAggregate.Query({}),
		success: Schema.Boolean,
		failure: Schema.Never
	}
) {
}

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

export class ProductNameChanged extends Schema.TaggedClass<ProductNameChanged>()(
	"ProductNameChanged",
	ProductAggregate.Event({
		oldName: Schema.NonEmptyString,
		newName: Schema.NonEmptyString
	})
) {
}

describe("Dummy", () => {
	it("Query - it should check the type of a message", () => {
		const messageKind = AggregateMessage.getAggregateMessageKind(ReadProductName)
		expect(Option.isSome(messageKind)).toBe(true)
		expect(messageKind).toEqual(Option.some("Query"))
	})
	it("Command - it should check the type of a message", () => {
		const messageKind = AggregateMessage.getAggregateMessageKind(ChangeProductName)
		expect(Option.isSome(messageKind)).toBe(true)
		expect(messageKind).toEqual(Option.some("Command"))
	})
	it("Event - it should check the type of a message", () => {
		const messageKind = AggregateMessage.getAggregateMessageKind(ProductNameChanged)
		expect(Option.isSome(messageKind)).toBe(true)
		expect(messageKind).toEqual(Option.some("Event"))
	})
	it("Command - by default the aggregate root should be filled", () => {
		const message = ChangeProductName.make({
			newName: "New product",
			_id: "message-id",
			_aggregateId: "product-abc",
		})
		expect(message._aggregateRoot).toEqual(ProductAggregate.aggregateRootName)
	})
})
