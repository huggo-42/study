import { Effect, Scope, Console, Exit, pipe } from "effect";

// Scope - a special service
// Things with a finalizer

/*
 * Example: reading a file
 * A `finalizer` would be `closeFile()`
 *
 * Finalizers are run when a scope is closed
 */

const one = Effect.gen(function*() {
	const scope = yield* Scope.make();
	yield* Scope.addFinalizer(scope, Console.log("Finalizer 1"));
	yield* Scope.addFinalizer(scope, Console.log("Finalizer 2"));
	yield* Console.log("DEPOIS DO 2");
	yield* Scope.close(scope, Exit.succeed("Closed"));
});

// Effect.runSync(one);

const two = Effect.gen(function*() {
	yield* Effect.addFinalizer(() => Console.log("Last!"));
	yield* Console.log("First!");
});

const three = Effect.scoped(two)
// Effect.runSync(three);

const four = Effect.gen(function*() {
	yield* pipe(
		Effect.addFinalizer(() => Console.log("Last!")),
		Effect.scoped
	);
	yield* Console.log("First!");
});
// Effect.runSync(four);

// How to create scoped resources (there's many ways): acquire and release

import fs from "fs/promises";

const acquire = Effect.tryPromise({
	try: () => fs.open("src/dummy.txt", "r"),
	catch: (e) => Error("Failed to open file")
}).pipe(Effect.zipLeft(Console.log("File opened")));

const release = (file: fs.FileHandle) =>
	Effect.promise(() => file.close()).pipe(
		Effect.zipLeft(Console.log("File closed"))
	);

// file: Effect.Effect<fs.FileHandle, Error, Scope.Scope>
const file = Effect.acquireRelease(acquire, release)
// success with a file and requires a scope that determines boundaries

const useFile = (file: fs.FileHandle) => Console.log(`Using file: ${file.fd}`);

const program = file.pipe(
	Effect.flatMap((file) => useFile(file)),
	Effect.scoped
);

const program2 = Effect.acquireUseRelease(acquire, useFile, release);

Effect.runPromise(program2);

// console.log("\n\n====================")
const program3 = Effect.gen(function*() {
	const handle = yield* file;
	yield* Console.log("Using file");
	yield* pipe(
		Effect.tryPromise(() => handle.readFile()),
		Effect.andThen((buf) => Console.log(buf.toString())),
	);
}).pipe(Effect.scoped);

await Effect.runPromise(program3);
console.log("====================\n\n")
