# CH6: Stack and Heap | L1: The Stack
Remember how I told you that memory is basically just a giant array of bytes with addresses at various offsets?

That’s true, but it also has some additional structure. In particular, memory is divided into two main regions: the stack and the heap. We’ll cover the heap later.

The stack is where local variables are stored. When a function is called, a new stack frame is created in memory to store the function’s parameters and local variables. When the function returns, its entire stack frame is deallocated.

The stack is aptly named: it is a stack (the “Last In, First Out” data structure) of memory frames. Each time a function is called, a new frame is pushed onto the stack. When the function returns, its frame is popped off the stack.

Take a look at this example function:

```c
void create_typist(int uses_nvim) {
  int wpm = 150;
  char name[4] = {'t', 'e', 'e', 'j'};
}
```

Say we call create_typist(1). Before the call, our stack memory might look like this, with the next memory address to be used 0x0004:

![](CH6_StackAndHeap_L1_TheStack_1.png)

Once called, the stack pointer is moved to make room for:
- The return address (to pick up execution after the function returns)
- Arguments to the function
- Local variables in the function body

![](CH6_StackAndHeap_L1_TheStack_2.png)

and the local variables are stored in the stack frame:

![](CH6_StackAndHeap_L1_TheStack_3.png)

When the function returns, the stack frame is deallocated by resetting the stack pointer to where the frame began.

Assignment
1. Run the code in its current state.
See how with each successive nested function call (printMessageOne, which calls printMessageTwo, which calls printMessageThree) the memory addresses allocate more and more space?
2. Update where printMessageTwo and printMessageThree are called from so that all three of the functions use the same stack space.
The offsets printed by printStackPointerDiff should now be different from before. The printStackPointerDiff() calls should remain at the start of each function.

Tip
The print message functions should not call each other because that creates a new stack frame on top of the existing one. They should be called sequentially from the main function.

```exercise.h
void printMessageOne();
void printMessageTwo();
void printMessageThree();
void printStackPointerDiff();
```

```main.c
#include <stdio.h>
#include "exercise.h"

int main() {
  printMessageOne();
  printMessageTwo();
  printMessageThree();
  return 0;
}

void printMessageOne() {
  const char *message = "Dark mode?\n";
  printStackPointerDiff();
  printf("%s\n", message);
  // printMessageTwo();
}

void printMessageTwo() {
  const char *message = "More like...\n";
  printStackPointerDiff();
  printf("%s\n", message);
  // printMessageThree();
}

void printMessageThree() {
  const char *message = "dark roast.\n";
  printStackPointerDiff();
  printf("%s\n", message);
}

// don't touch below this line

void printStackPointerDiff() {
  static void *last_sp = NULL;
  void *current_sp;
  current_sp = __builtin_frame_address(0);
  long diff = (char*)last_sp - (char*)current_sp;
  if (last_sp == NULL){
    last_sp = current_sp;
    diff = 0;
  }
  printf("---------------------------------\n");
  printf("Stack pointer offset: %ld bytes\n", diff);
  printf("---------------------------------\n");
}
```

> BTW: that's a common problem when talking about recursion, for example, the
fibonacci sequence. The recursive function calls itself, creating a new stack
frame each time. This can lead to a stack overflow if the recursion goes too
deep.

# CH6: Stack and Heap | L2: Why a Stack?
Allocating memory on the stack is preferred when possible because the stack is faster and simpler than the heap (which we’ll get to, be patient):
- Efficient Pointer Management: Stack “allocation” is just a quick increment or decrement of the stack pointer, which is extremely fast. Heap allocations require more complex bookkeeping.
- Cache-Friendly Memory Access: Stack memory is stored in a contiguous block, enhancing cache performance due to spatial locality.
- Automatic Memory Management: Stack memory is managed automatically as functions are called and as they return.
- Inherent Thread Safety: Each thread has its own stack. Heap allocations require synchronization mechanisms when used concurrently, potentially introducing overhead.

One reason Go programs are efficient is that Go uses stack allocation for variables when possible, much like C. The Go compiler performs escape analysis to decide whether a variable can be allocated on the stack. On the other hand, languages like Python allocate most objects on the heap, which can impact performance.

