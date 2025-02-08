# CH4: Enums | L1: Enums
Unlike Golang (a language living in 1970), C has explicit support for enums (enumerations) with the enum keyword.

> TJ is salty because Go is a simple, modern language that companies ackshually use to ship products. Not all programming languages can be academic thought-experiments like OCaml.

You can define a new enum type like this:

```c
typedef enum DaysOfWeek {
  MONDAY,
  TACO_TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  FUNDAY,
} days_of_week_t;
```

The typedef and its alias days_of_week_t are optional, but like with structs, they make the enum easier to use.

In the example above, days_of_week_t is a new type that can only have one of the values defined in the enum:
- MONDAY, which is 0
- TACO_TUESDAY, which is 1
- WEDNESDAY, which is 2
- THURSDAY, which is 3
- FRIDAY, which is 4
- SATURDAY, which is 5
- FUNDAY, which is 6

You can use the enum type like this:

```c
typedef struct Event {
  char *title;
  days_of_week_t day;
} event_t;

// Or if you don't want to use the alias:

typedef struct Event {
  char *title;
  enum DaysOfWeek day;
} event_t;
```

An enum is not a collection type like a struct or an array. It’s just a list of integers constrained to a new type, where each is given an explicit name.
Assignment

The Sneklang graphics library needs to represent colors.

Create a Color enum (and the color_t typedef) with RED, GREEN, and BLUE values, in that order.

```main.c
#include "munit.h"

#include "color.h"

munit_case(RUN, test_color_enum1, {
  assert_int(RED, ==, 0, "RED is defined as 0");
  assert_int(GREEN, ==, 1, "GREEN is defined as 1");
  assert_int(BLUE, ==, 2, "BLUE is defined as 2");
});

munit_case(SUBMIT, test_color_enum2, {
  assert_int(RED, !=, 4, "RED is not defined as 4");
  assert_int(GREEN, !=, 2, "GREEN is not defined as 2");
  assert_int(BLUE, !=, 0, "BLUE is not defined as 0");
});

int main() {
  MunitTest tests[] = {
    munit_test("/are_defined", test_color_enum1),
    munit_test("/are_defined_correctly", test_color_enum2),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("colors", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```color.h
typedef enum Color {
  RED,
  GREEN,
  BLUE,
} color_t;
```

# CH4: Enums | L2: Non-Default Values
Sometimes, you don’t just want to enumerate some names (where the underlying integer constant values don’t really matter)… you want to set those enumerations to specific values. For example, you might want to define a program’s exit status codes:

```c
typedef enum {
  EXIT_SUCCESS = 0,
  EXIT_FAILURE = 1,
  EXIT_COMMAND_NOT_FOUND = 127,
} ExitStatus;
```

Alternatively, you can define the first value and let the compiler fill in the rest (incrementing by 1):

```c
typedef enum {
  LANE_WPM = 200,
  PRIME_WPM, // 201
  TEEJ_WPM,  // 202
} WordsPerMinute;
```

Assignment

Update your Color enum to the following values:
- RED = 55
- GREEN = 176
- BLUE = 38

```main.c
#include "munit.h"

#include "color.h"

munit_case(RUN, test_colors_defined, {
  assert_int(RED, ==, 55, "RED is defined as 55 (nvim green!)");
  assert_int(GREEN, ==, 176, "GREEN is defined as 176 (nvim green!)");
  assert_int(BLUE, ==, 38, "BLUE is defined as 38 (nvim green!)");
});

munit_case(SUBMIT, test_colors_defined_correctly, {
  assert_int(RED, !=, 0, "RED is not defined as 0 (vsc*de blue!)");
  assert_int(GREEN, !=, 120, "GREEN is not defined as 120 (vsc*de blue!)");
  assert_int(BLUE, !=, 215, "BLUE is not defined as 215 (vsc*de blue!)");
});

