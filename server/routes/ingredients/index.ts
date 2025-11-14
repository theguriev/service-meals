const querySchema = z.object({
	offset: z.coerce.number().int().default(0),
	limit: z.coerce.number().int().default(10),
	withCategories: z.coerce.boolean().default(false),
	all: z.coerce.boolean().default(false),
	showInTemplate: z.coerce.boolean().default(false),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const userId = await getUserId(event);
	const user = await getInitialUser(event, authorizationBase);
	const { all, offset, limit, withCategories, showInTemplate } =
		await zodValidateData(getQuery(event), querySchema.parse);

	if (all && !can(user, "get-all-ingredients")) {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}

	if (!withCategories) {
		return ModelIngredients.find(all ? {} : { userId })
			.limit(limit)
			.skip(offset);
	}

	return await ModelIngredients.aggregate([
		...(all ? [] : [{ $match: { userId } }]),
		{
			$lookup: {
				from: ModelCategories.modelName,
				localField: "categoryId",
				foreignField: "_id",
				as: "categories",
				pipeline: [
					...(can(user, "get-all-categories") ? [] : [{ $match: { userId } }]),
					{
						$limit: 1,
					},
				],
			},
		},
		{
			$set: {
				category: {
					$arrayElemAt: ["$categories", 0],
				},
			},
		},
		{
			$unset: ["categories"],
		},
		...(!showInTemplate
			? [
					{
						$match: {
							"category.templateId": { $not: { $exists: true, $ne: null } },
						},
					},
				]
			: []),
	]);
});
