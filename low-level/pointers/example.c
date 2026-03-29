#include <stdio.h>
#include <stdlib.h>

// struct Person {
// 	char name[64];
// 	int age;
// };
//
// void updateStruct(struct Person *p, int age) { p->age = age; }
//
// void main(int argc, char **argv)
// {
// 	struct Person johnDoe;
// 	updateStruct(&johnDoe, 42);
// };

int main(int argc, char **argv)
{
	char *heapMemory = malloc(100);
	if (NULL == heapMemory) {
		perror("malloc failed");
	}

	return 0;
}
