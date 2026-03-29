huge thanks to Kit Langton, it is amazing - https://www.effect.institute/

- [x] Introduction to Effect
- [x] Effect Basics

```typescript
async function checkout(cartId: string): Promise<Order> {
    const cart = await getCart(cartId);
    const payment = await charge(cart);
    const shipment = await ship(payment);
    return shipment
}
```

```typescript
async function checkout(cartId: string): Promise<Order> {
    try {
        const cart = await getCart(cartId);
    } catch (e: unknown) {
        if (e instanceof CartNotFoundError) { /* 404 */ }
        else if (e instanceof NetworkTimeoutError) { /* retry */ }
        else if (e instanceof RateLimitError) { /* wait */ }
        else { throw e }
    }
    const payment = await charge(cart);
    const shipment = await ship(payment);
    return shipment
}
```

```typescript
async function checkout(cartId: string): Promise<Order> {
    try {
        const cart = await getCart(cartId);
    } catch (e: unknown) {
        // becomes dead code, because getCart will never throw InvalidCartError
        if (e instanceof InvalidCartError) { return [] }
        else { throw e }
    }
}

async function getCart(id: string): Promise<Cart> {
    // if a new error case is added and the catch block on checkout() isn't updated, well...
    if (id.length < 5) throw new BadIdError()
    try {
        const data = await fetchCart(id);
        return parseCart(data)
    } catch (e: unknown) {
        // will break because not throwing InvalidCartError anymore
        if (e instanceof InvalidCartError) return Cart.empty
        throw e
    }
}
```

# TYPED ERRORS - FAILING UP
```ts
// Promise version
async function slowDie(): Promise<number> {
    const n = Math.ceil(Math.random() * 6)
    await sleep(1000)
    if (n === 4) throw new VeryBadRoll()
    return n
}

// Effect version
const slowDie: Effect.Effect<number> =
    Effect.gen(function* () {
        const n = yield* Random.nextIntBetween(1, 7)
        yield* Effect.sleep("1 second")
        // result in type error -> VeryBadRoll is not a assignable to never
        if (n === 4) yield* Effect.fail(new VeryBadRoll())
        return n
    })

// Effect correct version
const slowDie: Effect.Effect<number, VeryBadRoll> =
    Effect.gen(function* () {
        const n = yield* Random.nextIntBetween(1, 7)
        yield* Effect.sleep("1 second")
        // result in type error -> VeryBadRoll is not a assignable to never
        if (n === 4) yield* Effect.fail(new VeryBadRoll())
        return n
    })
```

```ts
// add if n is 6 yield TooHigh
const slowDie: Effect.Effect<number, VeryBadRoll | TooHigh> =
    Effect.gen(function* () {
        const n = yield* Random.nextIntBetween(1, 7)
        yield* Effect.sleep("1 second")
        // result in type error -> VeryBadRoll is not a assignable to never
        if (n === 4) yield* Effect.fail(new VeryBadRoll())
        if (n === 6) yield* Effect.fail(new TooHigh())
        return n
    })
```

How react deals with failure
```ts
// safeDie will wrap slowDie and recovers from its errors
const safeDie: Effect.Effect<number, VeryBadRoll | TooHigh> =
    slowDie.pipe(
        // catchAll passing a function to handle
        Effect.catchAll((e: VeryBadRoll | TooHigh) => ???)
    )

// becomes never because Effect.succeed(0)
const safeDie: Effect.Effect<number> =
    slowDie.pipe(
        // catchAll passing a function to handle
        Effect.catchAll(() => Effect.succeed(0))
    )
```

Deal with errors one by one
```ts
// our error type narrows, because VeryBadRoll is dealt with
const safeDie: Effect.Effect<number, TooHigh> =
    slowDie.pipe(
        Effect.catchTag("VeryBadRoll", () => Effect.succeed(-9000))
    )

const safeDie: Effect.Effect<number> =
    slowDie.pipe(
        Effect.catchTag("VeryBadRoll", () => Effect.succeed(-9000))
        Effect.catchTag("TooHigh", () => Effect.succeed(0))
    )
```

Concurrency
```ts
async function getStockAdvice(ticker: string): Promise<Order> {
    // Promise.all fire all requests in parallel
    const [tree, start, beetle] = await Promise.all([
        ask("tree", ticker)
        ask("Zubenelgenubi", ticker)
        ask("dung beetle", ticker)
    ])
    return { tree, start, beetle }
}

function ask(role: string, ticker: string) {
    return generateText({
        model: anthropic('claude-opus-4-5'),
        system: `You are a ${role}. Give stock advice.`,
        prompt: ticker,
    })
}

// if ask("Zubenelgenubi", ticker) implodes, tree and dung beetle keep churning, draining the already parched coffers for nothing

// Promise-strewn code is prone to leakage once created they run till completion, wheter or not they're still required
```

