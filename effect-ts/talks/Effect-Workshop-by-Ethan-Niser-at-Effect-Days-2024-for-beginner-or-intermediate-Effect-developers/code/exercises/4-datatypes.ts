import { Brand, Equal, Hash, pipe } from "effect";
import assert from "node:assert";

// ================================ Exercise 1 =================================
// implement equals and hash for the Transaction class

class Transaction implements Equal.Equal, Hash.Hash {
	constructor(
		public readonly id: string,
		public readonly amount: number,
		public readonly time: Date,
	) { }

	[Equal.symbol](that: unknown): boolean {
		return that instanceof Transaction &&
			that.id == this.id &&
			that.amount == this.amount &&
			that.time.getTime() == this.time.getTime();
	}

	[Hash.symbol](): number {
		return pipe(
			Hash.string(this.id),
			Hash.combine(Hash.number(this.amount)),
			Hash.combine(Hash.number(this.time.getTime()))
		);
	}
}

assert(
	Equal.equals(
		new Transaction("1", 1, new Date(3)),
		new Transaction("1", 1, new Date(3)),
	),
);

assert(
	Hash.hash(new Transaction("1", 1, new Date(3)))
	=== Hash.hash(new Transaction("1", 1, new Date(3))),
);
// -----------------------------------------------------------------------------

// ================================ Exercise 2 =================================
// create a datatype for a string that has been guaranteed to be only ascii
// here is a regex for you to use `/^[\x00-\x7F]*$/`

/*
type ASCIIString = never;

function takesOnlyAscii(s: ASCIIString) {
	// ...
}

const string1: ASCIIString = "hello";
const string2: ASCIIString = "hello 🌍";

takesOnlyAscii(string1);
takesOnlyAscii(string2);
 */

/*
 * There's some overhead on creating classes (objects)
 * for this case when we only have a string with some validation logic to it
 * there's better approaches
class ASCIIString {
	constructor(readonly value: string) {
		if (!/^[\x00-\x7F]*$/.test(value)) {
			throw new Error("Not an ASCII string");
		}
	}
}
 */

// Brand allows us to create a type

// it's a useful typescript trick:
// type ASCIIString = string & { brand: "ASCIIString" }>;

/*
type ASCIIString = string & Brand.Brand<"ASCIIString">;

function validateASCIIString(value: string): ASCIIString {
	if (!/^[\x00-\x7F]*$/.test(value)) {
		throw new Error("Not an ASCII string");
	}
	return value as ASCIIString;
}

function takesOnlyAscii(s: ASCIIString) {
	console.log(s);
}

const string1: ASCIIString = validateASCIIString("hello");
// const string2: ASCIIString = validateASCIIString("hello 🌍"); // would throw the error
const string2: ASCIIString = validateASCIIString("hello world");

takesOnlyAscii(string1);
takesOnlyAscii(string2);
 */

type ASCIIString = string & Brand.Brand<"ASCIIString">;

const _ = Brand.nominal<ASCIIString>();

const ASCIIString = Brand.refined<ASCIIString>(
	(s) => /^[\x00-\x7F]*$/.test(s),
	(s) => Brand.error(`${s} is not ASCII`)
);

function takesOnlyAscii(s: ASCIIString) {
	console.log(s);
}

const string1 = ASCIIString("hello");
const string2 = ASCIIString("hello world");
// const string3 = ASCIIString("hello 🌍"); // would error

takesOnlyAscii(string1);
takesOnlyAscii(string2);
// takesOnlyAscii(string3);
// -----------------------------------------------------------------------------
