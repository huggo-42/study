import * as AST from "@effect/schema/AST"
import * as Schema from "@effect/schema/Schema"
import * as Option from "effect/Option"
import * as AggregateRoot from "./AggregateRoot.js"

export namespace AggregateMessage {
	export type AnyForAggregate<A extends AggregateRoot.AggregateRoot.All> = {
		Type: {
			_aggregateRoot: AggregateRoot.AggregateRoot.Name<A>
		}
	}
}

export const AggregateMessageAnnotationTypeId = Symbol.for("@@AggregateMessageAnnotationTypeId")

export type AggregateMessageKind = "Query" | "Command" | "Event"

export function withAggregateMessageKindAnnotation(messageKind: AggregateMessageKind) {
	return <A extends Schema.Schema.All>(schema: A): A =>
		Schema.annotations({
			[AggregateMessageAnnotationTypeId]: messageKind
		})(schema)
}

export function getAggregateMessageKind<A extends Schema.Schema.All>(schema: A) {
	return getAggregateMessageKindFromAst(schema.ast)
}

function getAggregateMessageKindFromAst(ast: AST.AST): Option.Option<AggregateMessageKind> {
	const messageKind = AST.getAnnotation<AggregateMessageKind>(AggregateMessageAnnotationTypeId)(ast)

	if (Option.isSome(messageKind)) return messageKind

	switch (ast._tag) {
		case "TypeLiteral":
			for (const propertySignature of ast.propertySignatures) {
				const result = getAggregateMessageKindFromAst(propertySignature.type)
				if (Option.isSome(result)) return result
			}
			return Option.none()
		case "Transformation":
			return getAggregateMessageKindFromAst(ast.from).pipe(
				Option.orElse(() => getAggregateMessageKindFromAst(ast.to))
			)
		case "Refinement":
			return getAggregateMessageKindFromAst(ast.from)
		default:
			return Option.none()
	}
}
