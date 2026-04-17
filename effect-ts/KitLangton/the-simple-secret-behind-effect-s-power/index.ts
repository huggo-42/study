type Effect<A> = () => A

const run = <A>(effect: Effect<A>): A => {
	const result = effect()
	console.log(effect())
	return result
}

const failingEffect: Effect<number> = () => {
	const x = Math.random()
	if (x < 0.99999) {
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


// AROUNDABILITY / INSTRUMENTABILITY / DECORABILITY
// thunk() => { before... thunk... after... }

const timed = <A>(effect: Effect<A>): Effect<[duration: number, result: A]> =>
	() => {
		const start = Date.now()
		const result = effect()
		const end = Date.now()
		const duration = end - start
		return [duration, result]
	}

const timedFailure = timed(eventually(failingEffect))
// const result = run(timedFailure)
// console.log(result)

// =============================================================================

const log = (message: string): Effect<void> =>
	() => {
		console.log(message)
	}

// COMPOSITION COMBINATORS
// we need to write our own combinators
const andThen = <A, B>(effect: Effect<A>, f: (value: A) => Effect<B>): Effect<B> =>
	() => {
		const a = effect()
		const effectB = f(a)
		return effectB()
	}

const composed = andThen(
	timedFailure,
	([duration, result]) => log(`DURATION: ${duration} and RESULT: ${result}`)
)
// run(composed)

const composedGen = gen(function*() {
	const [duration, result] = yield timed(eventually(failingEffect))
	yield log(`DURATION: ${duration} and RESULT: ${result}`)
	return "YAY"
})
