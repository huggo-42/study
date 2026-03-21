package com.vhuggo42.Library;

class BookNotFoundException extends RuntimeException {
	BookNotFoundException(Long id) {
		super("Could not find book " + id);
	}
}
