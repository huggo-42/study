# CH5: Unions | L1: Union
Now that we understand structs and enums, we can learn aboutunions: a combination of the two concepts.

This is not the kind of union that $300k-earning Google employees fight for because they are “underpaid” and “don’t have enough oat milk in the office kitchen”. No, this feature is one that even Golang doesn’t have (probably because they were worried about getting fired from Google for just mentioning the word!)

Unions in C can hold one of several types. They’re like a less-strict sum type from the world of functional programming. Here’s an example union:

```c
typedef union AgeOrName {
  int age;
  char *name;
} age_or_name_t;
```

The age_or_name_t type can hold either an int or a char *, but not both at the same time (that would be a struct). We provide the list of possible types so that the C compiler knows the maximum potential memory requirement, and can account for that. This is how the union is used:

```c
age_or_name_t lane = { .age = 29 };
printf("age: %d\n", lane.age);
// age: 29
```

Here’s where it gets interesting. What happens if we try to access the name field (even though we set the age field)?

```c
printf("name: %s\n", lane.name);
// name:
```

We get… nothing? To be more specific, we get undefined behavior. A union only reserves enough space to hold the largest type in the union and then all of the fields use the same memory. So when we set .age to 29, we are writing the integer representation of 29 to the memory of the lane union:

0000 0000 0000 0000 0000 0000 0001 1101

Then if we try to access .name, we read from the same block of memory but try to interpret the bytes as a char *, which is why we get garbage (which is interpreted as nothing in this case). Put simply, setting the value of .age overwrites the value of .name and vice versa, and you should only access the field that you set.

Assignment

Sneklang is going to need objects. We’ll hand-code those objects, and Sneklang developers will use them to store dynamic variables, kinda like Python. Everything is an object, even simple integers and strings!

Take a look at the SnekObject struct in exercise.h. It has a kind field that stores the type of the object (like INTEGER or STRING) and a data field that stores the actual data.
- Create a snek_object_kind_t enum type in exercise.h. It’s the one used as the kind field of the provided SnekObject. It’s an enum that can be an INTEGER (0) or a STRING (1).
- Complete the format_object function in exercise.c that uses a switch on the .kind of a snek_object_t and writes a formatted string to the associated buffer.

- For an integer, write int:n to the buffer, replacing n with the integer value
- For a string, write string:str to the buffer, replacing str with the string value

You can use sprintf to write the formatted string to the buffer

```main.c
#include <stdio.h>

#include "exercise.h"
#include "munit.h"

munit_case(RUN, test_formats_int1, {
  char buffer[100];
  snek_object_t i = new_integer(5);
  format_object(i, buffer);

  assert_string_equal("int:5", buffer, "formats INTEGER");
});

munit_case(RUN, test_formats_string1, {
  char buffer[100];
  snek_object_t s = new_string("Hello!");
  format_object(s, buffer);

  assert_string_equal("string:Hello!", buffer, "formats STRING");
});

munit_case(SUBMIT, test_formats_int2, {
  char buffer[100];
  snek_object_t i = new_integer(2014);
  format_object(i, buffer);

  assert_string_equal("int:2014", buffer, "formats INTEGER");
});

munit_case(SUBMIT, test_formats_string2, {
  char buffer[100];
  snek_object_t s = new_string("nvim btw");
  format_object(s, buffer);

  assert_string_equal("string:nvim btw", buffer, "formats STRING");
});

int main() {
  MunitTest tests[] = {
    munit_test("/integer", test_formats_int2),
    munit_test("/string", test_formats_string2),
    munit_test("/integer_nvim", test_formats_int1),
    munit_test("/string_nvim", test_formats_string1),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("format", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```exercise.h
typedef enum {
  INTEGER = 0,
  STRING = 1,
} snek_object_kind_t;

// don't touch below this line'

typedef union SnekObjectData {
  int v_int;
  char *v_string;
} snek_object_data_t;

typedef struct SnekObject {
  snek_object_kind_t kind;
  snek_object_data_t data;
} snek_object_t;

snek_object_t new_integer(int);
snek_object_t new_string(char *str);
void format_object(snek_object_t obj, char *buffer);
```

```exercise.c
#include <stdio.h>

#include "exercise.h"

void format_object(snek_object_t obj, char *buffer) {
  switch (obj.kind) {
    case INTEGER:
      sprintf(buffer, "int:%d", obj.data.v_int);
      break;
    case STRING:
      sprintf(buffer, "string:%s", obj.data.v_string);
      break;
    default:
      break;
  }
}

// don't touch below this line'

snek_object_t new_integer(int i) {
  return (snek_object_t){
    .kind = INTEGER,
    .data = {.v_int = i}
  };
}

