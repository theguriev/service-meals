import { ObjectId } from "mongodb";
import { PipelineStage } from "mongoose";
import { z } from "zod";

const querySchema = z.object({
	withCategory: z.coerce.boolean().default(false),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const { withCategory } = await zodValidateData(
		getQuery(event),
		querySchema.parse,
	);
	const userId = await getUserId(event);
	const id = getRouterParam(event, "id");
	const user = await getInitialUser(event, authorizationBase);

	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid item ID" });
	}

	const ingredientMatch = can(user, "get-all-ingredients")
		? { _id: new ObjectId(id) }
		: {
				_id: new ObjectId(id),
				userId,
			};

	const categoryLookup: PipelineStage = {
		$lookup: {
			from: ModelCategories.modelName,
			localField: "categoryId",
			foreignField: "_id",
			as: "categories",
		},
	};

	if (!can(user, "get-all-categories")) {
		categoryLookup.$lookup.pipeline = [{ $match: { userId } }];
	}

	const ingredient = (
		await ModelIngredients.aggregate([
			{ $match: ingredientMatch },
			...(withCategory
				? [
						categoryLookup,
						{
							$set: {
								category: { $first: "$categories" },
							},
						},
						{
							$unset: ["categories"],
						},
					]
				: []),
		]).limit(1)
	)[0];

	if (!ingredient) {
		throw createError({
			statusCode: 404,
			statusMessage: "Ingredient not found",
		});
	}

	return ingredient;
});
