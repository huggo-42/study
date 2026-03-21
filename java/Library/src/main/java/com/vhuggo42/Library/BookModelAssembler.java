package com.vhuggo42.Library;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
class BookModelAssembler implements RepresentationModelAssembler<Book, EntityModel<Book>> {
	@Override
	public EntityModel<Book> toModel(Book book) {
		return EntityModel.of(book,
				linkTo(methodOn(BookController.class).one(book.getId())).withSelfRel(),
				linkTo(methodOn(BookController.class).all()).withRel("book"));
	}
}
