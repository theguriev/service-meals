const validationSchema = z.object({
	content: z.string().min(1, "Content is required"),
});

export default defineEventHandler(async (event) => {
	const userId = await getUserId(event);
	const validatedBody = await zodValidateBody(event, validationSchema.parse);

	const doc = new ModelNotes({
		userId,
		...validatedBody,
	});

	const saved = await doc.save();

	return {
		message: "Note added successfully",
		data: saved,
	};
});
