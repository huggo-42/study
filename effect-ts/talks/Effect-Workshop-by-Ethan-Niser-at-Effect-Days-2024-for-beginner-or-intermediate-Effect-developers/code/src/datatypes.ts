import { Cause, Chunk, Data, Duration, Effect, Either, Equal, Exit, Hash, HashSet, Option, pipe } from "effect";
import type { FiberId } from "effect/FiberId";

// // Option -> type Option<A> = Some<A> | None
// // Option is a datatype that represents a value that may or may not be present
// // It is superior to using null or undefined because it is much more composable
//
// // constructors
// const none = Option.none();
// const some = Option.some(1);
// Option.fromNullable(null);
//
// // Commom operations
// declare const opt: Option.Option<number>;
//
// if (Option.isSome(opt)) {
// 	opt.value;
// };
//
// Option.map(opt, (x) => x + 1);
// Option.flatMap(opt, (x) => Option.some(x + 1));
// Option.match(opt, {
// 	onSome: (x) => x + 1,
// 	onNone: () => 0
// });
//
// // destructors
// Option.getOrElse(opt, () => 0);
// Option.getOrThrow(opt);
// Option.getOrNull(opt);
// Option.getOrUndefined(opt);
//
// // Very similiar to Option, we have Either
// // Either is a datatype that represents a value that may be one of two types
// // Options are really just Either's where the left type is void
//
// const left = Either.left(1);
// const right = Either.right("error");
//
// // Commom operations
// declare const e: Either.Either<number, string>;
// if (Either.isRight(e)) {
// 	e.right;
// };
// if (Either.isLeft(e)) {
// 	e.left;
// };
//
// Either.map(e, (x) => x.length);
// Either.mapLeft(e, (x) => x + 1);
// Either.mapBoth(e, {
// 	onLeft: (e) => e.toUpperCase(),
// 	onRight: (e) => e * e
// });
// Either.flatMap(e, (x) => Either.right(x + 1));
// Either.match(e, {
// 	onLeft: (e) => e.toUpperCase(),
// 	onRight: (e) => e * e
// });
//
// /*
//  * Effect's are lazy, Option/Either are eager
//  * could simply use Effect everywhere, wouldn't be wrong
//  */
//
// // Example on how Effects are lazy ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// const sideEffect = (x: number) => {
// 	console.log("side effect!");
// 	return x + 1;
// }
//
// const effect = pipe(
// 	Effect.succeed(1),
// 	Effect.map((x) => sideEffect(x))
// );
// // nothing has happened yet, the effect has not been run
//
// const either = pipe(
// 	Either.left(1),
// 	Either.mapLeft((x) => sideEffect(x))
// );
// // the side effect has already happened
//
// /*
//  * When should use Option/Either
//  * 1. Interop with non-effect code, because option/either are purely synchronous
//  * they're great for interoping with non-effect code while still preserving the
//  * benefits of typed errors and composable operations
//  * 2.  As DATA, if you have a value that is either present or not, or is one of
//  * two types
//  * 3. Effects represent computations, Option/Either represent data
//  */
//
// declare function doLogicThatMightFail1(): Either.Either<string, Error>;
// declare function doLogicThatMightFail2(): Effect.Effect<string, Error>;
//
// // Mapping Option/Either to Effect
// // Option<T>    => Effect<T, NoSuchElementException>
// // Either<E, A> => Effect<A, E>
//
// // result: Effect.Effect<string, NoSuchElementException, never>
// const result = pipe(
// 	Option.some(5),
// 	Effect.flatMap((x) => Either.right(x.toString()))
// );

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Datatype Exit

// Exit => Either<A, Cause<E>>

// const program = Effect.runSyncExit(Effect.succeed(42));
//
// Exit.match(program, {
// 	onFailure: (cause) => console.error(`Exited with failure state: ${cause._tag}`),
// 	onSuccess: (value) => console.log(`Exited with failure state: ${value}`)
// })
//
// declare const cause: Cause.Cause<number>;
// Cause.match(cause, {
// 	onEmpty: undefined,
// 	onFail: function(error: number): unknown {
// 		throw new Error("Function not implemented.");
// 	},
// 	onDie: function(defect: unknown): unknown {
// 		throw new Error("Function not implemented.");
// 	},
// 	onInterrupt: function(fiberId: FiberId): unknown {
// 		throw new Error("Function not implemented.");
// 	},
// 	onSequential: function(left: unknown, right: unknown): unknown {
// 		throw new Error("Function not implemented.");
// 	},
// 	onParallel: function(left: unknown, right: unknown): unknown {
// 		throw new Error("Function not implemented.");
// 	},
// });

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Datatype Duration
// Duration is a datatype that represents a time duration

// constructors
Duration.millis(1000);
Duration.seconds(1);
Duration.minutes(1);
Duration.zero;
Duration.infinity;
Duration.decode("7 hours");

// destructors
Duration.toMillis(Duration.millis(1000));
Duration.toSeconds(Duration.seconds(1));