int main() {
  MunitTest tests[] = {
    munit_test("/defined", test_colors_defined),
    munit_test("/defined_vscode", test_colors_defined_correctly),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("colors", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```color.h
typedef enum Color {
  RED = 55,
  GREEN = 176,
  BLUE = 38,
} color_t;
```

# CH4: Enums | L3: Switch Case
One of the best features of enums is that it can be used in switch statements. Enums + switch statements:
- Avoid “magic numbers”
- Use descriptive names
- With modern tooling, will give you an error/warning that you haven’t handled all the cases in your switch

Here’s an example:

```c
switch (logLevel) {
  case LOG_DEBUG:
    printf("Debug logging enabled\n");
    break;
  case LOG_INFO:
    printf("Info logging enabled\n");
    break;
  case LOG_WARN:
    printf("Warning logging enabled\n");
    break;
  case LOG_ERROR:
    printf("Error logging enabled\n");
    break;
  default:
    printf("Unknown log level: %d\n", logLevel);
    break;
}
```

You’ll notice that we have a break after each case. If you do not have a break, the next case will still execute: it “falls through” to the next case. Many devs have written bugs when using switch statements, because they forgot to add break.

In some rare cases, you might want the fallthrough:

```c
switch (errorCode) {
  case 1:
  case 2:
  case 3:
    // 1, 2, and 3 are all minor errors
    printf("Minor error occurred. Please try again.\n");
    break;
  case 4:
  case 5:
    // 4 and 5 are major errors
    printf("Major error occurred. Restart required.\n");
    break;
  default:
    printf("Unknown error.\n");
    break;
}
```

But usually, it’s a footgun. You’ll almost always want a break at the end of each case statement.

Assignment
Complete the http_to_str function. Given the enum defined in http.h, it should return a hard-coded string (char *) with the human-readable version of the HTTP status code:
- HTTP_BAD_REQUEST: “400 Bad Request”
- HTTP_UNAUTHORIZED: “401 Unauthorized”
- HTTP_NOT_FOUND: “404 Not Found”
- HTTP_TEAPOT: “418 I AM A TEAPOT!”
- HTTP_INTERNAL_SERVER_ERROR: “500 Internal Server Error”

If the status code is not one of the above, return “Unknown HTTP status code”.

```main.c
#include "munit.h"

#include "http.h"

munit_case(RUN, test_switch_enum, {
  assert_string_equal(http_to_str(HTTP_BAD_REQUEST), "400 Bad Request", "");
  assert_string_equal(http_to_str(HTTP_UNAUTHORIZED), "401 Unauthorized", "");
  assert_string_equal(http_to_str(HTTP_NOT_FOUND), "404 Not Found", "");
  assert_string_equal(http_to_str(HTTP_TEAPOT), "418 I AM A TEAPOT!", "");
  assert_string_equal(http_to_str(HTTP_INTERNAL_SERVER_ERROR), "500 Internal Server Error", "");
});

munit_case(SUBMIT, test_switch_enum_default, {
  assert_string_equal(http_to_str((HttpErrorCode)999), "Unknown HTTP status code", "");
});

int main() {
  MunitTest tests[] = {
    munit_test("/switch_enum", test_switch_enum),
    munit_test("/switch_enum_default", test_switch_enum_default),
    munit_null_test,
  };

  MunitSuite suite = munit_suite("http", tests);

  return munit_suite_main(&suite, NULL, 0, NULL);
}
```

```http.h
#pragma once

typedef enum {
  HTTP_BAD_REQUEST = 400,
  HTTP_UNAUTHORIZED = 401,
  HTTP_NOT_FOUND = 404,
  HTTP_TEAPOT = 418,
  HTTP_INTERNAL_SERVER_ERROR = 500
} HttpErrorCode;

char *http_to_str(HttpErrorCode code);
```

```http.c
#include "http.h"
#include "stdio.h"

char *http_to_str(HttpErrorCode code) {
  switch (code) {
    case 400:
      return "400 Bad Request";
    case 401:
      return "401 Unauthorized";
    case 404:
      return "404 Not Found";
    case 418:
      return "418 I AM A TEAPOT!";
    case 500:
      return "500 Internal Server Error";
    default:
      return "Unknown HTTP status code";
  }
}
```

# CH4: Enums | L4: Sizeof Enum
The same sizeof operator that we’ve talked about works on enums.

Generally, enums in C are the same size as an int. However, if an enum value exceeds the range of an int, the C compiler will use a larger integer type to accommodate the value, such as an unsigned int or a long.
- unsigned int doesn’t represent negative numbers, so it can represent larger positive numbers.
- long is just a larger integer type than int, so it can represent larger numbers.

Just Fancy Integers

Enums are often used to represent the possibilities in a set. For example:
- SMALL = 0
- MEDIUM = 1
- LARGE = 2
- EXTRA_LARGE = 3

Your code probably cares a lot about which size a variable represents, but it probably doesn’t care that SMALL happens to be 0 under the hood. From the compiler’s perspective, enums are just fancy integers.
Assignment

At the start of main(), print the size of the two enums defined in main.c, in the format:
```
The size of BigNumbers is Y bytes
The size of HttpErrorCode is X bytes
```
Remember that %zu is the format specifier for size_t.

```main.c
#include <stdio.h>

typedef enum {
  BIG = 123412341234,
  BIGGER,
  BIGGEST,
} BigNumbers;

typedef enum {
  HTTP_BAD_REQUEST = 400,
  HTTP_UNAUTHORIZED = 401,
  HTTP_NOT_FOUND = 404,
  HTTP_I_AM_A_TEAPOT = 418,
  HTTP_INTERNAL_SERVER_ERROR = 500
} HttpErrorCode;

int main() {
  printf("The size of BigNumbers is %zu bytes\n", sizeof(BigNumbers));
  printf("The size of HttpErrorCode is %zu bytes\n", sizeof(HttpErrorCode));
  return 0;
}
```
