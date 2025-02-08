# CH1: C Basics | L1: Welcome to Memory Management
Assignment
The ultimate crime has been committed. Someone's confused "Python" with "Sneklang".

Update the code to print:

Starting the Sneklang interpreter...

Make sure to keep the \n newline character at the end of the print statement.

```c
#include <stdio.h>

int main() {
    printf("Starting the Sneklang interpreter...\n");
    return 0;
}
```

# CH1: C Basics | L2: C Program Structure
C Program Structure

Your browser does not support playing HTML5 video. You can instead. Here is a description of the content: Using C to learn memory management

In Python you'd do something like this:

`python slow_program.py`

The Python interpreter then executes that file top-to-bottom. If you have a print() at the top level, then it will print something.

The entire file is interpreted line by line, but that's not how C works.
Simplest C Program

The simplest C program is essentially:

```c
int main() {
    return 0;
}
```

But a lot is happening here...
- A function named main is always the entry point to a C program (unlike Python, which enters at the top of the file).
- int is the return type of the function and is short for "integer". Because this is the main function, the return value is the exit code of the program. 0 means success, anything else means failure.
    - You'll find a lot of abbreviations in C because 1) programmers are lazy, and 2) it used to matter how many bytes your source code was.
- The opening bracket, { is the start of the function's body (C ignores whitespace, so indentation is just for style, not for syntax)
- return 0 returns the 0 value (an integer) from the function. Again, this is the exit code because it's the main function.
    - 0 represents "nothing bad happened" as a return value.
- The pesky ; at the end of return 0; is required in C to terminate statements.
- The closing bracket, } denotes the end of the function's body.

Print

It feels very different coming from Python, but printing in C is done with a function called printf from the stdio.h (standard input/output) library with a lot of weird formatting rules. To use it, you need an #include at the top of your file:

#include <stdio.h>

Then you can use printf from inside a function:

printf("Hello, world!\n");

Notice the \n: it's required to print a newline character (and flush the buffer in the browser), which print() in Python does automatically.

In case you're wondering, the f in printf stands for "print formatted".
Assignment

Write a small C program that prints:

`Program in C!`

```c
#include <stdio.h>

int main() {
    printf("Program in C!\n");
    return 0;
}
```

# CH1: C Basics | L3: Interpreted Quiz
Interpreted Quiz

Up until now, you've probably only worked with interpreted languages on Boot.dev. Use the following interpreted (in this case, Python) code to answer the question.

```python
print("starting")
func_that_doesnt_exist("uh oh")
print("finished")
```

Assume func_that_doesnt_exist is a function that truly does not exist.

What will happen when the code runs?
Answer: 'starting' prints, then a stack trace due to an undefined function prints'

# CH1: C Basics | L4: C is Compiled
Is Compiled

This Python code prints "starting" before it crashes:

```python
print("starting")
func_that_doesnt_exist("uh oh")
print("finished")
```

But in C, it crashes before it can even run. If there's a problem, the compiler tells us before the program even starts.

Now... C doesn't tell us about all the possible problems (read: skill issues) that might arise in our program. But it does tell us about some of them.

Example:

```c
#include <stdio.h>

int main() {
  printf("starting sneklang tools\n");
  does_not_exist("uh oh");
  printf("finished sneklang tools\n");
  return 0;
}
```
During compilation, you'll see an error like this:
```console
err: exit status 1, main.c:5:3: error: call to undeclared function 'does_not_exist'; ISO C99 and later do not support implicit function declarations [-Wimplicit-function-declaration]
    5 |   does_not_exist("uh oh");
      |   ^
1 error generated.
```

# CH1: C Basics | L5: Comments

In C, there are two ways to write comments:

```c
// This is a single-line comment

/*
This is a multi-line comment
I can just keep adding lines
and it will still be a comment
*/
```
/* and */ are used to denote the beginning and end of a multi-line comment.