Q: Generally speaking, it's more performant to store a variable's data on...?
A: The Stack

# CH6: Stack and Heap | L3: Stack Overflow
So the stack is great and all, but one of the downsides is that it has a limited size. If you keep pushing frames onto the stack without popping them off, you’ll eventually run out of memory and get a stack overflow. (yes, that’s what the famous site is named after)

That’s one of the reasons recursion without tail-call optimization can be dangerous. Each recursive call pushes a new frame onto the stack, and if you have too many recursive calls, you’ll run out of stack space.
Assignment

Sneklang is admittedly a fairly inefficient language (don’t tell the VC investors!). Sometimes, rather than carefully managing memory, the Sneklang interpreter allocates a big chunk of stack data - simply because the creators (us) are too lazy to allocate the right amount.

Anyhow, the BDFL of Sneklang has allowed this laziness, but only to a maximum amount of 10 kibibyte. A single kibibyte is 1024 bytes.
- Run the code in its current state. You should get a stack overflow which will cause a segmentation fault.
- Fix the pool_size so that it allocates exactly 10 kibibyte.

```main.c
#include <stdio.h>

int main() {
  const int pool_size = 1024 * 10;
  char snek_pool[pool_size];
  snek_pool[0] = 's';
  snek_pool[1] = 'n';
  snek_pool[2] = 'e';
  snek_pool[3] = 'k';
  snek_pool[4] = '\0';

  printf("Size of pool: %d\n", pool_size);
  printf("Initial string: %s\n", snek_pool);
  return 0;
}
```

# CH6: Stack and Heap | L4: Pointers to the Stack
So we know that stack frames are always getting pushed and popped, and as a result, memory addresses on the stack are always changing and getting reused.

Remember: the stack is only safe to use within the context of the current function!

Assignment

Let’s get back to Sneklang’s built in 2D graphics library. Take a look at the new_coord function. It accepts an x and y value and creates a new pointer to a stack-allocated coord_t struct.
- Run the code in its current state. You should see something… weird. Why don’t the x and y values match the ones passed in on lines 16-18???

Because we’re accessing stack memory (the pointer created on line 12) outside of the function that created it, the memory has been deallocated and is no longer safe to use. Technically the behavior is undefined, but it’s likely that in this specific scenario you’re just seeing it get overwritten by the next function call (thus 50 and 60 always print).
- Fix the new_coord function so that it returns a struct, not a pointer to a struct. This will force the compiler to copy the struct to the main function’s stack frame, and the memory will be safe to use. You’ll have to update syntax in a few places to accomodate the change.

```old.c
#include <stdio.h>

typedef struct {
  int x;
  int y;
} coord_t;

coord_t *new_coord(int x, int y) {
  coord_t c;
  c.x = x;
  c.y = y;
  return &c;
}

int main() {
  coord_t *c1 = new_coord(10, 20);
  coord_t *c2 = new_coord(30, 40);
  coord_t *c3 = new_coord(50, 60);

  printf("c1: %d, %d\n", c1->x, c1->y);
  printf("c2: %d, %d\n", c2->x, c2->y);
  printf("c3: %d, %d\n", c3->x, c3->y);
}
```

```main.c
#include <stdio.h>

typedef struct {
  int x;
  int y;
} coord_t;

coord_t new_coord(int x, int y) {
  coord_t c;
  c.x = x;
  c.y = y;
  return c;
}

int main() {
  coord_t c1 = new_coord(10, 20);
  coord_t c2 = new_coord(30, 40);
  coord_t c3 = new_coord(50, 60);

  printf("c1: %d, %d\n", c1.x, c1.y);
  printf("c2: %d, %d\n", c2.x, c2.y);
  printf("c3: %d, %d\n", c3.x, c3.y);
}
```

# CH6: Stack and Heap | L5: The Heap
Stack - size is know ahead of time and can exist within one function.
Heap - size is unknown ahead of time or return value isn't limited to one function.

Your browser does not support playing HTML5 video. You can instead. Here is a description of the content: best place to store in memory data

