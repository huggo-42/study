import { ParseResult, Schema } from "effect";

// ================================ Exercise 1 =================================
// for each type below, create a Schema that corresponds to it's type

// -------------------------------------
type A = {
	readonly bool: boolean;
	readonly num: number;
	readonly str: string;
	readonly sym: symbol;
}
const A = Schema.Struct({
	bool: Schema.Boolean,
	num: Schema.Number,
	str: Schema.String,
	sym: Schema.Symbol,
})
// -------------------------------------
type B = "a" | "b" | "c";
const B = Schema.Union(
	Schema.Literal("a"),
	Schema.Literal("b"),
	Schema.Literal("c")
)
const BAnotherWay = Schema.Literal("a", "b", "c")
// const B:           Schema.Union<[Schema.Literal<["a"]>, Schema.Literal<["b"]>, Schema.Literal<["c"]>]>
// const BAnotherWay: Schema.Literal<["a", "b", "c"]>
// is `Schema.Union` equivalent to `Schema.Literal` still?
// -------------------------------------
type C = {
	readonly code: `${B}-${B}-${number}`;
	readonly data: readonly [ReadonlyArray<A>, keyof A];
}
const C = Schema.Struct({
	code: Schema.TemplateLiteral(B, Schema.Literal("-"), B, Schema.Literal("-"), Schema.Number),
	data: Schema.Tuple(Schema.Array(A), Schema.keyof(A))
})
// -------------------------------------
type D = {
	readonly value: string;
	readonly partial: Partial<A>;
}
// const D: Schema.Schema<D> = Schema.Struct({
// 	value: Schema.String,
// 	// next: Schema.suspend(() => D)
// 	next: Schema.NullOr(Schema.suspend(() => D))
// })
// -------------------------------------
type E = {
	readonly ab: A | B;
	readonly partial: Partial<A>;
}
const E = Schema.Struct({
	ab: Schema.Union(A, B),
	partial: Schema.partial(A)
})
// -------------------------------------
// ================================ Exercise 2 =================================
// 1. write a schema that transforms a string to a `URL`
// if you can: soncider how to handle the URL constructor throwing an error

const URLSchema = Schema.declare((input): input is URL => input instanceof URL);

// desired:
// const URLFromString: Schema.Schema<URL, string> = Schema.Any;
// const HttpsURL: Schema.Schema<URL, string> = Schema.Any;

const goodInput = "https://example.com";
const badInput = "http://example.com";
const reallyBadInput = "not a url";

const URLFromString = Schema.transformOrFail(
	Schema.String,
	URLSchema,
	{
		strict: true,
		decode: (input, options, ast) => ParseResult.try({
			try: () => new URL(input),
			catch: (e) => new ParseResult.Type(
				ast,
				input,
				e instanceof Error ? e.message : undefined
			)
		}),
		encode: (url, options, ast) => ParseResult.succeed(url.toString())
	}
)

const IsHttps =
	URLSchema.pipe(Schema.filter((url) => url.protocol === "https:"));

const HttpsURL = Schema.compose(URLFromString, IsHttps)

