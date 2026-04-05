import { Effect, pipe } from "effect"

// const program = Console.log("Hello, World!")
// console.log("Hello via Bun!");
// Effect.runSync(program)
//
// =============================================================================
//
// const successfulProgram = Effect.sync(() => {
// 	console.log('hi from successfulProgram')
// 	return 42
// })
//
// const failedProgram = Effect.try(() => {
// 	throw new Error('boom from failedProgram')
// 	return 42
// })
//
// const asyncProgram = Effect.promise(() => Promise.resolve('42 from asyncProgram'))
//
// console.log(successfulProgram) console.log(failedProgram) console.log(asyncProgram)
//
// Effect.runSync(successfulProgram) // Effect.runPromise(failedProgram)
// Effect.runPromise(asyncProgram).then((r) => console.log(r))
//
// =============================================================================
//
// type One = {
// 	readonly _tag: "One"
// 	readonly foo: string
// }
//
// type Two = {
// 	readonly _tag: "Two"
// 	readonly foo: string
// }
//
// type Union = One | Two
//
// declare const union: Union
//
// switch (union._tag) {
// 	case "One":
// 		console.log(union.foo)
// 		break
// 	case "Two":
// 		console.log(union.foo)
// 		break
// 	default:
// 		break
// }
//
// =============================================================================
//
// const getDate = () => Date.now()
// const double = (x: number) => x * 2;
// const toString = (x: number) => x.toString();
// const toUpperCase = (x: string) => x.toUpperCase();
// const program42 = () => pipe(getDate(), double, toString, toUpperCase);
//
// =============================================================================
//
// BAD EXAMPLE
// We don't want to have Effect.run inside other effects.
// const getDate = Effect.sync(() => Date.now());
// const double = (x: number) => x * 2;
// const doubleDate = Effect.sync(() => {
// 	const date = Effect.runSync(getDate);
// 	return double(date);
// })
//
// const doubleDate2 = pipe(getDate, double);
// LSP ERROR: Argument of type 'Effect<number, never, never>' is not assignable to parameter of type 'number'.
//
// This means we need to deal with the possible return values of the effect, cannot simple pipe it
// for that, we use map
//
// map takes an effect and a function that operates on the type of that Effect
//
// Effect.Effect<number, never, never>
// const doubleDate3 = Effect.map(getDate, (x) => double(x));
// Effect.Effect<string, never, never>
// const doubleDate3 = Effect.map(getDate, (x) => x.toString());
// The type of doubleDate3 depends on the return of the map function
//
// const program = pipe(
// 	getDate,
// 	Effect.map((x) => x * 2),
// 	Effect.map((x) => x.toString()),
// 	Effect.map((x) => x.toUpperCase()),
// );
// =============================================================================
//
// const divide = (a: number, b: number): Effect.Effect<number, Error> =>
// 	b === 0
// 		? Effect.fail(Error("Can not divide by zero"))
// 		: Effect.succeed(a / b);
// //
// const program = pipe(
// 	Effect.succeed([25, 5] as const),
// 	Effect.map(([a, b]) => divide(a, b))
// );
// program: Effect.Effect<Effect.Effect<number, Error, never>, never, never>
// the success type is itself an Effect, we need a way to flat them
//
// const program = pipe(
// 	Effect.succeed([25, 5] as const),
// 	Effect.flatMap(([a, b]) => divide(a, b))
// );
// program: Effect.Effect<number, Error, never>
//
// Example:
// `ls | grep .json`
// ls is a program, grep is another program, we ran all at once, as one program
//
// =============================================================================

