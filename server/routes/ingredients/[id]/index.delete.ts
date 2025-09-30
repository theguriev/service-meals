import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const result = await ModelIngredients.deleteOne({
    _id: new ObjectId(id),
    userId,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return { message: "Item deleted successfully" };
});
