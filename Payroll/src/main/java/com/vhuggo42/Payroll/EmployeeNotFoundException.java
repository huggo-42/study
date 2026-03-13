package com.vhuggo42.Payroll;

class EmployeeNotFoundException extends RuntimeException {
	EmployeeNotFoundException(Long id) {
		super("Could not find employee " + id);
	}
}