snek_object_t new_string(char *str) {
  // NOTE: We will learn how to copy this data later.
  return (snek_object_t){
    .kind = STRING,
    .data = {.v_string = str}
  };
}
```

# CH5: Unions | L2: Memory Layout
Unions store their value in the same memory location, no matter which field or type is actively being used. That means that accessing any field apart from the one you set is generally a bad idea.
Assignment

Take a look at the val_or_err_t union. It represents either an integer value or an unsigned (non-negative) integer error code.

1. Run the code in its current state.

Notice that the .value field is set to -420, then the data in each field is printed. The .value field works as you’d expect, printing -420. However, the .error field prints 4294966876! It’s trying to interpret the bytes of -420 as an unsigned integer, which results in a very large number.

2. Uncomment the next block of code, and run it without submitting.

Notice that now we set the .err field (an unsigned integer) to UINT_MAX, which is a constant representing the largest possible unsigned integer (4294967295 in my case). As expected, the .err field prints 4294967295. However, the .value field prints -1! It’s interpreting the bytes that represent 4294967295 as an unsigned integer as a signed integer, which is -1.

Submit the fully uncommented code.

```c
#include <stdio.h>

#include "limits.h"
#include "munit.h"

typedef union {
  int value;
  unsigned int err;
} val_or_err_t;

int main() {
  val_or_err_t lanes_score = {
    .value = -420
  };
  printf("value (set): %d\n", lanes_score.value);
  printf("err (unset): %u\n", lanes_score.err);

  val_or_err_t teejs_score = {
    .err = UINT_MAX
  };
  printf("value (unset): %d\n", teejs_score.value);
  printf("err (set): %u\n", teejs_score.err);
}
```

# CH5: Unions | L3: Union Size
A downside of unions is that the size of the union is the size of the largest field in the union. Take this example:

```c
typedef union IntOrErrMessage {
  int data;
  char err[256];
} int_or_err_message_t;
```

This IntOrErrMessage union is designed to hold an int 99% of the time. However, when the program encounters an error, instead of storing an integer here, it will store an error message. The trouble is that it’s incredibly inefficient because it allocates 256 bytes for every int that it stores!

Imagine an array of 1000 int_or_err_message_t objects. Even if none of them make use of the .err field, the array will take up 256 * 1000 = 256,000 bytes of memory! An array of ints would have only taken 4,000 bytes (assuming 32-bit integers).

Quiz Examples

Assume the following:
- sizeof(int) = 4
- sizeof(char) = 1
- sizeof(long int) = 8

```c
union SensorData {
  long int temperature;
  long int humidity;
  long int pressure;
};
```

```c
union PacketPayload {
  char text[256];
  unsigned char binary[256];
  struct ImageData {
    int width;
    int height;
    unsigned char data[1024];
  } image;
};
```

```c
union Item {
  struct {
    int damage;
    int range;
    int size;
  } weapon;
  struct {
    int healingAmount;
    int duration;
  } potion;
  struct {
    int doorID;
  } key;
};
```

Q: How many bytes will an instance of SensorData require?
A: 8

# CH5: Unions | L4: Union Size
A downside of unions is that the size of the union is the size of the largest field in the union. Take this example:

```c
typedef union IntOrErrMessage {
  int data;
  char err[256];
} int_or_err_message_t;
```

This IntOrErrMessage union is designed to hold an int 99% of the time. However, when the program encounters an error, instead of storing an integer here, it will store an error message. The trouble is that it’s incredibly inefficient because it allocates 256 bytes for every int that it stores!

Imagine an array of 1000 int_or_err_message_t objects. Even if none of them make use of the .err field, the array will take up 256 * 1000 = 256,000 bytes of memory! An array of ints would have only taken 4,000 bytes (assuming 32-bit integers).

Quiz Examples

Assume the following:
- sizeof(int) = 4
- sizeof(char) = 1
- sizeof(long int) = 8

```c
union SensorData {
  long int temperature;
  long int humidity;
  long int pressure;
};
```

```c
union PacketPayload {
  char text[256];
  unsigned char binary[256];
  struct ImageData {
    int width;
    int height;
    unsigned char data[1024];
  } image;
};
```

```c
union Item {
  struct {
    int damage;
    int range;
    int size;
  } weapon;
  struct {
    int healingAmount;
    int duration;
  } potion;
  struct {
    int doorID;
  } key;
};
```

Q: How many bytes will an instance of SensorData require?
A: 8

# CH5: Unions | L4: 

Q: Which is the correct order, from least to greatest, of the memory requirements of the given unions?
A: SensorData, Item, PacketPayload

# CH5: Unions | L5: Helper Fields
One interesting (albeit not commonly used) trick is to use unions to create “helpers” for accessing different parts of a piece of memory. Consider the following:

```c
typedef union Color {
  struct {
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
  } components;
  uint32_t rgba;
} color_t;
```

It results in a memory layout like this:

![](CH5_Unions_L5_HelperFields_1.png)

Only 4 bytes are used. And, unlike in 99% of scenarios, it makes sense to both set and get values from this union through both the components and rgba fields! Both fields in the union are exactly 32 bits in size, which means that we can “safely” (?) access the entire set of colors through the .rgba field, or get a single color component through the .components field.

The convenience of additional fields, with the efficiency of a single memory location!

> and the fragility of C…

Assignment

Sneklang has support for networking!

Complete the PacketHeader union. It should have two potential fields:
- tcp_header: A struct. The first 2 bytes are the src_port. The next 2 bytes are the dest_port, and the last 4 bytes are the seq_num.
- raw: An array of 8 bytes.

Use uint8_t, uint16_t, and uint32_t for the types of the fields, based on the number of bytes needed. Remember, 8 bits = 1 byte.