// const program = pipe(
// 	Effect.sync(() => Date.now()),
// 	Effect.map((x) => x * 2),
// 	//
// 	// Effect.map((x) => {
// 	// 	console.log(x);
// 	// 	return x;
// 	// }),
// 	// we need to do `return x;` because x is used on the next item of the pipe
// 	// so, we could use `tap` to just run without, and do whatever we want with
// 	// x without changing the actual value of x that will be used next thunk
// 	Effect.tap((x) => console.log(x)),
// 	Effect.flatMap((x) => divide(x, 3)),
// 	Effect.map((x) => x.toString()),
// );
//
// const getDate = Effect.sync(() => Date.now());
// const yesterday = Effect.sync(() => Date.now() - 24 * 60 * 60 * 1000);
//
// Effect.all takes an array of Effects and returns an array of results
// const both = Effect.all([getDate, yesterday]);
//
// const program = pipe(
// 	// Effect.all([getDate, yesterday]),
// 	// Effect.map(([x, y]) => x + y);
// 	// Or, we can use pass objects
// 	Effect.all({ x: getDate, y: yesterday }),
// 	Effect.map(({ x, y }) => x + y),
// );
//
// =============================================================================
// ################################ Generators #################################
// Generators are another way to compose Effects
// So, intead of using functions, we could use generators.
//
// const divide = (a: number, b: number): Effect.Effect<number, Error> =>
// 	b === 0
// 		? Effect.fail(Error("Can not divide by zero"))
// 		: Effect.succeed(a / b);
// //
// const program = pipe(
// 	Effect.sync(() => Date.now()),
// 	Effect.map((x) => x * 2),
// 	Effect.flatMap((x) => divide(x, 3)),
// 	Effect.map((x) => x.toString()),
// );
// it is familiar to a Promise chain
// const promise = new Promise<number>((res) => res(Date.now()))
// 	.then((x) => x * 2)
// 	.then(
// 		(x) => new Promise<number>((res, rej) =>
// 			x === 0
// 				? rej("Cannot divide by zero")
// 				: res(x / 3)
// 		)
// 	)
// 	.then((x) => x.toString());
// which resambles...
// async function program2() {
// 	const x = await Promise.resolve(Date.now());
// 	const y = x * 2;
// 	const z = await new Promise<number>((res, rej) =>
// 		y === 0
// 			? rej("Cannot divide by zero")
// 			: res(x / 3)
// 	);
// 	return z.toString();
// }
//
// const divide = (a: number, b: number): Effect.Effect<number, Error> =>
// 	b === 0
// 		? Effect.fail(Error("Can not divide by zero"))
// 		: Effect.succeed(a / b);
// //
// const program = pipe(
// 	Effect.sync(() => Date.now()),
// 	Effect.map((x) => x * 2),
// 	Effect.flatMap((x) => divide(x, 3)),
// 	Effect.map((x) => x.toString()),
// );
//
// const after = Effect.gen(function*(_) {
// 	// x is a number, yield is like await
// 	const x = yield* _(Effect.sync(() => Date.now()));
// 	const y = x * 2;
// 	const z = yield* _(divide(y, 3));
// 	return z.toString();
// })
//
// const gen = Effect.gen(function*(_) {
// 	const x = yield* _(
// 		Effect.succeed(5),
// 		Effect.map((x) => x * 2),
// 		Effect.map((x) => x.toString()),
// 	);
// 	const y = yield* _(Effect.succeed(10));
// 	return y.toString();
// })
//
//
// {   // those two are equivalent
// 	const before = pipe(
// 		Effect.succeed(5),
// 		Effect.map((x) => x * 2),
// 		Effect.map((x) => x.toString()),
// 	);
//
// 	const after = Effect.succeed(5).pipe(
// 		Effect.map((x) => x * 2),
// 		Effect.map((x) => x.toString()),
// 	);
// }
//
// { // zip is like all, but with only two Effects. zipping together two effects
	// const zipped = Effect.zip(Effect.succeed("hi"), Effect.succeed(10));
	// zipped: Effect.Effect<[string, number], never, never>
	//
	// const zippedLeft = Effect.zipLeft(Effect.succeed("hi"), Effect.succeed(10));
	// zippedLeft: Effect.Effect<string, never, never>
	//
	// const zippedRight = Effect.zipRight(Effect.succeed("hi"), Effect.succeed(10));
	// zippedRight: Effect.Effect<number, never, never>
	//
	// basically...
	// Effect.all().pipe(
	// 	Effect.map([l, r] => l) // for zipLeft
	// 	Effect.map([l, r] => r) // for zipRigth
	// )
// }

