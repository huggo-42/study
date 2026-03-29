
# What is a pointer

To understand what a pointers is, we need to first understand how memory works.

## Memory

- Address: location of the memory, where that memory lives
- Value: the data stored at that location

|  Address  |  Value  |
|-----------|---------|
|   0x1000  |     4   |
|   0x1004  |  0x1000 |
|   0x1008  |         |
|   0x100C  |         |
|   0x1010  |         |
|   0x1014  |         |
|   0x1018  |         |

First line as example:
- value 4 lives at 0x1000 (hex one thousand)
- `int x = 4;`

Second line as example:
- What happens if we put the address 0x1000 at 0x1004?
    - That's a pointer
    - `int *pX = &x;`

```c
int x = 4;

int *pX = &x;
// &x -> & means "address" of
// *pX -> the * means it's not of type int, but of type pointer to int

int y = *pX;
// *pX -> dereference pX (since pX is a pointer, get the value)
```

# Pointer syntax
```example.c
struct Person {
	char name[64];
	int age;
};

void updateStruct(struct Person *p, int age) { p->age = age; }

void main2(int argc, char **argv)
{
	struct Person johnDoe;
	updateStruct(&johnDoe, 42);
};
```

```example.c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
	char *heapMemory = malloc(100);
	if (NULL == heapMemory) {
		perror("malloc failed");
	}

	return 0;
}
```

# Why use pointers
- Reduce the amount of space used by not copying
- Static versus Dynamic memory allocation
    - Static allocation: typically a variable that goes on to the stack, a place
    that is always in scope for the function that is running it.
    - Dynamic allocations: come from the heap through malloc or sbreak???, or
    other kinds of memory allocators, we're going to get a point to memory that
    is out of scope


The primary difference between Static and Dynamic allocations:
- Static: things that have a fixed size known at compile time
- Dynamic: can be changed in size as the program runs