“The heap”, as opposed to “the stack”, is a pool of long-lived memory shared across the entire program. Stack memory is automatically allocated and deallocated as functions are called and return, but heap memory is allocated and deallocated as-needed, independent of the burdensome shackles of function calls.

When you need to store data that outlives the function that created it, you’ll send it to the heap. The heap is called “dynamic memory” because it’s allocated and deallocated as needed. Take a look at new_int_array:

```c
int *new_int_array(int size) {
  int *new_arr = (int*)malloc(size * sizeof(int)); // Allocate memory
  if (new_arr == NULL) {
    fprintf(stderr, "Memory allocation failed\n");
    exit(1); // Exit if allocation fails
  }
  return new_arr;
}
```

Because the size of the array isn’t known at compile time, we can’t put it on the stack. Instead, we allocate memory on the heap using the <stdlib.h>'s malloc function. It takes a number of bytes to allocate as an argument (size * sizeof(int)) and returns a pointer to the allocated memory (a void * that we cast to an int*). Here’s a diagram of what happened in memory:

![](CH6_StackAndHeap_L5_TheHeap_1.png)

The new_int_array function’s size argument is just an integer, it’s pushed onto the stack. Assuming size is 6, when malloc is called we’re given enough memory to store 6 integers on the heap, and we’re given the address of the start of that newly allocated memory. We store it in a new local variable called new_arr. The address is stored on the stack, but the data it points to is in the heap.

Let’s look at some code that uses new_int_array:

```c
int* arr_of_6 = new_int_array(6);
arr_of_6[0] = 69;
arr_of_6[1] = 42;
arr_of_6[2] = 420;
arr_of_6[3] = 1337;
arr_of_6[4] = 7;
arr_of_6[5] = 0;
```

The data is stored in the heap:

![](CH6_StackAndHeap_L5_TheHeap_2.png)

When we’re done with the memory, we need to manually deallocate it using the <stdlib.h>'s free function:

`free(arr_of_6);`

![](CH6_StackAndHeap_L5_TheHeap_3.png)

The free function returns (deallocates) that memory for use elsewhere. It’s important to note that the pointer (arr_of_6) still exists, but shouldn’t be used. It’s a “dangling pointer”, pointing to deallocated memory.
Assignment

Run the get_full_greeting function in its current state. If you take a look at the main.c file, you’ll notice that it’s testing to ensure that a pointer to stack memory isn’t returned (which you never should do, because it’s undefined behavior).

Fix the get_full_greeting function so that it allocates memory on the heap and returns a pointer to that memory.

```main.c
#include "munit.h"
#include <string.h>
#include <stdbool.h>
#include "exercise.h"

// Helper function to check if a pointer is on the stack
bool is_on_stack(void *ptr) {
  void *stack_top = __builtin_frame_address(0);
  uintptr_t stack_top_addr = (uintptr_t)stack_top;
  uintptr_t ptr_addr = (uintptr_t)ptr;

  // Check within a threshold in both directions (e.g., 1MB)
  uintptr_t threshold = 1024;

  return ptr_addr >= (stack_top_addr - threshold) && ptr_addr <= (stack_top_addr + threshold);
}

munit_case(RUN, test_basic_greeting, {
  char *result = get_full_greeting("Hello", "Alice", 20);
  munit_assert_string_equal(result, "Hello Alice", "Basic greeting should be correct");
  munit_assert_false(is_on_stack(result));
  free(result);
});

munit_case(SUBMIT, test_short_buffer, {
  char *result = get_full_greeting("Hey", "Bob", 4);
  munit_assert_string_equal(result, "Hey", "Should truncate to fit buffer");
  munit_assert_false(is_on_stack(result));
  free(result);
});


int main() {
  MunitTest tests[] = {
    munit_test("/test_basic_greeting", test_basic_greeting),
    munit_test("/test_short_buffer", test_short_buffer),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("get_full_greeting", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
char* get_full_greeting(char *greeting, char *name, int size);
```

