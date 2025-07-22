const validationSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const userId = await getUserId(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Note ID is required",
    });
  }

  const validatedBody = await zodValidateBody(event, validationSchema.parse);

  const updatedNote = await ModelNotes.findOneAndUpdate(
    { _id: id, userId },
    validatedBody,
    { new: true, runValidators: true }
  );

  if (!updatedNote) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Note not found",
    });
  }

  return {
    message: "Note updated successfully",
    data: updatedNote,
  };
});
