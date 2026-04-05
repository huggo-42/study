import { Effect, Either, Option, Schedule, pipe } from "effect";
import { succeed } from "effect/Exit";
import assert from "node:assert";

// ================================ Exercise 1 =================================
// Come up with a way to run this effect until it succeeds, no matter how many
// times it failes
//
// Effect.repeat is going to repeat while it succeeds
// Effect.retry is going to repeat while it fails

let i = 0;
const eventuallySucceeds = Effect.suspend(() =>
	i++ < 100 ? Effect.fail("error") : Effect.succeed(42)
);

// const testOne = Effect.retry(eventuallySucceeds, { while: () => true });
// const testOne = Effect.retry(eventuallySucceeds, { times: Infinity });
const testOne = Effect.retry(eventuallySucceeds, Schedule.forever);

console.log(Effect.runSync(testOne))

// -----------------------------------------------------------------------------

// ================================ Exercise 2 =================================
// Come up with a way to run this effect until it succeeds, no matter how many
//
// the thing with Effect.all is that when the first effect fails, the operation
// stops

let j = 0;
const maybeFail = Effect.suspend(() =>
	j++ % 2 === 0 ? Effect.fail(`odd ${j}`) : Effect.succeed(j)
);
const maybeFailArr = new Array(10).fill(0).map(() => maybeFail);

// ex1: Effect.Effect<number[], string, never>
const _ = Effect.all(maybeFailArr);
// ex2: Effect.Effect<number[], Option.Option<string>[], never>
const __ = Effect.all(maybeFailArr, { mode: 'validate' });

// testTwo: Effect.Effect<number[], string[], never>
const testTwo = Effect.all(maybeFailArr, { mode: 'validate' }).pipe(
	Effect.mapError((errors) => errors.filter(Option.isSome).map((e) => e.value))
);

// console.log(Effect.runSync(testTwo))

// const testTwo = Effect.all(maybeFailArr, { mode: 'validate' }).pipe(
// 	Effect.mapError((errors) => errors.filter(Option.isSome).map((e) => e.value))
// );
// -----------------------------------------------------------------------------

// ================================ Exercise 3 =================================
// Now succeed with both an array of success values and an array of errors

const testThree = Effect.all(maybeFailArr, { mode: "either" }).pipe(
	Effect.andThen((result) => ({
		success: result.filter(Either.isRight).map((_) => _.right),
		failure: result.filter(Either.isLeft).map((_) => _.left),
	}))
);

console.log(Effect.runSync(testThree))
// -----------------------------------------------------------------------------