```exercise.c
#include <stdio.h>
#include <stdlib.h>
#include "exercise.h"

char *get_full_greeting(char *greeting, char *name, int size) {
  char *full_greeting_ptr = (int*)malloc(size * sizeof(char));
  if (full_greeting_ptr == NULL) {
    fprintf(stderr, "Memory allocation failed\n");
    exit(1);
  }
  snprintf(full_greeting_ptr, size, "%s %s", greeting, name);
  return full_greeting_ptr;
}
```

# CH6: Stack and Heap | L6: Malloc
The malloc function (memory allocation) is a standard library function in C that allocates a specified number of bytes of memory on the heap and returns a pointer to the allocated memory.

This new memory is uninitialized, which means:
- It contains whatever data was previously at that location.
- It is the programmer’s responsibility to ensure that the allocated memory is properly initialized and eventually freed using free to avoid memory leaks.

If you want to make sure that the memory is properly initialized, you can use the calloc function, which allocates the specified number of bytes of memory on the heap and returns a pointer to the allocated memory. This memory is initialized to zero (meaning it contains all zeroes).
Function Signature

`void* malloc(size_t size);`

- size: The number of bytes to allocate.
- Returns: A pointer to the allocated memory or NULL if the allocation fails.

Example Usage

```c
// Allocates memory for an array of 4 integers
int *ptr = malloc(4 * sizeof(int));
if (ptr == NULL) {
  // Handle memory allocation failure
  printf("Memory allocation failed\n");
  exit(1);
}
// use the memory here
// ...
free(ptr);
```

Manual Memory Management

This idea of manually calling malloc and free is what puts the “manual” in “manually managing memory”:

- The programmer must remember to eventually free the allocated memory using free(ptr) to avoid memory leaks.
- Otherwise, that allocated memory is never returned to the operating system for use by other programs. (Until the program exits, at which point the operating system will clean up after it, but that’s not ideal.)

