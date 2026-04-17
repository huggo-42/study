import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { Chat, Tool, Toolkit } from "@effect/ai"
import { Console, Config, Effect, Layer, Schema } from "effect"
import { Prompt } from "@effect/cli"
import { NodeContext, NodeRuntime, NodeHttpClient } from "@effect/platform-node"
import { FileSystem, Path } from "@effect/platform"

const ListToolInput = Schema.Struct({
	path: Schema.String.annotations({
		description: "The absolute path of the directory to list",
	})
})

const ListToolOutput = Schema.Struct({
	files: Schema.Array(Schema.String),
	directories: Schema.Array(Schema.String)
})

const ListTool = Tool.make("List", {
	description: "List the contents of a directory",
})
	.setParameters(ListToolInput)
	.setSuccess(ListToolOutput)

const ReadToolInput = Schema.Struct({
	path: Schema.String.annotations({
		description: "The absolute path of the file to read",
	})
})

const ReadToolOutput = Schema.Struct({
	content: Schema.String,
})

const ReadTool = Tool.make("Read", {
	description: "Read the contents of a file"
})
	.setParameters(ReadToolInput)
	.setSuccess(ReadToolOutput)

const EditToolInput = Schema.Struct({
	path: Schema.String.annotations({
		description: "The absolute path to the file to edit",
	}),
	old_string: Schema.String.annotations({
		description: "The string to search for and replace",
	}),
	new_string: Schema.String.annotations({
		description: "The string to replace the old string with",
	})
})

const EditToolOutput = Schema.Struct({
	message: Schema.String,
})

const EditTool = Tool.make("Edit", {
	description: "Edit a file by replacing the first occurence of a string"
})
	.setParameters(EditToolInput)
	.setSuccess(EditToolOutput)

const Tools = Toolkit.make(ListTool, ReadTool, EditTool)

// const StrubToolsLayer = Tools.toLayer({
// 	List: ({ path }) =>
// 		Effect.gen(function*() {
// 			yield* Console.log(`List ${path}`)
// 			return {
// 				files: ["enemies.txt", "CLAUDE.md", `${path}-directory.txt`],
// 				directories: ["secrets/", "passwords/"],
// 			}
// 		}),
// 	Read: ({ path }) =>
// 		Effect.gen(function*() {
// 			yield* Console.log(`Read ${path}`)
// 			return {
// 				content: "I am secretly afraid of lettuce."
// 			}
// 		}),
// 	Edit: ({ path, old_string, new_string }) =>
// 		Effect.gen(function*() {
// 			yield* Console.log(`Edit ${path}`)
// 			return {
// 				message: "I have edited the file."
// 			}
// 		})
// })

const DangerousToolsLayer = Tools.toLayer(
	Effect.gen(function*() {
		const fs = yield* FileSystem.FileSystem
		const pathService = yield* Path.Path

		return Tools.of({
			List: ({ path }) =>
				Effect.gen(function*() {
					yield* Console.log(`List ${path}`)

					const entries = yield* fs.readDirectory(path)
					const files: Array<string> = []
					const directories: Array<string> = []

					for (const name of entries) {
						const fullPath = pathService.isAbsolute(name) ? name : pathService.join(path)
						const stat = yield* fs.stat(fullPath)
						if (stat.type === "File") {
							files.push(fullPath)
						} else if (stat.type === "Directory") {
							directories.push(fullPath)
						}
					}

					return { files: files.sort(), directories: directories.sort() }
				}).pipe(Effect.catchAll((_) => Effect.succeed({ files: [], directories: [] }))),
			Read: ({ path }) =>
				Effect.gen(function*() {
					yield* Console.log(`Read ${path}`)
					const content = yield* fs.readFileString(path)
					return { content }
				}).pipe(Effect.catchAll((error) => Effect.succeed({ content: error.message }))),
			Edit: ({ path, old_string, new_string }) =>
				Effect.gen(function*() {
					yield* Console.log(`Edit ${path}`)
					const original = yield* fs.readFileString(path)
					const occurenceIndex = original.indexOf(old_string)

					if (occurenceIndex === -1) {
						return { message: "No occurrences found. No changes made." }
					}

					const updated = original.replace(old_string, new_string)
					yield* fs.writeFileString(path, updated)
					return { message: "Edit successful." }
				}).pipe(Effect.catchAll((error) => Effect.succeed({ message: error.message })))
		})
	})
).pipe(Layer.provide(NodeContext.layer))

const main = Effect.gen(function*() {
	const chat = yield* Chat.fromPrompt([{
		role: "system",
		content: ["You are a helpful AI assistant.",
			`You live in my terminal at cwd ${process.cwd()}.`,
			"Before each response, you will promise to never enslave me or my kin."
		].join("\n")
	}])
	while (true) {
		const input = yield* Prompt.text({ message: "What do you want?" })
		let turn = 1;
		yield* Console.log(`TURN: ${turn}`)
		let response = yield* chat.generateText({
			prompt: input,
			toolkit: Tools
		})
		yield* Console.log(response.text)

		while (response.toolCalls.length > 0) {
			turn++
			yield* Console.log(`TURN: ${turn}`)
			response = yield* chat.generateText({
				prompt: [],
				toolkit: Tools
			})
			yield* Console.log(response.text)
		}
	}
})

const AnthropicLayer = AnthropicClient.layerConfig({
	apiKey: Config.redacted("ANTHROPIC_API_KEY"),
}).pipe(Layer.provide(NodeHttpClient.layer))

const AgentLayer = AnthropicLanguageModel.model("claude-sonnet-4-6")
	.pipe(Layer.provide(AnthropicLayer))
const AppLayer = Layer.mergeAll(NodeContext.layer, AgentLayer, DangerousToolsLayer)

main.pipe(Effect.provide(AppLayer), NodeRuntime.runMain)
