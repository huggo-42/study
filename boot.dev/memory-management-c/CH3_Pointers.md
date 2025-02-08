# CH3: Pointers | L1: Memory
Before we talk about pointers, we should talk about variables and memory in general. Here are some useful (albeit hand-wavy) mental models:
-  Variables are human readable names that refer to some data in memory.
-  Memory is a big array of bytes, and data is stored in the array.

A variable is a human readable name that refers to an address in memory, which is an index into the big array of bytes. Here’s a diagram:

![[CH3_Pointers_L1_Memory_1.png]]

Getting a Variable’s Address

In C, you can print the address of a variable by using the address-of-operator: &. Here’s an example:

```c
#include <stdio.h>

int main() {
  int age = 37;
  printf("The address of age is: %p\n", &age);
  return 0;
}

// The address of age is: 0xfff8
```

Note: The %p format specifier will format a pointer (memory address) to be printed.

# CH3: Pointers | L2: What is an Address?
So I mentioned in the last lesson that memory can be thought of as a big array of bytes, and each byte has an address.

That’s true, and the beauty is that each address is literally just a number. It’s not some mortal address like “1234 Elm St.” or “1600 Pennsylvania Ave.” It’s just a number.

You might be thinking, “Hey, if it’s just a number, why does it look all disgusting like 0xfff8?”

That’s because 0xfff8 is just a number. But:
- It’s written in hexadecimal (base 16) instead of decimal (base 10).
- It’s a pretty big number, so it’s not very human readable. 0xfff8 is the same as 65,528 in decimal.

![[CH3_Pointers_L2_WhatIsAnAddress_1.png]]

# CH3: Pointers | L3: Virtual Memory
As it turns out, your code probably doesn’t have direct access to the physical RAM in your computer.

Instead, your operating system provides a layer of abstraction called virtual memory. Virtual memory makes it seem like your program has direct access to all the memory on the machine, even if it doesn’t.
- Physical Memory: The actual RAM sticks in your computer.
- Operating System: The software that manages access to the physical memory.
- Your Program: When it runs, it becomes a process and is given access to a chunk of virtual memory by the operating system.
- Virtual Memory: This abstracted chunk of memory that your program can use.

There are exceptions to this, for example if you’re using C to build embedded firmware that runs without an operating system, your code might interact directly with physical memory.

![[CH3_Pointers_L3_VirtualMemory_1.png]]

By only giving processes access to a chunk of virtual memory, the operating system can do some cool things:
- Isolation: One process can’t access the memory of another process.
- Security: The operating system can prevent processes from accessing certain parts of memory.
- Simplicity: Developers don’t have to worry about managing physical memory and the memory of other processes.
- Performance: The operating system can optimize memory access depending on the hardware and needs of the program. For example, by moving data between physical memory and the hard drive.

At the end of the day, your program has direct access to a virtual chunk of memory. Just like physical memory, it can be thought of as a big array of bytes, where each byte has an address.

# CH3: Pointers | L4: Pointers
You’ve probably heard of pointers. You may have also seen jokes about how they are impossible to learn… Well, that’s wrong.

In fact, now that you understand how memory is laid out in an array, a lot of the mystery behind pointers should be gone. Put simply: a pointer is just a variable that stores a memory address. It’s called a pointer, because it “points” to the address of a variable, which stores the actual data held in that variable.

Your browser does not support playing HTML5 video. You can instead. Here is a description of the content: pointers are easy
Syntax

A pointer is declared with an asterisk (*) after the type. For example, int *.

```c
int age = 37;
int *pointer_to_age = &age;

*pointer_to_age = 22; // would change the value of age to 22
```

Remember, to get the address of a variable so that we can store it in a pointer variable, we can use the address-of operator (&).

# CH3: Pointers | L5: Why Pointers?
To illustrate the usefulness of pointers, let’s pretend we want to pass a collection of data into a function. Within that function, we want to modify the data. In Python, we could use a class to store the data, and pass an instance of that class into the function:

```python
class Coordinate:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

def update_coordinate_x(coord, new_x):
    coord.x = new_x

c = Coordinate(1, 2, 3)
print(c.x)  # 1
update_coordinate_x(c, 4)
print(c.x)  # 4
```

```main.c
#include "munit.h"

#include "coordinate.h"

coordinate_t new_coordinate(int x, int y, int z) {
  return (coordinate_t){.x = x, .y = y, .z = z};
}

munit_case(RUN, test_unchanged, {
  coordinate_t old = new_coordinate(1, 2, 3);
  munit_assert_int(old.x, ==, 1, "old.x must be 1");

  coordinate_update_x(old, 4);
  munit_assert_int(old.x, ==, 1, "old.x must still be 1");
});

munit_case(SUBMIT, test_changed, {
  coordinate_t old = new_coordinate(1, 2, 3);
  munit_assert_int(old.x, ==, 1, ".x must be 1");

  coordinate_t new = coordinate_update_and_return_x(old, 4);
  munit_assert_int(new.x, ==, 4, "new .x must be 4");
  munit_assert_int(old.x, ==, 1, "old.x must still be 1");

  // Notice, they have different addresses
  munit_assert_ptr_not_equal(&old, &new, "Must be different addresses");
});

int main() {
  MunitTest tests[] = {
      munit_test("/test_unchanged", test_unchanged),
      munit_test("/test_changed", test_changed),
      munit_null_test,
  };

  MunitSuite suite = munit_suite("pointers", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```coordinate.h
typedef struct coordinate {
  int x;
  int y;
  int z;
} coordinate_t;

