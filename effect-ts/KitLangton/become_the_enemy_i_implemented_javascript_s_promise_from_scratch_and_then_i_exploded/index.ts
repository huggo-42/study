import { readFile } from "node:fs" // async version of `readFileSync`

// console.log("HERE WE GO")
// readFile("thoth.md", "utf8", (_, book) => {
// 	console.log(`CONSEQUENCE FREE POWER\n${book}`)
// })
// console.log("FILE OVER!")
// MAIN THREAD = [ t1, t2, t3, t4 ]
// MAIN THREAD = t1 [ t2, t3, t4 ]
// instead of waiting for t1 to completion, adds to HOST and continue popping
// HOST = [ readFile("thoth.md"), ... ]
//
// main thread can go through other tasks while readFile is being processed
// somewhere else
// MAIN THREAD = t3 [ t4 ]
// HOST = [ readFile("thoth.md"), ... ]
//
// once `readFile("thoth.md")` is complete, that worker thread will be released
// to do some other work, and our callback will be enqueued to our task queue
// MAIN THREAD = t3 [ t4, cb() ]
// HOST = [ ]

/*
console.log("HERE WE GO")
readFile("thoth.md", "utf8", (_, book) => {
	console.log(`CONSEQUENCE FREE POWER\n${book}`)
})
console.log("FILE OVER!")
*/
// outputs
/*
HERE WE GO
FILE OVER!
CONSEQUENCE FREE POWER
<< file contents >>
 */
// note that "FILE OVER!" is logged first!
// that's because the main thread proccessed other tasks from the queue while
// `readFile` was running
// and when `readFile` finished, the callback was added to the queue to be ran

/*
console.log("HERE WE GO")
readFile("thoth.md", "utf8", (_, thoth) => {
	console.log("READ THOTH")

	readFile("everybody-poops.md", "utf8", (_, poops) => {
		console.log("READ POOPS")
		gzip(`${thoth}\n\n${poops}`, (_, compressed) => {
			console.log("COMPRESSED")
			writeFile("thoth-poops.gz", compressed, () => {
				console.log("AS IT IS WRITTEN")
			})
		})
	})
})
console.log("FILE OVER!")
*/

// the program is HADUKENIZED
// this is callback hell
// the code grows to the right

console.log("HERE WE GO")
// readFile("thoth.md", "utf8", (_, thoth) => {
// 	console.log("READ THOTH")
//
// 	readFile("everybody-poops.md", "utf8", (_, poops) => {
// 		console.log("READ POOPS")
// 		gzip(`${thoth}\n\n${poops}`, (_, compressed) => {
// 			console.log("COMPRESSED")
// 			writeFile("thoth-poops.gz", compressed, () => {
// 				console.log("AS IT IS WRITTEN")
// 			})
// 		})
// 	})
// })

type State<A> =
	| {
		_tag: "pending",
		callbacks: Array<(value: A) => void>
	}
	| {
		_tag: "resolved",
		value: A
	}

class Eventual<A> {
	private state: State<A> = { _tag: "pending", callbacks: [] }

	// new Eventual<string>((resolve) => resolve("VALUE"))
	constructor(make: (resolve: (value: A) => void) => void) {
		make(this.resolve.bind(this))
	}

	then<B>(callback: (value: A) => B | Eventual<B>): Eventual<B> {
		return new Eventual<B>((resolve) => {
			// callback: (A) => B
			// resolve:  (B) => void
			const run = (value: A) => {
				const result = callback(value)
				if (result instanceof Eventual) {
					result.then((b) => resolve(b))
				} else {
					resolve(result)
				}
			}

			if (this.state._tag === "pending") {
				this.state.callbacks.push(run)
			} else {
				run(this.state.value)
			}
		})
	}

	resolve(value: A) {
		if (this.state._tag !== "pending") return
		// Execute our callbacks with the value
		this.state.callbacks.forEach((callback) => callback(value))
		this.state = { _tag: "resolved", value: value }
	}
}

const readFileEventually = (path: string): Eventual<string> => {
	return new Eventual((resolve) => {
		readFile(path, "utf8", (_, book) => {
			resolve(book)
		})
	})
}

const theEnd = readFileEventually("thoth.md")
	.then((thoth) => {
		// this is just a proof that `.then()` unwraps the result in case it
		// is of type Eventual. For example, `readFileEventually("thoth.md")`
		// returns `Eventual<string>`, but, then passes just the string value.
		console.log(`READ THOTH: ${thoth}`)
		return readFileEventually("thoth.md")
	})
	.then((thoth) => {
		console.log(`READ THOTH: ${thoth}`)
		return thoth.length
	})
	.then((length) => {
		console.log(`LENGTH: ${length}`)
		return length % 2 === 0
	})
	.then((isEven) => {
		console.log(`isEven: ${isEven}`)
	})
	.then(() => {
		console.log("AS IT IS WRITTEN")
		return true
	})
console.log("FILE OVER!")
