import * as Schema from "@effect/schema/Schema"

export const UnitOfMeasureIdTypeId = Symbol.for("@@UnitOfMeasure")

export const UnitOfMeasureId = Schema.UUID.pipe(
	Schema.annotations({ identifier: "UnitOfMeasureId" }),
	Schema.brand(UnitOfMeasureIdTypeId)
)

export const UnitOfMeasure = Schema.Struct({
	UnitOfMeasureId: UnitOfMeasureId,
	name: Schema.NonEmptyString
}).pipe(
	Schema.annotations({ identifier: "UnitOfMeasure" })
)