void coordinate_update_x(coordinate_t coord, int new_x);
coordinate_t coordinate_update_and_return_x(coordinate_t coord, int new_x);
```

```coordinate.c
#include "coordinate.h"

void coordinate_update_x(coordinate_t coord, int new_x) {
  coord.x = new_x;
}

coordinate_t coordinate_update_and_return_x(coordinate_t coord, int new_x) {
  coord.x = new_x;
  return coord;
}
```

What Happened?

After passing the assignment, open up main.c and take a look at the test cases. You’ll notice that coordinate_update_x doesn’t update anything, but coordinate_update_and_return_x does because it returns a new copy of the struct.
- In C, structs are passed by value. That’s why updating a field in the struct does not change the original struct from the main function.
- To get the change to “persist”, we needed to return the updated struct from the function (a new copy).
- The memory address of the struct that went in to coordinate_update_and_return_x was not the same as the address of the struct that was returned. Again, because we created a copy.

# CH3: Pointers | L6: Pointers Basics
Remember, pointers are just an address (read: value) that tells the computer where to look for other values. Just like how the address to your house is not actually your house, but points you to where your house is.
Syntax Review

Declare a pointer to an integer:

`int *pointer_to_something; // declares `pointer_to_something` as a pointer to an int`

Get the address of a variable:

```c
int meaning_of_life = 42;
int *pointer_to_mol = &meaning_of_life;
// pointer_to_mol now holds the address of meaning_of_life
```

New: Dereferencing Pointers

Oftentimes we have a pointer, but we want to get access to the data that it points to. Not the address itself, but the value stored at that address.

We can use an asterisk (*) to do it. The * operator dereferences a pointer.

```c
int meaning_of_life = 42;
int *pointer_to_mol = &meaning_of_life;
int value_at_pointer = *pointer_to_mol;
// value_at_pointer = 42
```

It can be a touch confusing, but remember that the asterisk symbol is used for two different things:
- Declaring a pointer type: int *pointer_to_thing;
- Dereferencing a pointer value: *pointer_to_thing = 20;

```main.c
#include "munit.h"
#include "exercise.h"

munit_case(RUN, test_change_filetype_cpp_to_python, {
  codefile_t original;
  original.lines = 100;
  original.filetype = 1;
  codefile_t result = change_filetype(&original, 2);
  munit_assert_int(result.filetype, ==, 2, "Filetype should change from 1 to 2");
  munit_assert_int(result.lines, ==, 100, "Number of lines should remain unchanged");
});

munit_case(RUN, test_change_filetype_same_type, {
  codefile_t original;
  original.lines = 50;
  original.filetype = 3;
  codefile_t result = change_filetype(&original, 3);
  munit_assert_int(result.filetype, ==, 3, "Filetype should remain 3");
  munit_assert_int(result.lines, ==, 50, "Number of lines should remain unchanged");
});

munit_case(SUBMIT, test_change_filetype_java_to_rust, {
  codefile_t original;
  original.lines = 200;
  original.filetype = 4;
  codefile_t result = change_filetype(&original, 5);
  munit_assert_int(result.filetype, ==, 5, "Filetype should change from 4 to 5");
  munit_assert_int(result.lines, ==, 200, "Number of lines should remain unchanged");
});

munit_case(SUBMIT, test_change_filetype_zero_lines, {
  codefile_t original;
  original.lines = 0;
  original.filetype = 1;
  codefile_t result = change_filetype(&original, 6);
  munit_assert_int(result.filetype, ==, 6, "Filetype should change from 1 to 6");
  munit_assert_int(result.lines, ==, 0, "Number of lines should remain 0");
});

munit_case(RUN, test_change_filetype_no_mutation, {
  codefile_t original;
  original.lines = 150;
  original.filetype = 7;
  codefile_t backup = original;
  codefile_t result = change_filetype(&original, 8);
  munit_assert_int(result.filetype, ==, 8, "Filetype should change to 8");
  munit_assert_int(original.filetype, ==, backup.filetype, "Original filetype should remain unchanged");
  munit_assert_int(original.lines, ==, backup.lines, "Original number of lines should remain unchanged");
});

int main() {
  MunitTest tests[] = {
      munit_test("/test_change_filetype_cpp_to_python", test_change_filetype_cpp_to_python),
      munit_test("/test_change_filetype_same_type", test_change_filetype_same_type),
      munit_test("/test_change_filetype_java_to_rust", test_change_filetype_java_to_rust),
      munit_test("/test_change_filetype_zero_lines", test_change_filetype_zero_lines),
      munit_test("/test_change_filetype_no_mutation", test_change_filetype_no_mutation),
      munit_null_test,
  };

  MunitSuite suite = munit_suite("change_filetype", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
typedef struct CodeFile {
  int lines;
  int filetype;
} codefile_t;

codefile_t change_filetype(codefile_t *f, int new_filetype);
```

```exercise.h
typedef struct CodeFile {
  int lines;
  int filetype;
} codefile_t;

codefile_t change_filetype(codefile_t *f, int new_filetype);
```

```exercise.c
#include "exercise.h"

codefile_t change_filetype(codefile_t *f, int new_filetype){
  codefile_t new_f = *f;
  new_f.filetype = new_filetype;
  return new_f;
}
```

# CH3: Pointers | L7: Pointers to structs
As you know, when you have a struct, you can access the fields with the dot (.) operator:

```c
coordinate_t point = {10, 20, 30};
printf("X: %d\n", point.x);
```

However, when you’re working with a pointer to a struct, you need to use the arrow (->) operator:

