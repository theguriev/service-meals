import { ObjectId } from "mongodb";

const updateSchema = z.object({
	ingredients: z
		.array(
			z.object({
				id: z.string().min(1, "Ingredient id is required"),
				value: z.number(),
				additionalInfo: z.string().optional(),
			}),
		)
		.optional(),
});

export default defineEventHandler(async (event) => {
	const { maxIngredientConsumption } = useRuntimeConfig();
	const userId = await getUserId(event);
	const id = getRouterParam(event, "id");

	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid set ID" });
	}

	// Validate the request body
	const validatedBody = await zodValidateBody(event, updateSchema.parse);

	const ids = validatedBody.ingredients?.map((i) => i.id);
	if (ids.length !== new Set(ids).size) {
		throw createError({
			statusCode: 400,
			message: "Duplicate ingredient IDs are not allowed",
		});
	}

	if (
		!(await validateSet(
			validatedBody.ingredients,
			Number(maxIngredientConsumption),
		))
	) {
		throw createError({
			statusCode: 400,
			message: "Invalid ingredient values per category",
		});
	}

	// Update the set in the database
	const updated = await ModelSets.findOneAndUpdate(
		{ _id: id, userId },
		{ $set: validatedBody },
		{ new: true },
	);

	if (!updated) {
		throw createError({ statusCode: 404, message: "Set not found" });
	}

	return {
		message: "Set updated successfully",
		data: updated,
	};
});
