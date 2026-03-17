package com.vhuggo42.Payroll;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProductRepository extends JpaRepository<Product, Long> {
	Product findByName(String name);

	Product findByPriceLessThan(Double price);

	Product findAllByNameContaining(String keyword);
}
