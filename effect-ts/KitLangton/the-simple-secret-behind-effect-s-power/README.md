================================================================================
The Simple Secret Behind Effect’s Power
https://www.youtube.com/watch?v=F5aWLtEdNjE&list=PLicC_uGS5eIKAafTPrFvYqxK1Axv-PK9R&index=3
================================================================================

2 Effect's barrier of adoption
1. Perceived Complexity (COST) - TOO HIGH
2. Value Proposition (BENEFIT) - TOO CONFUSING (TOO LOW)

================================================================================
Building a simplified, pedagogical, replica of effect

thunk effect
alias for a function of no arguments

```index.ts
// THUNK EFFECT
// alias for a function of no arguments
// "nullery function"
// we have simply trapped some result behind a function arrow
type Thunk<A> = () => A

const randomNumber: number = Math.random()
console.log(`randomNumber 1: ${randomNumber}`)
console.log(`randomNumber 2: ${randomNumber}`)
console.log(`randomNumber 3: ${randomNumber}`)
// outputs:
// ```
// randomNumber 1: 0.4331857228455501
// randomNumber 2: 0.4331857228455501
// randomNumber 3: 0.4331857228455501
// ```
// nothing surprising, we've been thought programs execute from top to bottom
// and variable stores a value, here we're simply re-using the same value


// Effect: Blueprint, Recipe, Workflow, Description, Program as Value
const randomNumberThunk: () => number = () => Math.random()
console.log(`randomNumberThunk 1: ${randomNumberThunk()}`)
console.log(`randomNumberThunk 2: ${randomNumberThunk()}`)
console.log(`randomNumberThunk 3: ${randomNumberThunk()}`)
// now, instead of `Math.random()` being executed once, it is stored inside a
// function that is executed on an ad hoc basis whenever we call that function
// thusly.
// outputs:
// ```
// randomNumberThunk 1: 0.20557259542245288
// randomNumberThunk 2: 0.5790158473907758
// randomNumberThunk 3: 0.4579677849011189
// ```
// not surprisingly, each time we call `randomNumberThunk()` we're calling 
// `Math.random()` once again.
```

================================================================================

## Repeatability
```index.ts
type Effect<A> = () => A

const randomNumberEffect: () => number = () => Math.random()
const run = <A>(effect: Effect<A>) => console.log(effect())

// WHAT POWERS EFFECT GIVE US?
// REPEATABILITY
// randomNumberEffect()
// randomNumberEffect()
// randomNumberEffect()
// randomNumberEffect()

// but it's not very fun to that by hand
// let's implement a higher level combinator 'repeat'

// 1. Type 'undefined[]' is not assignable to type 'Effect<A[]>'.
//    Type 'undefined[]' provides no match for the signature '(): A[]'. [2322]
// const repeat = <A>(effect: Effect<A>, count: number): Effect<A[]> => {
// 	return []
// }
// WE NEED TO THUNKPHY
const repeat = <A>(effect: Effect<A>, count: number): Effect<A[]> =>
	() => {
		const results = []

		for (let i = 0; i < count; i++) {
			results.push(effect())
		}

		return results
	}

run(repeat(randomNumberEffect, 10))
// outputs
// ```
// [ 0.5307582043523829, 0.1623425018409309, 0.15713623475943705,
// 	   0.07276190087362122, 0.5066463773113321, 0.3756791367789193,
// 	   0.7824030973277385, 0.40986492511824213, 0.006822534359279708,
// 	   0.40909502287375765 ]
// ```

// THIS IS THE KEY DIFFERENCE OF EFFECT SYSTEMS
// operations on effects always wrap their results back up of another thunk.
// this makes the entire thing compose elegantly.
// it remains suspended. it remains a description.
//
// nothing happens until you finally, at the end of the world, run your effect.
```
================================================================================
## RETRYABILITY
```index.ts
type Effect<A> = () => A

const run = <A>(effect: Effect<A>) => console.log(effect())

const failingEffect: Effect<number> = () => {
	const x = Math.random()
	if (x < 0.7) {
		console.log(`OPPS: ${x}`)
		throw new Error("KABOOM")
	}
	return x
}

const retry = <A>(effect: Effect<A>, maxAttempts: number): Effect<A> =>
	() => {
		let remainingAttempts = maxAttempts
		while (true) {
			try {
				return effect()
			} catch (err) {
				remainingAttempts -= 1
				if (remainingAttempts === 0) {
					throw err
				}
			}
		}
	}

const eventually = <A>(effect: Effect<A>): Effect<A> =>
	() => {
		while (true) {
			try {
				return effect()
			} catch (err) {
			}
		}
	}

// run(eventually(failingEffect))
// run(retry(failingEffect, 5))
```
================================================================================
## AROUNDABILITY / INSTRUMENTABILITY / DECORABILITY
> thunk() => { before... thunk... after... }
```index.ts
const timed = <A>(effect: Effect<A>): Effect<[duration: number, result: A]> =>
	() => {
		const start = Date.now()
		const result = effect()
		const end = Date.now()
		const duration = end - start
		return [duration, result]
	}

const timedFailure = timed(eventually(failingEffect))
run(timedFailure)
```