```c
coordinate_t point = {10, 20, 30};
coordinate_t *ptrToPoint = &point;
printf("X: %d\n", ptrToPoint->x);
```

It effectively dereferences the pointer and accesses the field in one step. To be fair, you can also use the dereference and dot operator (* and .) to achieve the same result (it’s just more verbose and less common):

```c
coordinate_t point = {10, 20, 30};
coordinate_t *ptrToPoint = &point;
printf("X: %d\n", (*ptrToPoint).x);
```

Order of Operations
The . operator has a higher precedence than the * operator, so parentheses are necessary when using * to dereference a pointer before accessing a member… which is another reason why the arrow operator is so much more common.

# CH3: Pointers | L8: C Arrays
If you’re used to Lists in Python, Arrays in C are similar, but a bit lower level.

An array is a fixed-size, ordered collection of elements. Like Python lists, they are indexed by integers, starting at zero. Unlike Python lists, they can only hold elements of the same type. They are stored in contiguous memory, like structs.
Integer Array

`int numbers[5] = {1, 2, 3, 4, 5};`

Iterating Over an Array

In C, there is no for x in list: syntax. Instead, you must iterate over them using a for loop with an index (or some other conditional loop)

```c
#include <stdio.h>

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};

    // Iterate and print each element
    for (int i = 0; i < 5; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n");

    return 0;
}
```

Output:

`1 2 3 4 5`

Updating Values in an Array

The syntax for updating values in an array is the same as how you access them:

`arr[index] = value`

Using our numbers example:

```c
#include <stdio.h>

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};

    // Update some values
    numbers[1] = 20;
    numbers[3] = 40;

    // Print updated array
    for (int i = 0; i < 5; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\n");

    return 0;
}
```

Output:

`1 20 3 40 5`

```main.c
#include "munit.h"
#include "exercise.h"

munit_case(RUN, test_update_file_basic, {
  int filedata[200] = {0};
  update_file(filedata, 1, 100);
  munit_assert_int(filedata[1], ==, 100, "Number of lines should be updated to 100");
  munit_assert_int(filedata[2], ==, 1, "File type should be updated to 1");
  munit_assert_int(filedata[199], ==, 0, "Last element should be set to 0");
});

munit_case(SUBMIT, test_update_file_different_values, {
  int filedata[200] = {0};
  for (int i = 0; i < 200; i++) {
      filedata[i] = 69;
  }
  update_file(filedata, 3, 250);
  munit_assert_int(filedata[1], ==, 250, "Number of lines should be updated to 250");
  munit_assert_int(filedata[2], ==, 3, "File type should be updated to 3");
  munit_assert_int(filedata[199], ==, 0, "Last element should be set to 0");
});

int main() {
  MunitTest tests[] = {
    munit_test("/test_update_file_basic", test_update_file_basic),
    munit_test("/test_update_file_different_values", test_update_file_different_values),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("update_file", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
void update_file(int filedata[200], int new_filetype, int new_num_lines);
```

```exercise.c
#include "exercise.h"

void update_file(int filedata[200], int new_filetype, int new_num_lines){
  filedata[1] = new_num_lines;
  filedata[2] = new_filetype;
  filedata[199] = 0;
}
```

# CH3: Pointers | L9: Arrays As Pointers in C
Arrays As Pointers in C

In C, arrays and pointers are closely related. An array name acts as a pointer to the first element of the array. That means array indexing and pointer arithmetic can be used interchangeably to access array elements. Let’s go through this step-by-step to understand how this works.
Step-by-Step Walkthrough

    Array Declaration:

int numbers[5] = {1, 2, 3, 4, 5};

Here, numbers is an array of 5 integers.

    Array as Pointer:

The name numbers acts as a pointer to the first element of the array.

int *numbers_ptr = numbers;

numbers_ptr is a pointer to the same place as numbers.

    Accessing Elements via Indexing:

// Access the third element (index 2)
int value = numbers[2];

Which is the same as:

int value = *(numbers + 2);

Here, numbers + 2 computes the address of the third element, and * dereferences it to get the value.

    Pointer Arithmetic:

When you add an integer to a pointer, the resulting pointer is offset by that integer times the size of the data type.

int *p = numbers + 2;  // p points to the third element
int value = *p;        // value is 3

Diagram Explanation

Let’s assume numbers is stored starting at memory address 0x1000. An integer is typically 4 bytes in C. Here’s how the array elements are laid out in memory:
| Address |   Element  | Value |
|:-------:|:----------:|:-----:|
| 0x1000  | numbers[0] | 1     |
| 0x1004  | numbers[1] | 2     |
| 0x1008  | numbers[2] | 3     |
| 0x100C  | numbers[3] | 4     |
| 0x1010  | numbers[4] | 5     |


Accessing Elements Using Pointers
- numbers + 0 or &numbers[0] points to 0x1000
- numbers + 1 or &numbers[1] points to 0x1004
- numbers + 2 or &numbers[2] points to 0x1008
- numbers + 3 or &numbers[3] points to 0x100C
- numbers + 4 or &numbers[4] points to 0x1010

Example Code

```c
#include <stdio.h>

int main() {
  int numbers[5] = {1, 2, 3, 4, 5};

  // Accessing elements using array indexing
  printf("numbers[2] = %d\n", numbers[2]);  // Output: 3

  // Accessing elements using pointers
  printf("*(numbers + 2) = %d\n", *(numbers + 2));  // Output: 3

  // Pointer arithmetic
  int *ptr = numbers;
  printf("Pointer ptr points to numbers[0]: %d\n", *ptr);  // Output: 1
  ptr += 2;
  printf("Pointer ptr points to numbers[2]: %d\n", *ptr);  // Output: 3

  return 0;
}
```