# CH1: C Basics | L6: Basic Types
- int - An integer
- float - A floating point number
- char - A character
- char * - An array of characters (more on this later... if you think about it, sounds kinda like a string doesn't it?)

You've already seen int in the example before - it's the return value in the special main function (the entry point for every C program).

# CH1: C Basics | L7: Strings

Most programming languages these days (even compiled ones) have a built-in string type of some sort. C... doesn't.

Instead, C strings are just arrays (like lists) of characters. We'll talk more about the specifics when we talk about arrays and pointers later, but for now know that this is how you get a "string" in C:

```c
char *msg_from_dax = "You still have 0 users";
```

Very (I repeat, very) loosely speaking, char * means string. Also note that it is required to use double quotes ". Single quotes (') make char, not char *.

# CH1: C Basics | L8: Printing Variables

You've already seen me do a printf() magic a few times. Unfortunately, in C it isn't as easy to do string interpolation (what f-strings do in Python).

Instead of:

`print(f"Hello, {name}. You're {age} years old.")`

We have to tell C how we want particular values to be printed using "format specifiers".

Common format specifiers are:
- %d - digit (integer)
- %c - character
- %f - floating point number
- %s - string (char *)

`printf("Hello, %s. You're %d years old.\n", name, age);`

Newline Character
The print() function in Python automatically adds a newline character (\n) at the end of the string. In C, we have to do this manually.
`printf("Hello, world!\n");`

Assignment

In the space provided print:

Default max threads: A
Custom perms: B
Constant pi value: C
Sneklang title: D

```c
#include <stdio.h>

int main() {
  int sneklang_default_max_threads = 8;
  char sneklang_default_perms = 'r';
  float sneklang_default_pi = 3.141592;
  char *sneklang_title = "Sneklang";
  // don't touch above this line
  printf("Default max threads: %d\n", sneklang_default_max_threads);
  printf("Custom perms: %c\n", sneklang_default_perms);
  printf("Constant pi value: %f\n", sneklang_default_pi);
  printf("Sneklang title: %s\n", sneklang_title);
  return 0;
}
```

# CH1: C Basics | L9: Compilation Types

You're probably familiar with the idea of types from Python, but C does them quite a bit differently.

In Python, it's OK (but still disgusting) to change the type of a variable:

```python
x = 12345
x = "wow, a new type"
x = False
x = None
x = "ok a string again :'("
```

In C, changing the type of an existing variable is not allowed:

```c
int main() {
    char *max_threads = "5";

    // call badcop
    // this is illegal
    max_threads = 5;
}
```

# CH1: C Basics | L10: Variables

As we talked about, variables cannot change types:

```c
int main() {
    int x = 5;
    float x = 3.14; // error
}
```

However, a variable's value can change:

```c
int main() {
    int x = 5;
    x = 10; // this is ok
    x = 15; // still ok
}
```


# CH1: C Basics | L11: Constants

So a variable's value can change:

```c
int main() {
    int x = 5;
    x = 10; // this is ok
}
```

But what if we want to create a value that can't change? We can use the const type qualifier.

```c
int main() {
    const int x = 5;
    x = 10; // error
}
```
`const int meaning_of_life = 42;`


# CH1: C Basics | L12: Functions

In C, functions specify the types for their arguments and return value.

```c
float add(int x, int y) {
    return (float)(x + y);
}
```

- The first type, float is the return type.
- add is the name of the function.
- int x, int y are the arguments to the function, and their types are specified.
- x + y adds the two arguments together.
- (float) casts the result to a float.
    - We'll talk more about what cast means later, and the rules for casting to and from certain types.
    - The simple version is that it instructs C to treat the result of x + y as a float.

Here's how you would call this function:

```c
int main() {
    float result = add(10, 5);
    printf("result: %f\n", result);
    // result: 15.000000
    return 0;
}
```

It's nice that C functions enforce returning the same type from all return statements, isn't it? In Python, it can be a pain to realize that a function returns different types depending on the path it took.


Assignment

Write a max_sneklang_memory function in the space provided. It should accept two arguments:
- int max_threads
- int memory_per_thread

It should return an integer representing the total memory available to the Sneklang interpreter.

```c
#include <stdio.h>

// ?
int max_sneklang_memory (int max_threads, int memory_per_thread) {
  return max_threads * memory_per_thread;
}
// don't touch below this line

void init_sneklang(int max_threads, int memory_per_thread) {
  printf("Initializing Sneklang\n");
  printf("Max threads: %d\n", max_threads);
  printf("Memory per thread: %d\n", memory_per_thread);
  int max_memory = max_sneklang_memory(max_threads, memory_per_thread);
  printf("Max memory: %d\n", max_memory);
  printf("====================================\n");
}

int main() {
  init_sneklang(4, 512);
  init_sneklang(8, 1024);
  init_sneklang(16, 2048);
  return 0;
}

```

# CH1: C Basics | L13: Void
In C, there's a special type for function signatures: void. There are two primary ways you'll use void:

To explicitly state that a function takes no arguments:

```c
int get_integer(void) {
    return 42;
}
```

When a function doesn't return anything:

```c
void print_integer(int x) {
    printf("this is an int: %d", x);
}
```

It's important to note that void in C is not like None in Python. It's not a value that can be assigned to a variable. It's just a way to say that a function doesn't return anything or doesn't take any arguments.

# CH1: C Basics | L14: Unit Tests

Up to this point, we've been checking the standard output of your code against our expected output. Now that you're familiar with functions, most of the lessons will be graded using unit tests.
µnit

In particular, we'll be using the µnit (munit) testing framework. It's a simple, lightweight testing framework for C.

File Layout

Take a look at the main.c file. You'll notice it's read-only: you can't change the tests (that would make it too easy to cheat- ha!). It #includes exercise.h at the top.

Open exercise.h and you'll see the function prototype (signature) of the function you need to write. In C:
- .c files contain the implementation (c code).
- .h files are header files that contain the function prototypes.

To import code from another file, you include the .h file.
- exercise.c includes exercise.h.
- main.c includes exercise.h.

This allows main.c to call the functions implemented in exercise.c.

```main.c
#include "munit.h"

#include "exercise.h"

munit_case(RUN, test_get_average, {
  float result = get_average(3, 4, 5);
  munit_assert_double_equal(result, 4.0, "Average of 3, 4, 5 is 4");
});

munit_case(RUN, test_non_integer, {
  float result = get_average(3, 3, 5);
  munit_assert_double_equal(result, 11.0 / 3.0, "Average of 3, 3, 5 is 3.66667");
});

munit_case(SUBMIT, test_average_of_same, {
  float result2 = get_average(10, 10, 10);
  munit_assert_double_equal(result2, 10.0, "Average of 10s... is 10");
});

munit_case(SUBMIT, test_average_of_big_numbers, {
  float result3 = get_average(1050, 2050, 2075);
  munit_assert_double_equal(
      result3, 1725.0, "Bigger numbers can still get averaged, duh!"
  );
});

int main() {
  MunitTest tests[] = {
      munit_test("/get_average", test_get_average),
      munit_test("/get_average_float", test_non_integer),
      munit_test("/get_average_same", test_average_of_same),
      munit_test("/get_average_big", test_average_of_big_numbers),
      munit_null_test,
  };

  MunitSuite suite = munit_suite("get_average", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
float get_average(int x, int y, int z);
```

```exercise.c
#include "exercise.h"
#include "stdio.h"

float get_average(int x, int y, int z) {
  return (x + y + z) / (float)3;
}
```

# CH1: C Basics | L15: Math Operators

All the same operators you'd expect exist in C:

```
x + y;
x - y;
x * y;
x / y;
```

If you're coming from Python, +=, -=, *=, /= are all the same.

In addition, there are also the ++ and -- operators:

```c
x++; // += 1
x--; // -= 1
```

The name of C++ is a bit of a joke by the creator, it's meant to be "incremented C" or "better C".

These increment (++) and decrement (--) operators can be used in two forms: postfix and prefix.

Postfix (x++ or x--): The value of x is used in the expression first, and then x is incremented or decremented. For example:

```c
int a = 5;
int b = a++; // b is assigned 5, then a becomes 6
```

Prefix (++x or --x): x is incremented or decremented first, and then the new value of x is used in the expression. For example:

```c
int a = 5;
int b = ++a; // a becomes 6, then b is assigned 6
```


```main.c
#include "munit.h"

#include "exercise.h"

munit_case(RUN, test_snek_score_1, {
  float result = snek_score(3, 4, 5, 0.1);
  munit_assert_double_equal(result, 1.9, "result must be 1.9");
});

munit_case(RUN, test_snek_score_2, {
  float result = snek_score(10, 10, 10, 0.1);
  munit_assert_double_equal(result, 11.0, "result must be 11.0");
});

munit_case(SUBMIT, test_snek_score_3, {
  float result = snek_score(105, 205, 207, 0.1);
  munit_assert_double_equal(result, 2194, "result must be 2194.0");
});

int main() {
  MunitTest tests[] = {
      munit_test("/test_snek_score_1", test_snek_score_1),
      munit_test("/test_snek_score_2", test_snek_score_2),
      munit_test("/test_snek_score_3", test_snek_score_3),
      munit_null_test,
  };

  MunitSuite suite = munit_suite("snek_score", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
float snek_score(
  int num_files,
  int num_contributors,
  int num_commits,
  float avg_bug_criticality
);
```

```exercise.c
float snek_score(
  int num_files,
  int num_contributors,
  int num_commits,
  float avg_bug_criticality
) {
  float size_factor = (num_files * num_commits);
  float complexity_factor = size_factor + num_contributors;
  float final_score = complexity_factor * avg_bug_criticality;
  return final_score;
}
```

# CH1: C Basics | L16: If Statements

If statements are the most basic form of control flow in C: very similar to other languages. Basic syntax:

```c
if (x > 3) {
    printf("x is greater than 3\n");
}
```

If/else/else if are also available:

```c
if (x > 3) {
    printf("x is greater than 3\n");
} else if (x == 3) {
    printf("x is 3\n");
} else {
    printf("x is less than 3\n");
}
```

Janky Syntax

You can write an if statement without braces if you only have one statement in the body:

`if (x > 3) printf("x is greater than 3\n");`

```main.c
#include "munit.h"

#include "exercise.h"

munit_case(RUN, test_cold, {
  char *result = get_temperature_status(50);
  munit_assert_string_equal(result, "too cold", "50 should be too cold");
});

munit_case(RUN, test_hot, {
  char *result = get_temperature_status(100);
  munit_assert_string_equal(result, "too hot", "100 should be too hot");
});

munit_case(SUBMIT, test_just_right, {
  char *result = get_temperature_status(70);
  munit_assert_string_equal(result, "just right", "70 should be just right");
});

munit_case(SUBMIT, test_just_right2, {
  char *result = get_temperature_status(75);
  munit_assert_string_equal(result, "just right", "75 should be just right");
});

int main() {
  MunitTest tests[] = {
      munit_test("/test_cold", test_cold),
      munit_test("/test_hot", test_hot),
      munit_test("/test_just_right", test_just_right),
      munit_test("/test_just_right2", test_just_right2),
      munit_null_test,
  };

  MunitSuite suite = munit_suite("get_temperature_status", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
char *get_temperature_status(int temp);
```

```exercise.c
#include "exercise.h"

char *get_temperature_status(int temp) {
  if (temp < 70) return "too cold";
  if (temp > 90) return "too hot";
  return "just right";
};
```

# CH1: C Basics | L17: Ternary

Like JavaScript, C has a ternary operator:

```c
int a = 5;
int b = 10;
int max = a > b ? a : b;
printf("max: %d\n", max);
// max: 10
```

Let's break down the syntax:

`a > b ? a : b`

The entire line is a single expression that evaluates to one value. Here's how it works:
- a > b is the condition
- a is the final value if the condition is true
- b is the final value if the condition is false
- The entire expression (a > b ? a : b) evaluates to either a or b, which is then assigned to max in our example.

Ternaries are a way to write a simple if/else statement in one line.

# CH1: C Basics | L18: Types Sizes

In C, the "size" (in memory) of a type is not guaranteed to be the same on all systems. That's because the size of a type is dependent on the system's architecture. For example, on a 32-bit system, the size of an int is usually 4 bytes, while on a 64-bit system, the size of an int is usually 8 bytes - of course, you never know until you run sizeof with the compiler you plan on using.

However, some types are always guaranteed to be the same. Here’s a list of the basic C data types along with their typical sizes in bytes. Note that sizes can vary based on the platform (e.g., 32-bit vs. 64-bit systems):
Basic C Types and Sizes:

    char
        Size: 1 byte
        Represents: Single character.
        Notes: Always 1 byte, but can be signed or unsigned.

    float
        Size: 4 bytes
        Represents: Single-precision floating-point number.

    double
        Size: 8 bytes
        Represents: Double-precision floating-point number.

The actual sizes of these types can be determined using the sizeof operator in C for a specific platform, which we'll learn about next.

# CH1: C Basics | L19: Sizeof

C gives us a way to check the size of a type or a variable: sizeof.

You can use sizeof like a function (although, technically it's a unary operator, but that distinction is generally only useful for winning super important internet arguments).

We'll use the sizeof operator in the next few lessons to give us insight into the memory layout of different types in C. This will be particularly useful as we move deeper into C, and essential for understanding pointers.

> Pointers are not too bad once you understand the basics! I promise!
size_t

The size_t type is a special type that is guaranteed to be able to represent the size of the largest possible object in the target platform's address space (i.e. can fit any single, non-struct value inside of it).

It's also the type that sizeof returns.


```c
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

int main() {
  // Use %zu is for printing `sizeof` result
  printf("sizeof(char)   = %zu\n", sizeof(char));
  printf("sizeof(bool)   = %zu\n", sizeof(bool));
  printf("sizeof(int)   = %zu\n", sizeof(int));
  printf("sizeof(float)   = %zu\n", sizeof(float));
  printf("sizeof(double)   = %zu\n", sizeof(double));
  printf("sizeof(size_t)   = %zu\n", sizeof(size_t));
}
```

# CH1: C Basics | L20: For Loop

A for loop in C is a control flow statement for repeated execution of a block of code. Very similar to Python, but with a different syntax.

The syntax of a for loop in C consists of three main parts:
- Initialization
- Condition
- Final-expression.

There is no "for each" (iterables) in C. For example, there is no way to do:

```python
for car in cars:
    print(car)
```

Instead, we have to iterate over the numbers of indices in a list, and then we can access the item using the index.
Syntax

```
for (initialization; condition; final-expression) {
    // Loop Body
}
```

Parts of a for Loop
- Initialization
    - Executed only once at the beginning of the loop.
    - Is typically used to initialize the loop counter: int i = 0; for example
- Condition
    - Checked before each iteration.
    - If true, execute the body. If false, terminate the loop
    - Often checks to ensure i is less than some value: i < 5; for example
- Final-expression
    - Executed after each iteration of the loop body.
    - Can be used to update the loop counter or run any other code: i++ for example
- Loop Body
    - The block of code that is executed while the condition is true.

Example: Basic Loop
```c
#include <stdio.h>

int main() {
  for (int i = 0; i < 5; i++) {
    printf("%d\n", i);
  }
  return 0;
}

// Prints:
// 0
// 1
// 2
// 3
// 4
```
```main.c
#include <stdio.h>
#include "exercise.h"

void test(int start, int end){
  printf("Printing from %d to %d:\n", start, end);
  print_numbers(start, end);
  printf("======================\n");
}

int main() {
  test(42, 69);
}
```

```exercise.h
void print_numbers(int start, int end);
```

```exercise.c
#include <stdio.h>

void print_numbers(int start, int end) {
  for (int i = start; i <= end; i++) {
    printf("%d\n", i);
  }
};
```

# CH1: C Basics | L21: While Loop

A while loop in C is a control flow statement that allows code to be executed repeatedly based on a given boolean (true/false) condition. The loop continues to execute as long as the condition remains true.
Syntax

```c
while (condition) {
    // Loop Body
}
```

Parts of a while Loop
- Condition
    - Checked before each iteration.
    - If true, execute the body. If false, terminate the loop
- Loop Body
    - The block of code that is executed while condition is true.

Example: Basic Loop
```c
#include <stdio.h>

int main() {
    int i = 0;
    while (i < 5) {
        printf("%d\n", i);
        i++;
    }
    return 0;
}
// Prints:
// 0
// 1
// 2
// 3
// 4
```

Key Points
- The condition is evaluated before the execution of the loop body.
- If the condition is false initially, the loop body will never even start.
- If the condition never becomes false, you will get an infinite loop.

```main.c
#include <stdio.h>
#include "exercise.h"

void test(int start, int end){
  printf("Printing from %d to %d:\n", start, end);
  print_numbers_reverse(start, end);
  printf("======================\n");
}

int main() {
  test(20, 4);
}
```

```exercise.h
void print_numbers_reverse(int start, int end);
```

```exercise.c
#include <stdio.h>

void print_numbers_reverse(int start, int end) {
  int i = start;
  while (i >= end) {
    printf("%d\n", i);
    i--;
  }
};
```

# CH1: C Basics | L22: Do While Loop

A do while loop in C is a control flow statement that allows code to be executed repeatedly based on a given boolean condition.

Unlike the while loop, the do while loop checks the condition after executing the loop body, so the loop body is always executed at least once.
Syntax

```c
do {
    // Loop Body
} while (condition);
```

Parts of a do while Loop
- Loop Body
    - The block of code that is executed before checking the condition, and then repeatedly as long as the condition is true.
- Condition:
    - Checked after each iteration.
    - If true, execute the body again.
    - If false, terminate the loop

Examples
```c
#include <stdio.h>

int main() {
    int i = 0;
    do {
        printf("i = %d\n", i);
        i++;
    } while (i < 5);
    return 0;
}
// Prints:
// 0
// 1
// 2
// 3
// 4
```

```c
#include <stdio.h>

int main() {
    int i = 100;
    do {
        printf("i = %d\n", i);
        i++;
    } while (i < 5);
    return 0;
}
// Prints:
// i = 100
```

Key Points

The do while loop guarantees that the loop body is executed at least once, even if the condition is false initially.

The most common scenario you will see a do-while loop used is in C macros - they let you define a block of code and execute it exactly once in a way that is safe across different compilers, and ensures that the variables created/referenced within the macro do not leak to the surrounding environment.

If you end up looking at any source code for macros, you will probably see a few do-while loops. For example, here's a simplified version from our munit testing library we're using:

```c
#define munit_assert_type_full(T, fmt, a, op, b, msg)                          \
  do {                                                                         \
    T munit_tmp_a_ = (a);                                                      \
    T munit_tmp_b_ = (b);                                                      \
    if (!(munit_tmp_a_ op munit_tmp_b_)) {                                     \
      munit_errorf("assertion failed: %s %s %s (" prefix "%" fmt suffix        \
                   " %s " "%" fmt "): %s",                                     \
                   #a, #op, #b, munit_tmp_a_, #op, munit_tmp_b_, msg);         \
    }                                                                          \
  } while (0)
```

It creates a do-while loop, creates a few new variables and then checks that the assertion is valid. If it is not, then it errors and formats a (complicated) error message (If this code doesn't make any sense, that's fine too! I just wanted to show you where they most often occur).

Note: there is no semi-colon after while(0) in the loop above. This lets the macro be used in a block of code without causing syntax errors.

```main.c
#include <stdio.h>
#include "exercise.h"

void test(int start, int end){
  printf("Printing from %d to %d:\n", start, end);
  print_numbers_reverse(start, end);
  printf("======================\n");
}

int main() {
  test(5, 1);
  test(1, 5);
}
```

```exercise.h
void print_numbers_reverse(int start, int end);
```

```exercise.c
#include <stdio.h>

void print_numbers_reverse(int start, int end) {
  do {
    printf("%d\n", start);
    start--;
  } while (start >= end);
}
```

# CH1: C Basics | L23: Pragma Once and Header Guards

We saw how .h header files are used in a previous lesson, but before we go further let's talk about a potential issue you might run into: multiple inclusions. If the same header file gets included more than once, you can end up with some nasty errors caused by redefining things like functions or structs.
Pragma Once

One simple solution (and the one we'll use for the rest of this course) is #pragma once. Adding this line to the top of a header file tells the compiler to include the file only once, even if it's referenced multiple times across your program.

```c
// my_header.h

#pragma once

struct Point {
    int x;
    int y;
};
```

Header Guards
Another common way to avoid multiple inclusions is with include guards, which use preprocessor directives like this:
```c
#ifndef MY_HEADER_H
#define MY_HEADER_H

// some cool code

#endif
```

This method works by defining a unique macro for the header file. If it’s already been included, the guard prevents it from being processed again.

Throughout this course, you’ll see #pragma once in our header files. It's quicker and less error-prone than traditional include guards, and it works well with most modern compilers.
