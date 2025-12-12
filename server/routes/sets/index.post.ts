import validateSet from "~/utils/validateSet";
import objectIdTransform from "~/utils/objectIdTransform";

const validationSchema = z.object({
	ingredients: z
		.array(
			z.object({
				id: z.string().min(1, "Ingredient id is required"),
				value: z.number(),
				additionalInfo: z.string().optional(),
			}),
		)
		.min(1, "At least one ingredient is required"),
	recipeId: z.string().transform(objectIdTransform).optional(),
	source: z.enum(["manual", "recipe"]).optional(),
	recipePortions: z.number().min(0).optional(),
});

export default defineEventHandler(async (event) => {
	const { maxIngredientConsumption } = useRuntimeConfig();
	const userId = await getUserId(event);
	const validatedBody = await zodValidateBody(event, validationSchema.parse);

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

	const doc = new ModelSets({
		userId,
		...validatedBody,
	});

	const saved = await doc.save();

	return {
		message: "Set added successfully",
		data: saved,
	};
});
