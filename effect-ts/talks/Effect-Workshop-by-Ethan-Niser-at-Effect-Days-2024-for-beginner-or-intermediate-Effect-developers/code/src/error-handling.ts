import { Effect, Either, pipe, Exit } from "effect"

// // We use classes a lot because classes are the only way to declare a type and a
// // value at the same time in typescript.
//
// class FooError {
// 	readonly _tag = "FooError"
// }
//
// class BarError {
// 	readonly _tag = "BarError"
// }
//
// const conditions = [true, true, true] as [boolean, boolean, boolean];
//
// const errors = Effect.gen(function*() {
// 	if (conditions[0]) {
// 		return yield* Effect.fail(new FooError());
// 	} else if (conditions[1]) {
// 		return yield* Effect.fail(new BarError());
// 	} else if (conditions[2]) {
// 		return yield* Effect.die("Boom");
// 	}
//
// 	return "Success";
// })
//
// const program = Effect.gen(function*() {
// 	yield* Console.log("1");
// 	return yield* Effect.fail(new Error("Boom"));
// 	yield* Console.log("2"); // will never run
// })
//
// const handled1 = errors.pipe(
// 	Effect.catchAll((e) => Effect.succeed(`Handled ${e._tag}`)),
// );
//
// const handled2 = errors.pipe(
// 	Effect.catchTag("FooError", (e) => Effect.succeed("Handled Foo")),
// );
//
// const handled3 = errors.pipe(
// 	Effect.catchTags({
// 		FooError: (e) => Effect.succeed("Handled Foo"),
// 		BarError: (e) => Effect.succeed("Handled Bar")
// 	}),
// );
//
// // orElse is similiar to catchAll, if we were doing nothing for each error tag
// const handled4 = errors.pipe(Effect.orElse(() => Effect.succeed("Handled")));
//
// // orElseFail maps any error to a new already specified error
// const handled5 = errors.pipe(Effect.orElseFail(() => Error("fail")));
//
// const handled6 = errors.pipe(
// 	Effect.mapError((oldErr) => Error(`error: ${oldErr}`))
// );
//
// const handled7 = errors.pipe(
// 	Effect.match({
// 		onSuccess: (x) => `success: ${x}`,
// 		onFailure: (e) => `handled error: ${e}`
// 	})
// );
//
// const handled8 = Effect.firstSuccessOf([
// 	Effect.fail(Error("fail")),
// 	Effect.succeed("success"),
// ]);
//
// // trying
// // timeouts
// // accumulating instead of short circuiting
//
// =============================================================================
// 
// How do we handle errors with generators
// 

const handleGen1 = Effect.gen(function*() {
	const r = yield* Effect.sync(() => Math.random());
	if (r > 0) {
		return yield* Effect.fail(Error("fail"));
	}
	return r * 2;
}).pipe(Effect.catchAll((e) => Effect.succeed(-1)));

const mightFail = Effect.sync(() => Math.random()).pipe(
	Effect.flatMap((r) => r > 0.5 ? Effect.fail(Error("fail")) : Effect.succeed(r)
	),
);

// // // HOW TO DO THIS WITHOUT THE GENERATOR ADAPTER _?
// // // const handledGen2 = Effect.gen(function*(_) {
// // // 	const r = yield* _(
// // // 		mightFail,
// // // 		Effect.catchAll(() => Effect.succeed(-1))
// // // 	);
// // // 	return r * 2;
// // // });

const handledGen3 = Effect.gen(function*() {
	const either = yield* Effect.either(mightFail);
	if (Either.isRight(either)) {
		return either.right * 2;
	} else {
		console.error(either.left.message);
		return -1;
	}
});

// how to recover from defects
const defects = Effect.die("jifds").pipe(Effect.as(0));
// `as` is a zipRight
// whatever the previous Effect did, do what `as` tells you to `as(0)`

// Exit is basically `Either<A, Cause<E>>`
const exit = pipe(defects, Effect.runSyncExit);
Exit.match(exit, {
	onFailure: function(cause): unknown {
		// Cause.match(cause, {
		// 	onFail,
		// 	onDie,
		// 	onInterrupt,
		// 	onSequential
		// onParallel
		// })
		throw new Error("Function not implemented.");
	},
	onSuccess: function(a: number): unknown {
		throw new Error("Function not implemented.");
	}
});

// pipe(
// 	defects,
// 	Effect.catchAllDefect((defect) => Effect.succeed(0)),
// 	Effect.runSync,
// )
