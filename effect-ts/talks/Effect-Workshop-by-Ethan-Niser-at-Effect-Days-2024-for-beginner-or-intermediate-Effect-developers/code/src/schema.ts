import { Effect, ParseResult, Schema } from "effect";

/*
A `Schema<A, I = A, R = never>` can describe:
- validating that `unknown` data is of type `A`
- validating that `unknown` data is of type `I`
- encoding `A` to `I`
- encoding `I` to `A`

The `I = A` is important because of course not all validation requires a transformation
So, `Schema<string>` is simply a schema that validates if the data is a string
The `R` represents services the transformation requires (as transformations can be effectful)
 */

const string = Schema.String;
const number = Schema.Number;

const NumberFromString = Schema.transform(
	Schema.String,
	Schema.Number,
	{
		decode: (string: string) => parseInt(string),
		encode: (number: number) => number.toString()
	}
);

// ast => schema's abstract syntax tree for context
// const NumberFromString = Schema.transformOrFail(
// 	Schema.String,
// 	Schema.Number,
// 	{
// 		strict: true,
// 		decode: (input, options, ast) => {
// 			const parsed = parseFloat(input)
// 			if (isNaN(parsed)) {
// 				return ParseResult.fail(
// 					new ParseResult.Type(
// 						ast,
// 						input,
// 						"Failed to convert string to number"
// 					)
// 				)
// 			}
// 			return ParseResult.succeed(parsed);
// 		},
// 		encode: (input, options, ast) => ParseResult.succeed(input.toString())
// 	}
// );

type Encoded = typeof NumberFromString.Encoded

type Type = typeof NumberFromString.Type

const takesNumber = (n: number) => n;
const takesString = (s: string) => s;
const str = "123";
const n = 132;
declare const unknown: unknown;

/*
 * "we give our schema to one of these schema functions and it returns back a function
 *
 * it's exactly that:
 *
 * (u: unknown, overrideOptions?: ParseOptions | number) => u is number
 * `Schema.is(NumberFromString)`
 * so we can run it like this: `Schema.is(NumberFromString)(unknown)`
 *
 * is is a type guard, it says `u is number`
 */

// if (Schema.is(NumberFromString)(unknown)) {
// 	takesNumber(unknown);
// }

/*
 * `Schema.Schema.ToAsserts` throws if it is not
 */

// if (false) {
// 	const assertsNumber: Schema.Schema.ToAsserts<typeof NumberFromString> =
// 		Schema.asserts(NumberFromString);
// 	assertsNumber(unknown);
// 	takesNumber(unknown);
// }

/*
 * `Schema.validate`
 */

// const _ = Effect.gen(function*() {
// 	if (yield* Schema.validate(NumberFromString)(unknown)) {
// 		takesNumber(unknown);
// 	}
// })

// -----------------------------------------------------------------------------

/*
 * Transformations
 *
 * for `A` to `I` we use `encode` -> number to string
 * for `I` to `A` we use `decode` -> string to number
 */

// no sufix - returns `Effect<T, ParseError, R>`
const one = Schema.encode(NumberFromString)(n);
// `sync` - returns `T` or throws `ParseError`
const two = Schema.encodeSync(NumberFromString)(n);
// `promise` - returns `Promise<T>` or rejects with `ParseError`
const three = Schema.encodePromise(NumberFromString)(n);
// `option` - returns `Option<T>` that is `None` if the data is invalid
const four = Schema.encodeOption(NumberFromString)(n);
// `either` - returns `Either<ParseError, T>` that is `left` if data is invalid
const five = Schema.encodeEither(NumberFromString)(n);

/*
 * note that with `encodeOption` and `encodeEither` we get errors as values
 * meaning it will not throw
 *
 * also all five methods: encode, encodeSync, encodePromise, encodeOption,
 * encodeEither have a version that takes unknown values (these five takes
 * only of type number.
 *
 * encode,Unknown encodeUnknownSync, encodeUnknownPromise, encodeUnknownOption,
 * encodeUnknownEither
 */


const date = new Date();
const toString = Schema.encodeSync(Schema.DateFromString)(date);
const fromString = Schema.decodeSync(Schema.DateFromString)(toString);
// console.log(toString, fromString)

// -----------------------------------------------------------------------------
//
// Consider the alternative (callbacks or global coroutines)
// (use golang as example, it's goroutines)
//
// - Functions aren't 'black boxes' anymore as they can 'leak' tasks
// - When a task errors, who is responsible for that error?
// - If a task has resources, who makes sure those get cleaned up?
// - How do you stop a task from the outside (you can't)

// Escape hatches if you need then
//
// - `forkDaemon` spawns a fiber in the top level, global scope
// - `forkScoped` spawns a fiber and requires a `Scope` to be provided
// - `forkIn` allows you to specify a custom scope to spawn a fiber in

// Fiber to Fiber communication
// - Arguable benefits over shared state
// - `Deferred` for 'one shot' channel that can error
// - `Queue` standard 'channel', customizable back pressure behavior
// - `PubSub` for 'publishing' to multiple 'subscribers'

// High Level Abstractions
// - Working with fibers directly is often not necessary
// - All combinators that operate on multiple effects have special 'concurrency'
// options
// - All the benefits of fibers + structured concurrency in a single line

/*
 * This code spawns a fiber for each effect and run then concurrently
 * If any Effect fails, it stops the other fibers from running
const runsConcurrently = Effect.all(
	[logAfter(500), logAfter(1000),logAfter(1500)],
	{ concurrency: "unbounded" }
);

 * If you want to run, let's say, two at a time:
const runsConcurrently = Effect.all(
	[logAfter(500), logAfter(1000),logAfter(1500)],
	{ concurrency: "2" }
);

 * Also, can be controlled externally
const externalController  = Effect.all(
	[logAfter(500), logAfter(1000),logAfter(1500)],
	{ concurrency: "inherit" }
).pipe(Effect.withConcurrency(2));

 * Yes, all in one thread
 */

