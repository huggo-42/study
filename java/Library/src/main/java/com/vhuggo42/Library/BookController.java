package com.vhuggo42.Library;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
class BookController {

	private final BookRepository repository;

	private final BookModelAssembler assembler;

	BookController(BookRepository repository, BookModelAssembler assembler) {
		this.repository = repository;
		this.assembler = assembler;
	}

	@GetMapping("/books")
	CollectionModel<EntityModel<Book>> all() {
		List<EntityModel<Book>> books = repository.findAll().stream()
				.map(assembler::toModel)
				.collect(Collectors.toList());

		return CollectionModel.of(books, linkTo(methodOn(BookController.class).all()).withSelfRel());
	}

	@GetMapping("/books/{id}")
	EntityModel<Book> one(@PathVariable Long id) {
		Book book = repository.findById(id)
				.orElseThrow(() -> new BookNotFoundException(id));

		return assembler.toModel(book);
	}

	@PostMapping("/books")
	ResponseEntity<?> newBook(@RequestBody Book book) {
		Book newBook = repository.save(book);

		return ResponseEntity
				.created(linkTo(methodOn(BookController.class).one(newBook.getId())).toUri())
				.body(assembler.toModel(newBook));
	}

	@PutMapping("/books/{id}")
	ResponseEntity<?> replaceBook(@RequestBody Book newBook, @PathVariable Long id) {
		Book updatedBook = repository.findById(id)
				.map(book -> {
					book.setAuthorName(newBook.getAuthorName());
					book.setTitle(newBook.getTitle());
					return repository.save(book);
				})
				.orElseThrow(() -> new BookNotFoundException(id));

		EntityModel<Book> entityModel = assembler.toModel(updatedBook);
		return ResponseEntity
				.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri())
				.body(entityModel);
	}

	@DeleteMapping("/books/{id}")
	ResponseEntity<?> deleteBook(@PathVariable Long id) {
		repository.findById(id)
				.orElseThrow(() -> new BookNotFoundException(id));

		repository.deleteById(id);

		return ResponseEntity.noContent().build();
	}
}
