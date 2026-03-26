#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define FIVE_THOUSAND 5000
#define TEN_THOUSAND 10000
#define HUNDRED_THOUSAND 100000
#define MILLION 1000000

#define PIover4 M_PI / 4

double random_real(double lo, double hi)
{
	double normalised = rand() / ((double)RAND_MAX + 1);
	double scalled = normalised * (hi - lo);
	return scalled + lo;
}

int int_len(int n)
{
	int count = 1;
	double rest = n / 10.0f;
	while (rest >= 1.0f) {
		count++;
		rest = rest / 10.0f;
	}
	return count;
}

long double calc_circle_hit_ratio(int limit)
{
	long int total_inside = 0;
	double x;
	double y;
	for (size_t i = 0; i < limit; i++) {
		x = random_real(-1.0f, 1.0f);
		y = random_real(-1.0f, 1.0f);
		bool inside_circle = ((x * x) + (y * y)) < 1;
		if (inside_circle) {
			total_inside++;
		}
	}
	return total_inside / (double)limit;
}

void calc_circle_hit_ratio_mean(int how_many_throws, int how_many_times)
{
	long double sum = 0.0f;
	for (size_t i = 0; i < how_many_times; i++) {
		sum += calc_circle_hit_ratio(how_many_throws);
	}
	long double mean = sum / (double)how_many_times;
	long double proximicity = PIover4 - mean;
	printf("%i times%*s-> Mean = %Lf | Proximicity = %*s%Lf\n", how_many_times, 8 - int_len(how_many_times), "",
	       mean, proximicity > 0 ? 1 : 0, "", proximicity);
}

void benchmark(int throws)
{
	printf("\n[Benchmarking with %i throws]\n", throws);
	calc_circle_hit_ratio_mean(throws, FIVE_THOUSAND);
	calc_circle_hit_ratio_mean(throws, TEN_THOUSAND);
	calc_circle_hit_ratio_mean(throws, HUNDRED_THOUSAND);
	calc_circle_hit_ratio_mean(throws, MILLION);
}

int main()
{
	srand(time(0));

	benchmark(50);
	benchmark(100);
	benchmark(500);
	benchmark(1000);
	benchmark(10000);

	return 0;
}
