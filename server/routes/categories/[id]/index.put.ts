import { ObjectId } from "mongodb";

const updateSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	templateId: z.string().transform(objectIdTransform).optional(),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const user = await getInitialUser(event, authorizationBase);

	if (!can(user, "update-categories")) {
		throw createError({ statusCode: 403, message: "Unauthorized" });
	}

	const userId = await getUserId(event);
	const id = getRouterParam(event, "id");
	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid item ID" });
	}
	const objectId = new ObjectId(id);

	// Validate the request body
	const { templateId, ...validatedBody } = await zodValidateBody(
		event,
		updateSchema.parse,
	);

	if (
		templateId &&
		!can(user, "update-all-categories") &&
		!can(user, "update-template-categories")
	) {
		throw createError({ statusCode: 403, message: "Unauthorized" });
	}

	// Update the ingredient in the database
	const updated = await ModelCategories.findOneAndUpdate(
		can(user, "update-all-categories")
			? { _id: objectId }
			: can(user, "update-template-categories")
				? {
						_id: objectId,
						$or: [{ templateId: { $exists: true, $ne: null } }, { userId }],
					}
				: { _id: objectId, userId },
		{ $set: { templateId, ...validatedBody } },
		{ new: true },
	);

	if (!updated) {
		throw createError({ statusCode: 404, message: "Item not found" });
	}

	return {
		message: "Item updated successfully",
		ingredient: updated,
	};
});
