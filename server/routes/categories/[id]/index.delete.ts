import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const user = await getInitialUser(event, authorizationBase);

	if (!can(user, "delete-categories")) {
		throw createError({ statusCode: 403, message: "Unauthorized" });
	}

	const _id = await getUserId(event);
	const id = getRouterParam(event, "id");
	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid item ID" });
	}
	const objectId = new ObjectId(id);
	const result = await ModelCategories.deleteOne(
		can(user, "delete-all-categories")
			? {
					_id: objectId,
				}
			: can(user, "delete-template-categories")
				? {
						_id: objectId,
						$or: [
							{ userId: _id },
							{ templateId: { $exists: true, $ne: null } },
						],
					}
				: {
						_id: objectId,
						userId: _id,
					},
	);

	if (result.deletedCount === 0) {
		throw createError({ statusCode: 404, message: "Item not found" });
	}

	await ModelIngredients.deleteMany({
		categoryId: objectId,
	});

	return { message: "Item deleted successfully" };
});
