import { HttpApiBuilder } from "@effect/platform"
import { TodosApi } from "@template/domain/TodosApi"
import { Effect, Layer } from "effect"
import { TodosRepository } from "./TodosRepository.js"
import { Product, ProductApi } from "@template/domain/ProductApi"
import * as Option from "effect/Option"


const TodosApiLive = HttpApiBuilder.group(TodosApi, "todos", (handlers) =>
	Effect.gen(function*() {
		const todos = yield* TodosRepository
		return handlers
			.handle("getAllTodos", () => todos.getAll)
			.handle("getTodoById", ({ path: { id } }) => todos.getById(id))
			.handle("createTodo", ({ payload: { text } }) => todos.create(text))
			.handle("completeTodo", ({ path: { id } }) => todos.complete(id))
			.handle("removeTodo", ({ path: { id } }) => todos.remove(id))
	}))

const ProductApiLive = HttpApiBuilder.group(ProductApi, "products", (handlers) =>
	handlers.handle("getAllProducts", () => Effect.succeed([
		new Product({ name: "First Product", description: Option.none<string>() }),
		new Product({ name: "Second Product", description: Option.some("test description") })
	]))
)

export const ApiLive = HttpApiBuilder.api(TodosApi).pipe(
	Layer.provide(TodosApiLive),
	Layer.provide(ProductApiLive)
)
