import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const user = await getInitialUser(event, authorizationBase);
	if (!can(user, "get-all-templates")) {
		throw createError({ statusCode: 403, message: "Forbidden" });
	}
	const id = getRouterParam(event, "id");

	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid item ID" });
	}

	const populated = await ModelTemplate.aggregate([
		{ $match: { _id: new ObjectId(id) } },
		{
			$lookup: {
				from: ModelCategories.modelName,
				localField: "_id",
				foreignField: "templateId",
				pipeline: [
					{
						$lookup: {
							from: ModelIngredients.modelName,
							localField: "_id",
							foreignField: "categoryId",
							as: "ingredients",
						},
					},
				],
				as: "categories",
			},
		},
	]);

	if (!populated || populated.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Item not found",
		});
	}

	return populated[0];
});
