import { Console, Effect, pipe, Scope } from "effect";
import { Exit } from "effect/Schema";

// ================================ Exercise 1 =================================
// Write an scope that models the acquisition and realease of this mock file
// it should match the existing declaration

class MockFile {
	constructor(public readonly fd: number) { }
	static readonly open = (fd: number) =>
		pipe(
			// T.logTest(`open ${fd}`),
			Console.log(`close ${fd}`),
			Effect.andThen(() => new MockFile(fd)),
		);
	// public close = Effect.suspend(() => T.logTest(`close ${this.fd}`));
	public close = Effect.suspend(() => Console.log(`close ${this.fd}`));
};

// write this function file
// declare const file: (fd: number) => Effect.Effect<MockFile, never, Scope.Scope>;


const file = (fd: number) =>
	Effect.acquireRelease(MockFile.open(fd), (file) => file.close);

// this is trying to do the above manually, but there's problems with it
// const file2 = Effect.gen(function*() {
// 	const file = yield* MockFile.open(1);
// 	yield* Effect.addFinalizer(() => file.close);
// 	return file
// });

/*
 * in the first solution
 * const file = (fd: number) =>
 *     Effect.acquireRelease(MockFile.open(fd), (file) => file.close);
 *
 * The `MockFile.open(fd)` will run uninterruptable. If that was an asynchronous
 * operation, now opening a file is probable synchronous and pretty fast, so
 * you wouldn't get interrupted in between
 *
 * But, generraly speaking, when you're acquiring resources you want the
 * acquisition to be non-interruptible
 *
 * the `acquireRelease()` runs both the acquisition and finalization in
 * non-interruptible regions, so they cannot be interrupted
 *
 * -------------------------------------
 *
 * in the second solution
 * const file2 = Effect.gen(function*() {
 * 	   const file = yield* MockFile.open(1);
 * 	   yield* Effect.addFinalizer(() => file.close);
 * 	   return file
 * });
 *
 * if you interrupt it while opening the file you may risk of leaking open
 * handle or stuff like that, so it's a little more tedious if you want to do
 * it manually in a non-interruptible way
 */

// Preventing scopes from merging
// const test2 = Effect.gen(function*() {
// 	const scope1 = yield* Scope.make();
// 	const scope2 = yield* Scope.make();
//
// 	const file1 = pipe(file(1), Scope.extend(scope1));
// 	const file2 = pipe(file(2), Scope.extend(scope2));
//
// 	yield* Scope.close(scope1, Exit.unit);
// 	yield* Console.log("hi!");
// 	yield* Scope.close(scope2, Exit.unit);
// })

// -----------------------------------------------------------------------------