These two statements are the same:
`arr[4]. *(arr + 4)`

# CH3: Pointers | L10: Multibyte Arrays
If we create an array of structs it gets crazy because we can access and manipulate the elements using either indexing or pointer arithmetic. Let’s see how multi-byte width structures are managed in memory.

First, let’s say we’re working with our familiar Coordinate struct:

```c
typedef struct Coordinate {
  int x;
  int y;
  int z;
} coordinate_t;
```

We can declare an array of 3 Coordinate structs like so:

```c
coordinate_t points[3] = {
  {1, 2, 3},
  {4, 5, 6},
  {7, 8, 9}
};
```

Then we can print out the values of the second element in the array:

```c
printf("points[1].x = %d, points[1].y = %d, points[1].z = %d\n",
  points[1].x, points[1].y, points[1].z
);
// points[1].x = 4, points[1].y = 5, points[1].z = 6
```

Or we can use a pointer:

```c
coordinate_t *ptr = points;
printf("ptr[1].x = %d, ptr[1].y = %d, ptr[1].z = %d\n",
  (ptr + 1)->x, (ptr + 1)->y, (ptr + 1)->z
);
// ptr[1].x = 4, ptr[1].y = 5, ptr[1].z = 6
```

Memory Layout

Assuming each int is 4 bytes, the Coordinate structure will be 12 bytes (3 * 4 bytes). Let’s assume the points array starts at memory address 0x2000.

Here is the memory layout:
| Address 	| Element 	    | Value | Offset (bytes)
|-----------|---------------|-------|----------------
| 0x2000 	| points[0].x 	| 1 	| 0             |
| 0x2004 	| points[0].y 	| 2 	| 4             |
| 0x2008 	| points[0].z 	| 3 	| 8             |
| 0x200C 	| points[1].x 	| 4 	| 12            |
| 0x2010 	| points[1].y 	| 5 	| 16            |
| 0x2014 	| points[1].z 	| 6 	| 20            |
| 0x2018 	| points[2].x 	| 7 	| 24            |
| 0x201C 	| points[2].y 	| 8 	| 28            |
| 0x2020 	| points[2].z 	| 9 	| 32            |

Accessing Elements Using Pointers
- points + 0 or &points[0] points to 0x2000
- points + 1 or &points[1] points to 0x200C (next structure, offset by 12 bytes)
- points + 2 or &points[2] points to 0x2018

# CH3: Pointers | L11: Array Casting
Let’s explore a special kind of psychopathy that’s possible in C. Let’s assume we have this array of 3 structs where each struct holds 3 integers:

```c
coordinate_t points[3] = {
  {5, 4, 1},
  {7, 3, 2},
  {9, 6, 8}
};
```

Because arrays are basically just pointers (in most cases; more on that later), and we know that structs are contiguous in memory, we can cast the array of structs to an array of integers:

`int *points_start = (int *)points;`

Then we can iterate over the known number of integers in the array of structs:

```c
for (int i = 0; i < 9; i++) {
  printf("points_start[%d] = %d\n", i, points_start[i]);
}
/*
points_start[0] = 5
points_start[1] = 4
points_start[2] = 1
points_start[3] = 7
points_start[4] = 3
points_start[5] = 2
points_start[6] = 9
points_start[7] = 6
points_start[8] = 8
*/
```

```main.c
#include "munit.h"
#include "exercise.h"

int main() {
  graphics_t graphics_array[10] = {
    {60, 1080, 1920},
    {30, 720, 1280},
    {144, 1440, 2560},
    {75, 900, 1600},
    {120, 1080, 1920},
    {60, 2160, 3840},
    {240, 1080, 1920},
    {60, 768, 1366},
    {165, 1440, 2560},
    {90, 1200, 1920}
  };
  dump_graphics(graphics_array);
  return 0;
}
```

```exercise.h
typedef struct Graphics {
  int fps;
  int height;
  int width;
} graphics_t;

void dump_graphics(graphics_t gsettings[10]);
```

```exercise.c
#include <stdio.h>
#include "exercise.h"

void dump_graphics(graphics_t gsettings[10]) {
  int *gsettings_start = (int *)gsettings;
  for (int i = 0; i < 30; i++) {
    printf("settings[%d] = %d\n", i, gsettings_start[i]);
  }
}
```

# CH3: Pointers | L12: Pointer Size
The size of an array depends on both the number of elements and the size of each element. An array is a contiguous block of memory where each element has a specific type, and therefore, a specific size.

In C, pointers are always the same size because they just represent memory addresses. The size of a pointer is determined by the architecture of the system (e.g., 32-bit or 64-bit). A pointer’s size doesn’t depend on the type of data it points to; it just holds the address of a memory location.

Pointer Example

```c
int *intPtr;
char *charPtr;
double *doublePtr;
printf("Size of int pointer: %zu bytes\n", sizeof(intPtr));
printf("Size of char pointer: %zu bytes\n", sizeof(charPtr));
printf("Size of double pointer: %zu bytes\n", sizeof(doublePtr));
// Size of int pointer: 4 bytes
// Size of char pointer: 4 bytes
// Size of double pointer: 4 bytes
```

They’re all the same size, because they’re all just 32-bit memory addresses: it doesn’t matter how much memory the value at that address takes up.

Array Example

