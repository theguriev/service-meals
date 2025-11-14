import { resolve } from "pathe";
import Unimport from "unimport/unplugin";
import { defineConfig } from "vitest/config";
import { imports } from "./constants";

export default defineConfig({
	plugins: [
		Unimport.vite({
			imports: [
				...imports,
				{ name: "$fetch", from: "ofetch" },
				{
					name: "default",
					as: "ModelCategories",
					from: "./db/model/categories.ts",
				},
				{
					name: "default",
					as: "ModelIngredients",
					from: "./db/model/ingredients.ts",
				},
				{
					name: "default",
					as: "ModelNotes",
					from: "./db/model/notes.ts",
				},
				{
					name: "default",
					as: "schemaCategories",
					from: "./db/schema/categories.ts",
				},
				{
					name: "default",
					as: "schemaIngredients",
					from: "./db/schema/ingredients.ts",
				},
				{
					name: "default",
					as: "schemaNotes",
					from: "./db/schema/notes.ts",
				},
			],
			dirs: ["./server/utils", "./types"],
			dts: true,
		}),
	],
	test: {
		include: ["./test-api/*.test.ts"],
		globalSetup: "./global-setup.ts",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "."),
		},
	},
});