Manually managing memory can be error-prone and tedious, but languages that automatically manage memory (like Python, Java, and C#) have their own trade-offs, usually in terms of performance.
Assignment

We’re working on some of the dynamic memory management tooling that we’ll eventually need to build a garbage collector for Sneklang.

Complete the allocate_scalar_list function. It should:
- Accept size and multiplier parameters and should allocate an array of size integers on the heap.
- Gracefully return NULL if the allocation fails.
- Initialize each element in the list to the index * multiplier. (e.g. a multiplier of 2 would result in [0, 2, 4, 6, ...])
- Return a pointer to the allocated memory.

Assume that the calling code will eventually call free on the returned pointer.

```main.c
#include "munit.h"
#include "exercise.h"

munit_case(RUN, test_allocate_scalar_list_size, {
  int size = 5;
  int multiplier = 2;
  int *result = allocate_scalar_list(size, multiplier);
  munit_assert_not_null(result, "Function should return a non-null pointer");
  free(result);
});

munit_case(RUN, test_allocate_scalar_list_values, {
  int size = 5;
  int multiplier = 2;
  int *result = allocate_scalar_list(size, multiplier);
  int expected[5];
  expected[0] = 0;
  expected[1] = 2;
  expected[2] = 4;
  expected[3] = 6;
  expected[4] = 8;
  for (int i = 0; i < size; i++) {
    munit_assert_int(result[i], ==, expected[i], "Element does not match expected value");
  }
  free(result);
});

munit_case(SUBMIT, test_allocate_scalar_list_zero_multiplier, {
  int size = 3;
  int multiplier = 0;
  int *result = allocate_scalar_list(size, multiplier);
  for (int i = 0; i < size; i++) {
    munit_assert_int(result[i], ==, 0, "All elements should be 0 with multiplier 0");
  }
  free(result);
});

munit_case(SUBMIT, test_allocate_too_much, {
  int size = 1024 * 1024 * 100;
  int multiplier = 1;
  int *result = allocate_scalar_list(size, multiplier);
  munit_assert_null(result, "Giant allocation should result in NULL");
});

int main() {
  MunitTest tests[] = {
    munit_test("/test_allocate_scalar_list_size", test_allocate_scalar_list_size),
    munit_test("/test_allocate_scalar_list_values", test_allocate_scalar_list_values),
    munit_test("/test_allocate_scalar_list_zero_multiplier", test_allocate_scalar_list_zero_multiplier),
    munit_test("/test_allocate_too_much", test_allocate_too_much),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("allocate_scalar_list", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
int *allocate_scalar_list(int size, int multiplier);
```

```exercise.c
#include <stdio.h>
#include <stdlib.h>

#include "exercise.h"

int *allocate_scalar_list(int size, int multiplier) {
  int *arr = (int*)malloc(size * sizeof(int));
  if (arr == NULL) {
    fprintf(stderr, "Memory allocation failed\n");
  }
  for (int i = 0; i < size; i++) {
    arr[i] = i * multiplier;
  }
  return arr;
}
```

# CH6: Stack and Heap | L7: Free
The free function deallocates memory that was previously allocated by malloc, calloc, or realloc.

IMPORTANT: free does not change the value stored in the memory, and it doesn’t even change the address stored in the pointer. Instead, it simply informs the Operating System that the memory can be used again.
Forgetting to free

Forgetting to call free leads to a memory leak. This means that the allocated memory remains occupied and cannot be reused, even though the program no longer needs it. Over time, if a program continues to allocate memory without freeing it, the program may run out of memory and crash.

Memory leaks are one of the most common bugs in C programs, and they can be difficult to track down because the memory is still allocated and accessible, even though it is no longer needed.
Assignment

We may be inefficient here at Sneklang, but we don’t want outright memory leaks!

Run the code in its current state. After a number of successful allocations you should get a failure. The program is running out of memory due to a leak.

See how it’s calling the allocate_scalar_list function in a loop? Well, the lists aren’t needed from loop to loop, so they should be freed at the end of each iteration. If we do that, we should be able to allocate as many lists as we want (because we return the memory in between iterations). Fix the code by freeing the allocated list at the end of each loop.

```main.c
#include <stdio.h>
#include <stdlib.h>
#include "exercise.h"

int main(){
  const int num_lists = 500;
  for (int i = 0; i < num_lists; i++) {
    int *lst = allocate_scalar_list(50000, 2);
    if (lst == NULL) {
      printf("Failed to allocate list\n");
      return 1;
    } else {
      printf("Allocated list %d\n", i);
    }
    free(lst);
  }
  return 0;
}
```

```exercise.h
int *allocate_scalar_list(int size, int multiplier);
```

```exercise.c
#include <stdlib.h>
#include "exercise.h"

int *allocate_scalar_list(int size, int multiplier) {
  int *lst = (int *)malloc(size * sizeof(int));
  if (lst == NULL) {
    return NULL;
  }
  for (int i = 0; i < size; i++) {
    lst[i] = i * multiplier;
  }
  return lst;
}
```

# CH6: Stack and Heap | L8: Big Endian and Little Endian
While we are on the topic of memory, it’s worth knowing about “endianness”. Endianness is the order in which bytes are stored in memory. The two most common formats are big endian and little endian.

Big Endian
In a big-endian system, the most significant byte is stored first, at the lowest memory address. The “most significant byte” is just a fancy way of saying “the biggest part of the number”.

Let’s say you have the hexadecimal number 0x12345678. Here’s how it would be stored in big-endian format:

![](CH6_StackAndHeap_L8_BigEndianAndLittleEndian_1.png)

The most significant byte (0x12) is stored at the lowest memory address.

Little Endian
In a little-endian system, the least significant byte (the “smallest” part of the number) is stored first, at the lowest memory address. This is the format used by most modern computers.

Using the same number 0x12345678, here’s how it would be stored in little-endian format:

![](CH6_StackAndHeap_L8_BigEndianAndLittleEndian_2.png)

Here, the least significant byte (0x78) is stored first.

For the most part, you won’t have to worry about endianness when writing programs. The way data is read from memory automatically handles this, so we can spend our valuable time building e-commerce shops for the terminal instead. Endianness becomes important in certain scenarios, like networking and working with binary files.

For now, just know that most modern systems use little-endian, and the compiler takes care of how data is stored and accessed.

Q: In a little-endian system, how would the hexadecimal number 0xA1B2C3D4 be stored in memory?
A: 0xD4, 0xC3, 0xB2, 0xA1