// operations
Duration.lessThan(Duration.millis(1000), Duration.seconds(1))
Duration.greaterThan(Duration.millis(1000), Duration.seconds(1))
Duration.sum(Duration.millis(1000), Duration.seconds(1))
Duration.times(Duration.millis(1000), 4)

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Effect also has many data structures
// they are all functional and immutable

// List: a linked list, HashMap, HashSet, RedBlackTree, and more

/*
 * The most commom is `Chunk`
 * Chunks are ordered collections of elements, often backed by an array
 * but are immutable, functional, and fast due to structural sharing
 *
 * on `append` it doesn't copy the whole array, it works like a linked list
 * (with pointer for prev and next)
 */

const c1 = Chunk.make(1, 2, 3);
const c2 = Chunk.fromIterable([1, 2, 3]);
const c3 = Chunk.append(c1, c2);
const c4 = Chunk.drop(c3, 2);
Chunk.toReadonlyArray(c4);

// -----------------------------------------------------------------------------
// 'Traits'

/*
 * Effect has two 'Traits', Equal and Hash
 *
 * They're used to compare two values with `Equals.equals` and has a value with
 * `Hash.hash`
 * All values have a default implementation, but you can provide your own for
 * custom types and for using values as keys in a Map or Set
 */

const s1 = new Set<Chunk.Chunk<number>>();
s1.add(Chunk.make(1, 2, 3));
s1.add(Chunk.make(1, 2, 3));
// console.log("s1", s1.size) // 2 because of referentially equality

// Using Effect's HashSet
// will result int size 1 because Effect has a special Equals that will find
// `Chunk.make(1, 2, 3)` twice, therefore, treat as one
let s2 = HashSet.empty<Chunk.Chunk<number>>();
s2 = HashSet.add(s2, Chunk.make(1, 2, 3));
s2 = HashSet.add(s2, Chunk.make(1, 2, 3));
// console.log("s2", HashSet.size(s2)) // 1 because of structural equality

// To implement a trait, you just provide a function with the 'equals' or 'hash'
// symbol very similiar to how you make a type iterable

class Foo1 {
	constructor(readonly x: number) { }
}

class Foo2 implements Equal.Equal, Hash.Hash {
	constructor(readonly x: number) { }

	[Equal.symbol](that: unknown): boolean {
		return that instanceof Foo2 && that.x == this.x; // "deep" check
	}

	[Hash.symbol](): number {
		return Hash.number(this.x);
	}
}

let s3 = HashSet.empty<Foo1 | Foo2>();
s3 = HashSet.add(s3, new Foo1(1));
s3 = HashSet.add(s3, new Foo1(1));
s3 = HashSet.add(s3, new Foo2(1));
s3 = HashSet.add(s3, new Foo2(1));
console.log("s3", HashSet.size(s3)); // 3 because Foo2 are considered equal
console.log(Equal.equals(new Foo1(1), new Foo2(1))); // false
console.log(Equal.equals(new Foo2(1), new Foo2(1))); // true

// -----------------------------------------------------------------------------
// Data module

/*
 * The Data module contains a number of functions that implement deep equality
 * and hashing for custom types for users
 */

interface Foo3 {
	readonly a: number;
	readonly b: string;
}

const Foo3 = Data.case<Foo3>();
const f3 = Foo3({ a: 1, b: "a" });

interface TaggedFoo3 {
	readonly _tag: "Foo3";
	readonly a: number;
	readonly b: string;
}
const TaggedFoo3 = Data.tagged<TaggedFoo3>("Foo3");
const tf3 = TaggedFoo3({ a: 1, b: "a" });

class Foo4 extends Data.Class<{ readonly a: number; readonly b: string; }> { }
const f4 = new Foo4({ a: 1, b: "a" });

class TaggedFoo4 extends Data.TaggedClass("TaggedFoo4")<{
	readonly a: number;
	readonly b: string;
}> { }
const tf4 = new TaggedFoo4({ a: 1, b: "a" });

// custom behavior at the same time:
class Foo5 extends Data.TaggedClass("Foo5")<{
	readonly a: number;
	readonly b: string;
}> {
	get c() {
		return this.a + this.b.length;
	}

	ab() {
		return String(this.a) + this.b;
	}
}
const f5 = new Foo5({ a: 1, b: "a" });
console.log(f5.c);

// helper for creating tagged union of case classes

type AppState = Data.TaggedEnum<{
	Startup: {};
	Loading: {
		readonly status: string;
	};
	Ready: {
		readonly data: number;
	}
}>;
const { Startup, Loading, Ready } = Data.taggedEnum<AppState>();

const state1 = Startup();
const state2 = Loading({ status: "loading" });
const state3 = Ready({ data: 42 });

// For creating custom error types there is Data.Error and Data.TaggedError

class FooError extends Data.Error<{ readonly a: number; readonly b: string; }> { }
class TaggedFooError extends Data.TaggedError("TaggedFooError")<{
	readonly a: number;
	readonly b: string;
}> { }

const errors = Effect.gen(function*() {
	return yield* new FooError({ a: 1, b: "a" })
})
