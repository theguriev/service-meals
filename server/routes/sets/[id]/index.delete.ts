import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid set ID" });
  }

  const result = await ModelSets.deleteOne({
    _id: new ObjectId(id),
    userId,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Set not found" });
  }

  return {
    message: "Set deleted successfully",
  };
});
