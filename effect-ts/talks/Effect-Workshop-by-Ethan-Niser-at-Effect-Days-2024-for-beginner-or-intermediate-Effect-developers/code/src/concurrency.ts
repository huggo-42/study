import { Console, Effect, Fiber, pipe, Schedule } from "effect";

/*
 * Concurrency and Fibers
 */

const normalJS = () => {
	let i = 0;
	setInterval(() => console.log("i", i), 250);
	while (true) {
		i++;
	};
}
// normalJS()
/*
 * when you run this code nothing gets logged out, why?
 *
 * the event loop is blocked
 * the `while(true)` keeps the main thread spinning
 */

const effect = Effect.gen(function*() {
	let i = 0;
	yield* pipe(
		Effect.suspend(() => Console.log("i", i)),
		Effect.repeat(Schedule.spaced(250)),
		Effect.fork
	);

	while (true) {
		yield* Effect.sync(() => i++);
	}
})

// Effect.runPromise(effect)

/*
 * now it works:
```console
$ bun run src/concurrency.ts
i 2044
i 4175877
i 8353788
i 12531699
```
 */

// Cooperative Multitasking
// - is how javascript's event loop works
// - the main thread must first yield control before other tasks can run
//     - let's say we have two concurrent tasks:
//         - Cooperative means one task has to cooperate, it has to kind of
//         give up. It has to either stop or it has to say "I'm done for now,
//         do something else"
//     - in javascript a task can end in two ways:
//         - the stack can clear, so what's currently running can finish, or
//         - we can call await, await is going to yield
// - whether that's the stack being empty, or awaiting a promise
// - tasks are litterally just a callback in a queue
// 
// Preemptive Multitasking
// - this is how operating systems work
//     - instead of giving up control themselves there's something external
//     controlling what to run and when
// - tasks run as if they are the only thing running
// - a scheduler decides when to pause a task and run another
// - tasks can be paused and resumed at any time
// - tasks are thread-like things with their own stack

// Effect's Fiber Model
// - Fibers (or green threads) are a lightweight in memory thread
// - Fibers can be spawned in the thousands without issues
// - If an Effect is a description of a program, a Fiber is a running instance
// of that program
// - Fibers can be paused, restarted, 'awaited' to get their result, or
// interrupted to cancel them
// - Abstracts away sync vs async (to the fiber, everything is sync!)

// How is this possible?:wa
// - Your os technically can't even stop your cpu, it has to wait for a syscall
// or an interrupt
// - Same with javascript, there is no way to stop the main thread from whatever
// it is doing
// - But, what if we broke our program down into little, lazy steps
// Then we could 'pause' execution, by simply not executing the next step

const program = pipe(
	Effect.succeed(42),
	Effect.map((n) => n + 1)
)

// this blocks the runtime
const bad = Effect.sync(() => {
	let i = 0;
	// with the following code, there's nothing Effect can do
	while (i < 100000) {
		i++;
	}
	console.log("done");
})

// **DONT BLOCK THE EXECUTOR!**
// (if you don't have to)

// example on javascript's singlethreaded life
// if you have an async webserver, and you do a read file sync the entire
// webserver is blocked for the whole duration of that synchronous call

// we have 100.000 opportunities for the effect runtime to come in and say stop
const better = Effect.gen(function*() {
	let i = 0;
	while (i < 100000) {
		// this will yield 100.000 times
		yield* Effect.sync(() => console.log(i++));
	}
	console.log("done");
})
// Effect.runPromise(better)

// -----------------------------------------------------------------------------
// How to we spawn new Fibers? fork

// `Effect.fork` spawns a new Fiber and run the given effect in that fiber
// it returns a handle to that fiber
const fiber1 = Effect.gen(function*() {
	const fiber = yield* Effect.fork(Effect.never);
	console.log(fiber.id());
})

const fiber2 = Effect.gen(function*() {
	const fiber = yield* Effect.fork(Effect.succeed(42));

	// result: Exit<never, never>
	// every time a Fiber completes, there's an `Exit` value
	const result = yield* Fiber.await(fiber);
	console.log(result);
})

const fiber3 = Effect.gen(function*() {
	const fiber = yield* Effect.fork(Effect.succeed(42));

	// if we `Fiber.join(fiber)` we get just the value
	// result: number
	const result = yield* Fiber.join(fiber);
	console.log(result)
})

const fiber4 = Effect.gen(function*() {
	let i = 0;
	yield* pipe(
		Effect.suspend(() => Console.log("i", i)),
		Effect.repeat(Schedule.spaced(250)),
		Effect.fork
	);

	return yield* pipe(
		Effect.sync(() => i++),
		Effect.forever
	);
})

// this is not going to log anything
// the reason a key concept in the effect concurrency model, which is
//
// Structured Concurrency
// Every Fiber has this parent-child relationship
// We have a Fiber1
// When we spawn a fiber, we spawn it as a child of Fiber1
// (always a child of the current fiber)
// No child can live longer than it's parent Fiber
const fiber5 = Effect.gen(function*() {
	let i = 0;
	yield* pipe(
		Effect.suspend(() => Console.log("i", i)),
		Effect.repeat(Schedule.spaced(250)),
		// create another fiber
		Effect.fork
	);

	i = 100;
	// the program ends here, so the child fiber dies
})

Effect.runPromise(fiber5);

