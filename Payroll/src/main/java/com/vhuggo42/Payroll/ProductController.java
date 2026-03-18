package com.vhuggo42.Payroll;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.MediaTypes;
import org.springframework.hateoas.mediatype.problem.Problem;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
class ProductController {

	private final ProductRepository repository;

	private final ProductModelAssembler assembler;

	ProductController(ProductRepository repository, ProductModelAssembler assembler) {
		this.repository = repository;
		this.assembler = assembler;
	}

	@GetMapping("/products")
	CollectionModel<EntityModel<Product>> all() {
		List<EntityModel<Product>> Products = repository.findAll().stream()
				.map(assembler::toModel)
				.collect(Collectors.toList());

		return CollectionModel.of(Products, linkTo(methodOn(ProductController.class).all()).withSelfRel());
	}

	@GetMapping("/products/{id}")
	EntityModel<Product> one(@PathVariable Long id) {
		Product Product = repository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException(id));

		return assembler.toModel(Product);
	}

	@PostMapping("/products")
	ResponseEntity<?> newProduct(@RequestBody Product Product) {
		// Product.setStatus(Status.IN_PROGRESS);
		Product newProduct = repository.save(Product);

		return ResponseEntity
				.created(linkTo(methodOn(ProductController.class).one(newProduct.getId())).toUri())
				.body(assembler.toModel(newProduct));
	}

	@PutMapping("/products/{id}")
	ResponseEntity<?> replaceProducts(@RequestBody Product newProduct, @PathVariable Long id) {
		Product updatedProduct = repository.findById(id)
				.map(product -> {
					product.setName(newProduct.getName());
					product.setPrice(newProduct.getPrice());
					return repository.save(product);
				})
				.orElseGet(() -> repository.save(newProduct));
		EntityModel<Product> entityModel = assembler.toModel(updatedProduct);
		return ResponseEntity
				.created(entityModel.getRequiredLink(IanaLinkRelations.SELF).toUri())
				.body(entityModel);
	}

	@DeleteMapping("/products/{id}")
	ResponseEntity<?> deleteProduct(@PathVariable Long id) {
		repository.deleteById(id);

		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/products/{id}/cancel")
	ResponseEntity<?> cancel(@PathVariable Long id) {
		Product Product = repository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException(id));

		// if (Product.getStatus() == Status.IN_PROGRESS) {
		// Product.setStatus(Status.CANCELLED);
		// return ResponseEntity.ok(assembler.toModel(repository.save(Product)));
		// }

		return ResponseEntity
				.status(HttpStatus.METHOD_NOT_ALLOWED)
				.header(HttpHeaders.CONTENT_TYPE, MediaTypes.HTTP_PROBLEM_DETAILS_JSON_VALUE)
				.body(Problem.create()
						.withTitle("Method not allowed"));
		// .withDetail("You can't cancel an Product that is in the " +
		// Product.getStatus() + " status"));
	}

	@PutMapping("/products/{id}/complete")
	ResponseEntity<?> complete(@PathVariable Long id) {
		Product Product = repository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException(id));

		// if (Product.getStatus() == Status.IN_PROGRESS) {
		// Product.setStatus(Status.COMPLETED);
		// return ResponseEntity.ok(assembler.toModel(repository.save(Product)));
		// }

		return ResponseEntity
				.status(HttpStatus.METHOD_NOT_ALLOWED)
				.header(HttpHeaders.CONTENT_TYPE, MediaTypes.HTTP_PROBLEM_DETAILS_JSON_VALUE)
				.body(Problem.create()
						.withTitle("Method not allowed"));
		// .withDetail("You can't complete an Product that is in the " +
		// Product.getStatus() + " status"));
	}
}