```c
int intArray[10];
char charArray[10];
double doubleArray[10];
printf("Size of int array: %zu bytes\n", sizeof(intArray));
printf("Size of char array: %zu bytes\n", sizeof(charArray));
printf("Size of double array: %zu bytes\n", sizeof(doubleArray));
// Size of int array: 40 bytes
// Size of char array: 10 bytes
// Size of double array: 80 bytes
```

Now the sizes are different because the array type keeps track of the size of each element and the number of elements. Although an array is a pointer to the first element, it’s not just a pointer: it’s a block of memory that holds all the elements.

Note: Boot.dev runs C in the browser using WASM, which is typically a 32-bit system. If you run this code on a 64-bit system, the size of the pointers will be 8 bytes.

*Pointers* have the same size on the same system, while arrays may have different sizes.

# CH3: Pointers | L13: Arrays Decay to Pointers
So we know that arrays are like pointers, but they’re not exactly the same. Arrays allocate memory for all their elements, whereas pointers just hold the address of a memory location. In many contexts, arrays decay to pointers, meaning the array name becomes “just” a pointer to the first element of the array.
When Arrays Decay

Arrays decay when used in expressions containing pointers:

```c
int arr[5];
int *ptr = arr;          // 'arr' decays to 'int*'
int value = *(arr + 2);  // 'arr' decays to 'int*'
```

And also when they’re passed to functions… so they actually decay quite often in practice. That’s why you can’t pass an array to a function by value like you do with a struct; instead, the array name decays to a pointer.
When Arrays Don’t Decay
- sizeof Operator: Returns the size of the entire array (e.g., sizeof(arr)), not just the size of a pointer.
- & Operator Taking the address of an array with &arr gives you a pointer to the whole array, not just the first element. The type of &arr is a pointer to the array type, e.g., int (*)[5] for an int array with 5 elements.
- Initialization: When an array is declared and initialized, it is fully allocated in memory and does not decay to a pointer.

Assignment

Take a look at the main function. It declares an array of numbers core_utilization that represents the CPU utilization of each core on a system running the Sneklang interpreter. The array has 8 elements. On lines 12 and 13 it prints the size of the array and the length of the array.

Complete the core_utils_func function to print:

sizeof core_utilization in core_utils_func: X

Where X is the size of the array calculated using the sizeof operator.

Output
```console
sizeof core_utilization in main: 32
len of core_utilization: 8
sizeof core_utilization in core_utils_func: 4
```

Once you’ve completed the function, run it and take a look at the output. You’ll notice that due to the array decaying to a pointer, the reported size is the size of a pointer, not the size of the actual array.

```c
#include <stdio.h>

void core_utils_func(int core_utilization[]) {
  printf("sizeof core_utilization in core_utils_func: %zu\n", sizeof(core_utilization));
}

int main() {
  int core_utilization[] = {43, 67, 89, 92, 71, 43, 56, 12};
  int len = sizeof(core_utilization) / sizeof(core_utilization[0]);
  printf("sizeof core_utilization in main: %zu\n", sizeof(core_utilization));
  printf("len of core_utilization: %d\n", len);
  core_utils_func(core_utilization);
  return 0;
}
```

# CH3: Pointers | L14: C Strings
Since the beginning of the course we’ve been doing these shenanigans to be able to print strings:

`char *msg = "ssh terminal.shop for the best coffee";`

I told you not to worry about the weird char * syntax, but now that we understand a bit about pointers, let’s dive into it. In the example above, msg is a pointer to the first character of the string "ssh terminal.shop for the best coffee", which is a C string. C strings are:
- How we represent text in C programs
- Any number of characters (chars) terminated by a null character ('\0').
- A pointer to the first element of a character array.

It’s important to understand that most string manipulation in C is done using pointers to move around the array and the null terminator is critical for determining the end of the string. In the example above, the string "ssh terminal.shop for the best coffee" is stored in memory as an array of characters, and the null terminator '\0' is automatically added at the end.
C Strings Are Simple
- Unlike other programming languages, C strings do not store their length.
- The length of a C string is determined by the position of the null terminator ('\0').
- Functions like strlen calculate the length of a string by iterating through the characters until the null terminator is encountered.
- This lack of length storage requires careful management to avoid issues such as buffer overflows and off-by-one errors during string operations.

Pointers vs. Arrays

You can declare strings in C using either arrays or pointers:

```c
char str1[] = "Hi";
char *str2 = "Snek";
printf("%s %s\n", str1, str2);
// Output: Hi Snek
```

The output is the same. Let’s break down the memory of this example:

```c
// notice we aren't using all 50 characters
char first[50] = "Snek";
char *second = "lang!";
strcat(first, second);
printf("Hello, %s\n", first);
// Output: Hello, Sneklang!
```

The strcat function appends its second argument to the first argument. In this case, it appends "lang!" to "Snek", resulting in the output Hello, Sneklang!.

Here’s what first might look like in memory:
| ‘S’    | ‘n’    | ‘e’    | ‘k’    | ‘\0’   | ???    … ???
|--------|--------|--------|--------|--------|----------------
| 0x3000 | 0x3001 | 0x3002 | 0x3003 | 0x3004 | 0x3005 … 0x3031

NOTE! There is a bunch of garbage memory after the end of the string.

Here’s what second might look like in memory:
| ‘l’    | ‘a’    | ‘n’    | ‘g’    | ‘!’    | ‘\0’
|--------|--------|--------|--------|--------|--------
| 0x4000 | 0x4001 | 0x4002 | 0x4003 | 0x4004 | 0x4005

