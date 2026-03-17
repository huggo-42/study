package com.vhuggo42.Payroll;

class ProductNotFoundException extends RuntimeException {
	ProductNotFoundException(Long id) {
		super("Could not find order " + id);
	}
}
