import { ObjectId } from "mongodb";
import { defaultTemplateName } from "~~/constants";

const updateSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const user = await getInitialUser(event, authorizationBase);
	if (!can(user, "update-templates")) {
		throw createError({
			statusCode: 403,
			message: "Forbidden: User does not have permission to update templates",
		});
	}
	const id = getRouterParam(event, "id");

	if (!ObjectId.isValid(id)) {
		throw createError({ statusCode: 400, message: "Invalid item ID" });
	}

	// Validate the request body
	const validatedBody = await zodValidateBody(event, updateSchema.parse);

	if (validatedBody.name === defaultTemplateName) {
		throw createError({
			statusCode: 400,
			message: "Cannot use default template name",
		});
	}

	// Update the ingredient in the database
	const updated = await ModelTemplate.findOneAndUpdate(
		{ _id: id },
		{ $set: validatedBody },
		{ new: true },
	);

	if (!updated) {
		throw createError({ statusCode: 404, message: "Item not found" });
	}

	return {
		message: "Item updated successfully",
		data: updated,
	};
});
