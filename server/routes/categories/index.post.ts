const validationSchema = z.object({
	name: z.string().min(1, "Name is required"),
	templateId: z.string().transform(objectIdTransform).optional(),
});

export default defineEventHandler(async (event) => {
	const { authorizationBase } = useRuntimeConfig();
	const user = await getInitialUser(event, authorizationBase);
	const { templateId, ...validatedBody } = await zodValidateBody(
		event,
		validationSchema.parse,
	);

	if (
		!can(user, "create-categories") ||
		(templateId && !can(user, "create-template-categories"))
	) {
		throw createError({
			statusCode: 403,
			statusMessage: "Forbidden",
		});
	}

	const _id = await getUserId(event);
	const doc = new ModelCategories({
		userId: templateId ? user._id : _id,
		templateId,
		...validatedBody,
	});
	const saved = await doc.save();

	return {
		message: "Item added successfully",
		data: saved,
	};
});
