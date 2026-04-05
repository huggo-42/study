import { Effect, Context, Layer, pipe } from "effect"
import * as fs from "node:fs/promises"

// =============================================================================
// Answered while on break: how to deal with extensive pipelines?
// we can use `flow`
// const double = (x: number) => x * 2;
// const toString = (x: number) => x.toString();
// const toUpperCase = (x: string) => x.toUpperCase(); 
// const handleTransformations = flow(double, toString, toUpperCase);
// check docs for another interesting approaches! `.Do`
// =============================================================================

// Services are requirements that an effect requires to run
// They're defined by their type signature
// When we 'use' a service in an effect, we do so independently of the service's implementation
// Then we can 'provide' the service to 'resolve' that dependency and run

interface RandomImpl {
	readonly next: Effect.Effect<number>;
	readonly nextIntBetween: (min: number, max: number) => Effect.Effect<number>;
}

class Random extends Context.Tag("Random")<Random, RandomImpl>() { }

const program = Effect.gen(function*() {
	const random = yield* Random;
	const n = yield* random.nextIntBetween(1, 10);
	if (n < 5) {
		return "Low";
	} else {
		return "High";
	}
});

const RandomLive: RandomImpl = {
	next: Effect.sync(() => Math.random()),
	nextIntBetween: (min, max) =>
		Effect.sync(() => Math.floor(Math.random() * (max - min + 1) + min))
};

const runnable = program.pipe(Effect.provideService(Random, RandomLive))

// console.log(Effect.runSync(runnable))

// Layer<ROut, E, RIN>
// ROut: what services that layer create
const makeRandom = Effect.sync(() => Math.random()).pipe(
	Effect.map(() => ({
		next: Effect.sync(() => Math.random()),
		nextIntBetween: (min: number, max: number) =>
			Effect.sync(() => Math.floor(Math.random() * (max - min + 1) + min))
	}))
);

const randomLayer = Layer.effect(Random, makeRandom)

const runnable2 = program.pipe(Effect.provide(randomLayer))

// Layers can require things too!
class FeatureFlags extends Context.Tag("FeatureFlags")<
	FeatureFlags,
	{
		readonly isEnabled: (flag: string) => Effect.Effect<boolean>
	}
>() { }

class ConfigFile extends Context.Tag("ConfigFile")<
	ConfigFile,
	{
		readonly contents: Record<string, boolean>
	}
>() { }

const FeatureFlagsLive = Layer.effect(
	FeatureFlags,
	pipe(
		ConfigFile,
		Effect.map((config) => ({
			isEnabled: (flag: string) =>
				Effect.sync(() => config.contents[flag] ?? false)
		}))
	)
)

const ConfigFileLive = Layer.effect(
	ConfigFile,
	Effect.gen(function*() {
		const contents = yield* Effect.tryPromise({
			try: () => fs.readFile("config.json", "utf-8"),
			catch: (e) => Error("Could not read config file")
		})
		const parsed = yield* Effect.try({
			try: () => JSON.parse(contents),
			catch: (e) => Error("Could not parse config file")
		})
		return { contents: parsed };
	})
)

declare const main: Effect.Effect<string, never, FeatureFlags>;

const finalLayer = Layer.provide(FeatureFlagsLive, ConfigFileLive);

pipe(main, Effect.provide(finalLayer), Effect.runPromise)

class Foo extends Context.Tag("Foo")<Foo, { readonly foo: string }>() {
	static readonly live = Layer.effect(
		Foo,
		Effect.succeed({
			foo: "foo",
		})
	);
}

const programThatUsesFoo = Effect.gen(function*() {
	const foo = yield* Foo;
	return foo.foo;
})

const runnableProgramThatUsesFoo = programThatUsesFoo.pipe(Effect.provide(Foo.live))

// Deriving the type of a service
// Effect.Effect.Success pulls the success type of an Effect, in this case makeService
const makeService = Effect.succeed({ foo: "foo" });
class Foo2 extends Context.Tag("hello-effect/context-management/Foo2")<
	Foo2,
	Effect.Effect.Success<typeof makeService>
>() {
	static readonly Live = Layer.effect(Foo2, makeService);
}

// Effect memoise services across multiples layers
// meaning, if a service is used multiple times along an application, Effect
// caches the result
//
// in the entire dependecy tree, if a service appears multiple times, it will
// be created only once
//
// There's `Layer.fresh(service)` that always re-create
//
// There's `Layer.memoize(service)` to manually memoize


