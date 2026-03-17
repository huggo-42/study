package com.vhuggo42.Payroll;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
class ProductModelAssembler implements RepresentationModelAssembler<Product, EntityModel<Product>> {
	@Override
	public EntityModel<Product> toModel(Product Product) {
		return EntityModel.of(Product,
				linkTo(methodOn(ProductController.class).one(Product.getId())).withSelfRel(),
				linkTo(methodOn(ProductController.class).all()).withRel("product"));
	}
}