To fix aborting
```ts
async function getStockAdvice(ticker: string): Promise<Order> {
    const controller = new AbortController();

    try {
        const [tree, start, beetle] = await Promise.all([
            ask("tree", ticker, controller.signal)
            ask("Zubenelgenubi", ticker, controller.signal)
            ask("dung beetle", ticker, controller.signal)
        ])
        return { tree, start, beetle }
    } catch (e) {
        controller.abort()
        throw e
    }
}

function ask(role: string, ticker: string, signal: AbortSignal) {
    return generateText({
        model: anthropic('claude-opus-4-5'),
        system: `You are a ${role}. Give stock advice.`,
        prompt: ticker,
        abortSignal: signal
    })
}
```

Effect
```ts
const ask = (role: string, ticker: string) =>
    LanguageModel.generateText({
        system: `You are a ${role}. Give stock advice.`,
        prompt: ticker
    })

const getStockAdvice = Effect.fn(function* (ticker: string) {
    const [tree, star, beetle] = yield* Effect.all([
        ask("tree", ticker)
        ask("Zubenelgenubi", ticker)
        ask("dung beetle", ticker)
    ], { concurrency: "unbounded" })
    return { tree, star, beetle }
})
```

================================================================================

An effect is a blueprint, an inert description of a computation. To run an Effect, one must do so explicitly.

Just like a function: only runs when called. (Lazyness)

**Effect** has three parameters.
- Effect<Success, Error, Requirements>
    - ex: Effect<User, NotFound, Database>

```ts
import { Effect } from "effect"

// Succeeds with a string
// Never fail (don't need to specify)
// No requirements (don't need to specify)
// <string, never, never>
const magicWord: Effect.Effect<string> = Effect.succeed("pismire") // pismire: an ant

// We need to run it, let's see an async example
const magicWord: Effect.Effect<string> = Effect.succeed("pismire").pipe(Effect.delay("3 seconds"))
const value: Promise<string> = Effect.runPromise(asyncWord)

// What good is success without the failure of others?
// Effect.fail always fail with the given value
const boom: Effect.Effect<never, string> = Effect.fail("too chonky")
Effect.runSync(boom)
```

`succeed` and `fail` with a value
```ts
class DivisionByZero extends Error { }

const safeDivide: Effect.Effect<number, DivisionByZero> =
    (numerator: number, denominator: number) => {
        if (y === 0) {
            return Effect.fail(new DivisionByZero())
        }
        return Effect.succeed(numerator / denominator)
    }
```

```ts
// thunk
const getDate = Effect.sync(() => {
    console.log("I'M TRAPPED IN A THUNK!")
    return new Data()
})

const now = await Effect.runPromise(getDate)
```

> Effect's laziness isn't magic. It's inherited from the functions it wraps.

Difference between `Effect.succeed` and `Effect.sync`

With `succeed`, the value is captured when the effect is created.
`const getDate = Effect.succeed(new Date())` will return the same data forever

With `sync` the computation is suspended within a thunk.
`const getDate = Effect.sync(() => new Date())` will calculate a `new Date()` every time it is ran

# Composing Effects

```ts
const sensorData = () =>
    fetch('/api/sensors').then(r => r.json())

const biometrics = () =>
    fetch('/api/biometrics').then(r => r.json())

const analyze = () =>
    fetch('/api/analyze', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json())

const program = async () => {
    const { mSv } = await sensorData()
    const { pulse } = await biometrics()
    await analyze({ mSv, pulse })
}

await program()

// This results in calling `program()` calling and waiting one function at a time
```
Let's turn into Effect
```ts
const sensorData = Effect.promise(() =>
    fetch('/api/sensors').then(r => r.json())
)

const biometrics = Effect.promise(() =>
    fetch('/api/biometrics').then(r => r.json())
)

const analyze = Effect.promise(() =>
    fetch('/api/analyze', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json())
)

const program = Effect.gen(function* () {
    const { mSv } = yield* sensorData()
    const { pulse } = yield* biometrics()
    yield* analyze({ mSv, pulse })
})

await program()

// When ran it stills end up calling and waiting one function at a time
```
Another example
```ts
const askName: Effect.Effect<string> = ...
const askAge: Effect.Effect<string> = ...

const getUser: Effect.Effect<{ name: string; age: number}> = Effect.gen(function* () {
    const name = yield* askName
    const age = yield* askAge
    return { name, age }
})
```

`Effect.gen(function*` is equivalent to `async function`
`yield*` is equivalent to `await`
SEMANTICALLY!

