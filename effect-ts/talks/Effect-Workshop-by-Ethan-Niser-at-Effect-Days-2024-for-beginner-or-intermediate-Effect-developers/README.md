# Effect TypeScript Library: Beginner / Intermediate Workshop (Effect Days 2024)
> https://www.youtube.com/watch?v=Lz2J1NBnHK4

## Running Effects
- `runSync` for synchronous effects
- `runPromise` for asynchronous effects
- `runSyncExit` / `runPromiseExit` for getting the error as a value, instead of 
thrown

We should run effects only on the EDGES of the program.
The entire program should be ONE Effect.
> unless when working with other effect libraries

## Pipelines
When we pipe things we're giving a value and a list of functions
```ts
import { pipe } from "effect";

const program = () => pipe(getDate(), double, toString, toUpperCase)
```

## Combinators
- `map`: transform the value of an effect
- `flatMap`: transformt the value of an effect into another effect
- `tap`: perform a side effect without changing the value
- `all`: merge multiple effects into a single effect

## Error handling
- `catchAll`: recover from all errors
- `catchTag`: recover from a specific error
- `mapError`: transform the error of an effect
- `match`: handle both cases
- `either`: move the error into the success channel

## Context management
- `Services` are funcionality whos types signature is seperate from the 
implementation
- `Context.Tag` created a placeholder for a service that can be used in an 
effect as if it were the real thing
- `provideService(Tag, implementation)` provides the service to the effect
- `Layers` are programs that create services and run before effects that require 
them
- `provide(Tag, layer)` provides the layer to the effect

## Resource Management
- A `Scope` contains `finalizers` that are run when the scope is closed
- When an Effect requires a `Scope` service it means: "I have some resources 
that need to be cleaned up at some point"
- Providing the `Scope` indicates where the scope should be closed
- `acquireRelease`: a helper for creating scoped resources

## Content we didn't get to go through
for each project
- there's a `changes.md` that explains the path taken
- on `project/` there's the initial version of the code and more ideas to 
implement

## Schema
- it describes two way transformations

## Concurrency and Fibers
### Structured Concurrency
- Fibers have a parent-child relationship, and when a parent fiber complets or
is interrupted, it will interrupt all of its child, and so on
- `Scope`, when a Fiber is, let's say, interrupted, Effect run all finalizers

## Performance
- Obviously Effect has some overhead
- Effect is made for application code, where the limitation is almost always IO
anyway
- Effect actually will likely improve the performance of these parts of your
code because of its powerful concurrency primitives (structured concurrency,
interruption, worker pool abstractions
- If you're writing CPU bound code, you could not use Effect and provide a
effect wrapper, or maybe you shouldn't be using javascript at all


# Thanks for coming!
- Slides and code on github
- PLEASE! Do try the 'after the workshop' additional exercises

