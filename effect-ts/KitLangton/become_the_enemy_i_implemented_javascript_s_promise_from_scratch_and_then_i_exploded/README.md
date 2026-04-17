================================================================================
BECOME THE ENEMY — I Implemented JavaScript's Promise From Scratch and Then I Exploded
https://www.youtube.com/watch?v=mKPQ25lQbrU&list=PLicC_uGS5eIKAafTPrFvYqxK1Axv-PK9R
================================================================================

"If you know the enemy and know yourself, you need not fear the result of a hundred battles." - Sun "Microsystems" Tzu

```index.ts
// CALLBACK / CONTINUATION / HANDLER
//
// long before promises sculpt about this earth, we programmed asynchronous
// javascript with continuation passing style.
// EXAMPLE:
import { readFileSync } from "node:fs"

console.log("HERE WE GO")
const book = readFileSync("thoth.md", "utf8")
console.log(`CONSEQUENCE FREE POWER\n${book}`)

// we would never want to write this code in a real system because this line
// `const book = readFileSync("thoth.md", "utf8")` blocks OUR ONLY THREAD.
//
// JavaScript consists of one main thread, whose job it is to work it's way
// through a task queue comprised of different tasks
// MAIN THREAD = [ t1, t2, t3, t4 ]
// it dequeue tasks from the front, runs them to completion, one at a time
// MAIN THREAD = t1 ... [ t2, t3, t4 ]
```