And first after strcat:
| ‘S’    | ‘n’    | ‘e’    | ‘k’    | ‘l’    | ‘a’    | ‘n’    | ‘g’    | ‘!’    | ‘\0’   | ???    … ???
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|----------------
| 0x3000 | 0x3001 | 0x3002 | 0x3003 | 0x3004 | 0x3005 | 0x3006 | 0x3007 | 0x3008 | 0x3009 | 0x300A … 0x3031

The strcat function appends the string "lang!" to the end of the string "Snek", but smartly uses the null terminator to know where to start appending. It doesn’t know the length of the string, but it knows where it ends.
Assignment

At Sneklang, we have a bit of “not invented here” culture. As such, we’ve decided to implement our own string concatenation function.

Complete the concat_strings function. it should append str2 to the end of str1 in place. Here are the steps:
- Find the null terminator (‘\0’) of str1
- Iterate over str2 and copy each character to the memory locations at the end of str1.
- Add a null terminator at the end of the concatenated string.

Don’t cheat and use strcat!

str1 is already allocated with enough memory to hold the concatenated string, so don’t worry about that.
Tips
- Use a while loop and a pointer dereference to see when you reach a null terminator.
- Increment your pointer with the ++ operator to move to the next character.
- You can copy a character by dereferencing and assigning the value of one pointer to another.

```main.c
#include "munit.h"
#include "exercise.h"
#include <string.h>

munit_case(RUN, test_concat_empty_strings, {
  char str1[100] = "";
  const char *str2 = "";
  concat_strings(str1, str2);
  munit_assert_string_equal(str1, "", "Concatenating two empty strings should result in an empty string");
});

munit_case(RUN, test_concat_empty_to_nonempty, {
  char str1[100] = "Hello";
  const char *str2 = "";
  concat_strings(str1, str2);
  munit_assert_string_equal(str1, "Hello", "Concatenating an empty string to a non-empty string should not change the original string");
});

munit_case(RUN, test_concat_small_strings, {
  char str1[100] = "Hello ";
  const char *str2 = "World";
  concat_strings(str1, str2);
  munit_assert_string_equal(str1, "Hello World", "Concatenating strings should work correctly");
});

munit_case(SUBMIT, test_concat_long_strings, {
  char str1[200] = "This is a longer string that ";
  const char *str2 = "will be concatenated with another long string.";
  concat_strings(str1, str2);
  munit_assert_string_equal(str1, "This is a longer string that will be concatenated with another long string.", "Concatenating longer strings should work correctly");
});

munit_case(SUBMIT, test_concat_nonempty_to_empty, {
  char str1[100] = "";
  const char *str2 = "Hello";
  concat_strings(str1, str2);
  munit_assert_string_equal(str1, "Hello", "Concatenating a string to an empty should change the original string");
});


int main() {
  MunitTest tests[] = {
    munit_test("/test_concat_empty_strings", test_concat_empty_strings),
    munit_test("/test_concat_empty_to_nonempty", test_concat_empty_to_nonempty),
    munit_test("/test_concat_small_strings", test_concat_small_strings),
    munit_test("/test_concat_long_strings", test_concat_long_strings),
    munit_test("/test_concat_nonempty_to_empty", test_concat_nonempty_to_empty),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("concat_strings", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
void concat_strings(char *str1, const char *str2);
```

```exercise.c version1
#include "exercise.h"
#include "stdio.h"
#include "stdbool.h"

bool is_end_of_string(char *str) {
  return *str == '\0';
}

void concat_strings(char *str1, const char *str2) {
  printf("\n");
  do {
    if (is_end_of_string(str1)) {
      printf("str1 ends at %p\n", *str1);
      printf("str1 ends at %d\n", *str1);
      printf("str1 ends at %p\n", str1);
      printf("str1 ends at %d\n", str1);
      do {
        if (is_end_of_string(str2)) {
          break;
        }
        *str1 = *str2;
        str1++;
        str2++;
      } while (1);
      break;
    }
    str1++;
  } while (1);
  return;
}
```

```exercise.c version2
#include "exercise.h"
#include "stdio.h"
#include "stdbool.h"

bool is_end_of_string(char *str) {
  return *str == '\0';
}

char* end_of_line_addr(char *str) {
  while (!is_end_of_string(str)) {
    str++;
  }
  return str;
}

void concat_strings(char *str1, const char *str2) {
  char *str1_end = end_of_line_addr(str1);
  do {
    *str1_end = *str2;
    str1_end++;
    str2++;
  } while (*str2 != '\0');
  return;
}
```

# CH3: Pointers | L15: C String Library
The C standard library provides a comprehensive set of functions to manipulate strings in the <string.h> header file. Here are some of the most commonly used functions:
- strcpy: Copies a string to another.

```c
char src[] = "Hello";
char dest[6];
strcpy(dest, src);
// dest now contains "Hello"
```

- strcat: Concatenates (appends) one string to another.

```c
char dest[12] = "Hello";
char src[] = " World";
strcat(dest, src);
// dest now contains "Hello World"
```

- strlen: Returns the length of a string (excluding the null terminator).

```c
char str[] = "Hello";
size_t len = strlen(str);
// len is 5
```

- strcmp: Compares two strings lexicographically.

```c
char str1[] = "Hello";
char str2[] = "World";
int result = strcmp(str1, str2);
// result is negative since "Hello" < "World"
```

- strncpy: Copies a specified number of characters from one string to another.

```c
char src[] = "Hello";
char dest[6];
strncpy(dest, src, 3);
// dest now contains "Hel"
dest[3] = '\0';
// ensure null termination
```