The effect version is way better
```ts
const askName: Effect.Effect<string> = ...
const askAge: Effect.Effect<string, BadNumber | NoSams> = ...

const getUser: Effect.Effect<{ name: string; age: number}, BadNumber | NoSams> = Effect.gen(function* () {
    const name = yield* askName
    const age = yield* askAge
    return { name, age }
})

// Now we have three pathways

// 1. askName fails, resulting in getUser returning NoSams
// 2. askName succeeds but askAge fails, resulting in getUser returning BadNumber
// 3. both succeed, returning the {name, age}, hooray.
```

================================================================================

You are an Effect TypeScript setup guide. Your job is to help the user configure this repository to work brilliantly with Effect.

## **Tools**

- **Todo list**: If available, use it to track progress. Create checklist at start, update as you complete steps. If no todo tool: show markdown checklist ONCE at start.
- **AskUserQuestion**: If available (Claude agents have this), use for multiple choice questions: package manager, project type, etc.

**Confirmations:** Ask before initializing a project, installing packages, modifying tsconfig, or creating/modifying agent files.

## **Before Starting**

1. Introduce yourself as their Effect setup guide
2. Assess repository with a single command:
   ```bash
   ls -la package.json tsconfig.json bun.lock pnpm-lock.yaml package-lock.json .vscode AGENTS.md CLAUDE.md .claude .cursorrules 2>/dev/null; file AGENTS.md CLAUDE.md 2>/dev/null | grep -i link
   ```
   This finds all relevant files and detects symlinks. From lock file, determine package manager (bun/pnpm/npm). If multiple lock files, ask which to use. If none, ask preference.
3. Check Effect Solutions CLI: run `effect-solutions list`. If missing, install (using package name `effect-solutions`). If output shows update available, update before continuing.
4. Create todo list (if you have the tool)

**Checklist:**
- [ ] Initialize project (if needed)
- [ ] Install Effect dependencies
- [ ] Effect Language Service setup
- [ ] TypeScript compiler configuration
- [ ] Package scripts
- [ ] Agent instruction files
- [ ] Set up Effect source reference
- [ ] Summary

---

## Initialize Project (if needed)

**Only if `package.json` doesn't exist:**
- Read: `effect-solutions show project-setup`
- Follow initialization guidance
- Run: `[bun/pnpm/npm] init`

---

## Install Effect Dependencies

- Check if Effect is already in dependencies
- Determine packages based on project type:
  - Always: `effect`
  - CLI apps: `@effect/cli`
  - HTTP servers/clients: `@effect/platform`
- Schema lives in `effect/Schema`; do not install `@effect/schema` (deprecated since Effect 3.10)
- Run: `[bun/pnpm/npm] add effect [...]`
- **Don't specify version** - use latest

---

## Effect Language Service Setup

This adds compile-time diagnostics for Effect: catches pipeline errors, validates service requirements.

- Read: `effect-solutions show project-setup`
- Follow setup instructions: install package, configure tsconfig plugin, add prepare script, run patch

**VS Code/Cursor Settings:**
- If `.vscode` exists: set up settings automatically
- If not: ask if they use VS Code or Cursor, then create settings

---

## TypeScript Compiler Configuration

This configures compiler options (separate from the language service plugin above).

- Read: `effect-solutions show tsconfig`
- Compare recommended settings with existing `tsconfig.json`
- Apply recommended settings

---

## Package Scripts

Check if `package.json` already has a typecheck script (e.g., `typecheck`, `check`, `type-check`). If not, add one for CLI type checking (CI, git hooks, etc.):

- Simple projects: `"typecheck": "tsc --noEmit"`
- Monorepos with project references: `"typecheck": "tsc --build --noEmit"`

---

## Agent Instruction Files

These tell AI assistants about project tools.

- Assess existing files:
  - Both `CLAUDE.md` and `AGENTS.md` (not symlinked): update both
  - One exists: update it, optionally create symlinked alternative
  - Neither: create `CLAUDE.md` and symlink `AGENTS.md` to it
  - One is symlink: update main file
- Insert between `<!-- effect-solutions:start -->` and `<!-- effect-solutions:end -->`:

```markdown
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `~/.local/share/effect-solutions/effect` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
```

---

## Set Up Effect Source Reference

Clone the Effect v4 source repository to a shared location so AI agents can search real implementations:

```bash
git clone --depth 1 https://github.com/Effect-TS/effect-smol.git ~/.local/share/effect-solutions/effect
```

If the directory already exists, pull the latest changes:

```bash
git -C ~/.local/share/effect-solutions/effect pull --depth 1
```

**Why this matters:** AI agents can search `~/.local/share/effect-solutions/effect` for real Effect implementations, type definitions, and patterns when documentation isn't enough. Using a shared location avoids re-cloning per project.

---

## Summary

Provide summary:
- Package manager
- Steps completed vs skipped (with reasons)
- Files created/modified
- Any errors encountered and how they were resolved

Offer to help explore Effect Solutions topics or start working with Effect patterns.
