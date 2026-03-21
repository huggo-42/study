package com.vhuggo42.Library;

import org.springframework.data.jpa.repository.JpaRepository;

interface BookRepository extends JpaRepository<Book, Long> {
	Book findByAuthorName(String authorName);

	Book findAllByAuthorNameContaining(String keyword);

	Book findByTitle(String title);

	Book findAllByTitleContaining(String keyword);
}
