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

  const deletedNote = await ModelNotes.findOneAndDelete({ _id: id, userId });

  if (!deletedNote) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Note not found",
    });
  }

  return {
    message: "Note deleted successfully",
    data: deletedNote,
  };
});