- strncat: Concatenates a specified number of characters from one string to another.

```c
char dest[12] = "Hello";
char src[] = " World";
strncat(dest, src, 3);
// dest now contains "Hello Wo"
```

- strchr: Finds the first occurrence of a character in a string.

```c
char str[] = "Hello";
char *pos = strchr(str, 'l');
// pos points to the first 'l' in "Hello"
```

- strstr: Finds the first occurrence of a substring in a string.

```c
char str[] = "Hello World";
char *pos = strstr(str, "World");
// pos points to "World" in "Hello World"
```

Assignment

Complete the smart_append function. It appends a src string to a dest TextBuffer struct.

It’s called a “smart” append because the destination buffer is a fixed 64 bytes, and it:
- Checks for available space before appending.
- Appends as much as possible if there’s not enough space.
- Always ensures the buffer remains null-terminated.
- Returns a status indicating whether the full append was possible.

Here are the steps:
- If either input is NULL, return 1 (failure).
- Create a constant to represent the max buffer size of 64.
- Get the length of the src string using strlen.
- Calculate the remaining space in the dest buffer. Notice that it stores its own length. Don’t forget to account for the null terminator (it doesn’t count as part of the length).
- If the src string is larger than the remaining space:
    - Copy as much of the src string as possible to the dest buffer using strncat.
    - Update the dest buffer length to the max size, accounting for the null terminator.
    - Return 1 (failure) to indicate the full append wasn’t possible.
- Otherwise, if there’s enough space:
    - Append the entire src string to the dest buffer using strcat
    - Update the dest buffer length.
    - Return 0 (success) to indicate the full append was possible.

```main.c
#include "munit.h"
#include "exercise.h"
#include <string.h>

munit_case(RUN, test_return_1_for_null_value, {
  TextBuffer dest;
  const char* src; 
  int result = smart_append(&dest, src);
  munit_assert_int(result, ==, 1, "Should return 1 for null value");
});

munit_case(RUN, test_smart_append_empty_buffer, {
  TextBuffer dest;
  strcpy(dest.buffer, "");
  dest.length = 0;
  const char* src = "Hello";
  int result = smart_append(&dest, src);
  munit_assert_int(result, ==, 0, "Should return 0 for successful append");
  munit_assert_string_equal(dest.buffer, "Hello", "Buffer should contain 'Hello'");
  munit_assert_int(dest.length, ==, 5, "Length should be 5");
});

munit_case(SUBMIT, test_smart_append_full_buffer, {
  TextBuffer dest;
  strcpy(dest.buffer, "This is a very long string that will fill up the entire buffer.");
  dest.length = 63;
  const char* src = " Extra";
  int result = smart_append(&dest, src);
  munit_assert_int(result, ==, 1, "Should return 1 for unsuccessful append");
  munit_assert_string_equal(dest.buffer, "This is a very long string that will fill up the entire buffer.", "Buffer should remain unchanged");
  munit_assert_int(dest.length, ==, 63, "Length should remain 63");
});

munit_case(SUBMIT, test_smart_append_overflow, {
  TextBuffer dest;
  strcpy(dest.buffer, "This is a long string");
  dest.length = 21;
  const char* src = " that will fill the whole buffer and leave no space for some of the chars.";
  int result = smart_append(&dest, src);
  munit_assert_int(result, ==, 1, "Should return 1 for overflow append");
  munit_assert_string_equal(dest.buffer, "This is a long string that will fill the whole buffer and leave", "Buffer should be filled to capacity");
  munit_assert_int(dest.length, ==, 63, "Length should be 63 after overflow append");
});

int main() {
  MunitTest tests[] = {
    munit_test("/test_return_1_for_null_value", test_return_1_for_null_value),
    munit_test("/test_smart_append_empty_buffer", test_smart_append_empty_buffer),
    munit_test("/test_smart_append_full_buffer", test_smart_append_full_buffer),
    munit_test("/test_smart_append_overflow", test_smart_append_overflow),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("smart_append", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
#include <string.h>

typedef struct {
  size_t length;
  char buffer[64];
} TextBuffer;

int smart_append(TextBuffer* dest, const char* src);
```

```exercise.c
#include <string.h>
#include "exercise.h"
#include <stdio.h>

int smart_append(TextBuffer* dest, const char* src) {
  if (dest == NULL || src == NULL) {
    return 1;
  }
  const int max_buffer_size = 64;
  int src_len = strlen(src);
  int remaining_space = dest->length == 0 ? max_buffer_size : max_buffer_size - dest->length - 1;
  if (src_len > remaining_space) {
    strncat(dest->buffer, src, remaining_space);
    dest->length = 63;
    return 1; // wasn't possible to append whole string
  } else {
    strcat(dest->buffer, src);
    dest->length += src_len;
    return 0; // success, the full append was possible
  }
}
```

# CH3: Pointers | L16: Forward Declaration
Sometimes you have a struct that may need to reference itself, or be used recursively.

For example, consider a Node struct that can contain other Nodes. This might be useful for building a linked list or a tree:

```
typedef struct Node {
  int value;
  node_t *next;
} node_t;
```

The problem here is that node_t is not defined yet, so the compiler will complain. To fix this, we can add a forward declaration:

```c
typedef struct Node node_t;

typedef struct Node {
  int value;
  node_t *next;
} node_t;
```

Note that the forward declaration must match the eventual definition, so you can’t do something like this:

```c
typedef struct Node node_t;

typedef struct BadName {
  int value;
  node_t *next;
} node_t;
```

