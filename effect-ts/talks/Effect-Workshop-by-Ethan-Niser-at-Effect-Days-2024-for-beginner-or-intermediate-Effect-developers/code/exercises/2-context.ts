import { Effect, Context, Layer, Console } from "effect";

// ================================ Exercise 1 =================================
// Exercise 1
// `Tag` being a subtype of `Effect` is a bit too easy
// Get the `Foo` service from context manually :)

class Foo extends Context.Tag("Foo")<Foo, { readonly bar: string }>() {
	static readonly Live = Layer.succeed(Foo, { bar: "imFromContext" });
}

const test1 = Effect.gen(function*() {
	const foo = { bar: "hint: look at Effect.context" };
	return foo.bar;
});

const solution1 = Effect.gen(function*() {
	// context: Context.Context<Foo>
	const context = yield* Effect.context<Foo>();

	// foo: { readonly bar: string; }
	const foo = Context.get(context, Foo);

	yield* Console.log(`context: ${context}`)
	yield* Console.log(`foo: ${foo}`)
	yield* Console.log(`getting foo.bar from the context: ${foo.bar}`)
	return foo.bar
});

// Effect.runSync(
// 	Effect.all([
// 		Console.log(`==================== Exercise 1 ====================`),
// 		test1,
// 		solution1,
// 		Console.log(`----------------------------------------------------`),
// 	]).pipe(Effect.provide(Foo.Live))
// );

/*
 * The way services are implemented internally: is just a map from the tags to
 * the values
 *
 * When ran, it logs:
 * context: {
 *   "_id": "Context",
 *   "services": [
 * 	    [
 * 	      "Foo",
 * 	      {
 * 	    	"bar": "imFromContext"
 * 	      }
 * 	    ]
 *   ]
 * }
 * foo: [object Object]
 * getting foo.bar from the context: imFromContext
 */
// -----------------------------------------------------------------------------

// ================================ Exercise 2 =================================
class Random extends Context.Tag("Random")<
	Random,
	{
		readonly nextInt: Effect.Effect<number>;
		readonly nextBool: Effect.Effect<boolean>;
		readonly nextIntBetween: (
			min: number, max: number
		) => Effect.Effect<number>;
	}
>() {
	static readonly Mock = Layer.succeed(Random, {
		nextInt: Effect.succeed(42),
		nextBool: Effect.succeed(true),
		nextIntBetween: (min: number, max: number) => Effect.succeed(min + max)
	});
}

/*
 * Having to get the service, just to use a single property or function is a bit annoying
 * For convenience lets create Effects (or functions that return Effects) themselves already depend on the service
 */

// this was given by the speaker
// declare const nextInt: Effect.Effect<number, never, Random>
// declare const nextBool: Effect.Effect<boolean, never, Random>
// declare const nextIntBetween: (
// 	min: number, max: number
// ) => Effect.Effect<number, never, Random>;

// should be changed into
const nextInt = Random.pipe(Effect.flatMap((r) => r.nextInt));
// const nextBool = Random.pipe(Effect.flatMap((r) => r.nextBool));
const nextBool = Effect.gen(function*() {
	const random = yield* Random;
	return yield* random.nextBool;
});
const nextIntBetween = (min: number, max: number) =>
	Random.pipe(Effect.flatMap((r) => r.nextIntBetween(min, max)));

const { } = Effect.serviceMembers(Random);

const test2 = Effect.gen(function*() {
	const int = yield* nextInt;
	const bool = yield* nextBool;
	const intBetween = yield* nextIntBetween(10, 20);

	yield* Console.log(`int: ${int}`);
	yield* Console.log(`bool: ${bool}`);
	yield* Console.log(`intBetween: ${intBetween}`);

	return { int, bool, intBetween };
});

/*
 * Using `Context.get`
 * const emptyContext = Context.empty().pipe(
 *     Context.add(Foo, { bar: "imFromContext" })
 * );
 * const foo = Context.get(emptyContext, Foo);
 *
 * Using `Effect.serviceMembers`
 * const constants = Effect.serviceMembers(Random).constants;
 * const functions = Effect.serviceMembers(Random).functions;
 *
 * The main difference is that `Context.get` is synchronous, whereas
 * `Effect.serviceMembers` yields an Effect.
 * `Context.get` can be useful when dealing with asynchronous code
 *
 * [IMPORTANT] Inside layers we don't want to use `serviceMembers`, because it
 * would propragate the dependency.
 * You want to separate the access from the user.
 */

Effect.runSync(
	Effect.all([
		Console.log(`==================== Exercise 2 ====================`),
		test2,
		Console.log(`----------------------------------------------------`),
	])
		.pipe(Effect.provide(Random.Mock))
);

// -----------------------------------------------------------------------------