```main.c
#include "munit.h"
#include <string.h>
#include "exercise.h"

munit_case(RUN, test_new_node_simple, {
  snekobject_t node = new_node("root");
  munit_assert_string_equal(node.name, "root", "Node name should be 'root'");
  munit_assert_null(node.child, "Child should be NULL for a new node");
});

munit_case(RUN, test_new_node_empty_name, {
  snekobject_t node = new_node("");
  munit_assert_string_equal(node.name, "", "Node name should be an empty string");
  munit_assert_null(node.child, "Child should be NULL for a new node");
});

munit_case(SUBMIT, test_new_node_with_child, {
  snekobject_t child = new_node("child");
  snekobject_t parent = new_node("parent");
  parent.child = &child;

  munit_assert_string_equal(parent.name, "parent", "Parent node name should be 'parent'");
  munit_assert_not_null(parent.child, "Parent's child should not be NULL");
  munit_assert_string_equal(parent.child->name, "child", "Child node name should be 'child'");
  munit_assert_null(parent.child->child, "Child's child should be NULL");
});

munit_case(SUBMIT, test_new_node_nested_children, {
  snekobject_t grandchild = new_node("grandchild");
  snekobject_t child = new_node("child");
  snekobject_t parent = new_node("parent");

  child.child = &grandchild;
  parent.child = &child;

  munit_assert_string_equal(parent.name, "parent", "Parent node name should be 'parent'");
  munit_assert_not_null(parent.child, "Parent's child should not be NULL");
  munit_assert_string_equal(parent.child->name, "child", "Child node name should be 'child'");
  munit_assert_not_null(parent.child->child, "Child's child should not be NULL");
  munit_assert_string_equal(parent.child->child->name, "grandchild", "Grandchild node name should be 'grandchild'");
  munit_assert_null(parent.child->child->child, "Grandchild's child should be NULL");
});

int main() {
  MunitTest tests[] = {
    munit_test("/test_new_node_simple", test_new_node_simple),
    munit_test("/test_new_node_empty_name", test_new_node_empty_name),
    munit_test("/test_new_node_with_child", test_new_node_with_child),
    munit_test("/test_new_node_nested_children", test_new_node_nested_children),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("new_node", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.c
#include <stdlib.h>

#include "exercise.h"

snekobject_t new_node(char *name) {
  snekobject_t node = {
    .name = name,
    .child = NULL
  };
  return node;
}
```

```exercise.h
typedef struct SnekObject snekobject_t;

typedef struct SnekObject {
  char *name;
  snekobject_t *child;
} snekobject_t;

snekobject_t new_node(char *name);
```

# CH3: Pointers | L17: Mutual Structs
Forward declarations can also be used when two structs reference each other (a circular reference). For example, a Person has a Computer and a Computer has a Person:

```c
typedef struct Computer computer_t;
typedef struct Person person_t;

struct Person {
  char *name;
  computer_t *computer;
};

struct Computer {
  char *brand;
  person_t *owner;
};
```

Assignment

Complete the definitions of the Employee and Department structs. Take a look at the implementations in the .c file to understand how they should be defined.

```main.c
#include "munit.h"
#include "exercise.h"
#include <string.h>

munit_case(RUN, test_assign_employee1, {
  employee_t emp = create_employee(2, "CEO Dax");
  department_t dept = create_department("C Suite");
  assign_employee(&emp, &dept);
  munit_assert_string_equal(emp.department->name, "C Suite", "should match names");
});

munit_case(RUN, test_assign_manager1, {
  employee_t manager = create_employee(3, "Influencer Prime");
  department_t dept = create_department("Marketing");
  assign_manager(&dept, &manager);
  munit_assert_string_equal(dept.manager->name, "Influencer Prime", "should match names");
});

munit_case(SUBMIT, test_assign_employee2, {
  employee_t emp = create_employee(4, "Vegan Intern Adam");
  department_t dept = create_department("Marketing");
  assign_employee(&emp, &dept);
  munit_assert_string_equal(emp.department->name, "Marketing", "should match names");
});

munit_case(SUBMIT, test_assign_manager2, {
  employee_t manager = create_employee(5, "CDO David");
  department_t dept = create_department("C Suite");
  assign_manager(&dept, &manager);
  munit_assert_string_equal(dept.manager->name, "CDO David", "should match names");
  munit_assert_int(manager.id, ==, 5, "should match ids");
});

int main() {
  MunitTest tests[] = {
    munit_test("/test_assign_employee1", test_assign_employee1),
    munit_test("/test_assign_manager1", test_assign_manager1),
    munit_test("/test_assign_employee2", test_assign_employee2),
    munit_test("/test_assign_manager2", test_assign_manager2),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("employee_department_tests", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.c
#include "exercise.h"

employee_t create_employee(int id, char *name) {
  employee_t emp = {
    .id = id,
    .name = name,
    .department = NULL
  };
  return emp;
}

department_t create_department(char *name) {
  department_t dept = {
    .name = name,
    .manager = NULL
  };
  return dept;
}

void assign_employee(employee_t *emp, department_t *department) {
  emp->department = department;
}

void assign_manager(department_t *dept, employee_t *manager) {
  dept->manager = manager;
}
```

```exercise.h
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Employee employee_t;
typedef struct Department department_t;

struct Employee {
  int id;
  char *name;
  department_t *department;
};

struct Department {
  char *name;
  employee_t *manager;
};

employee_t create_employee(int id, char *name);
department_t create_department(char *name);

void assign_employee(employee_t *emp, department_t *department);
void assign_manager(department_t *dept, employee_t *manager);
```
