import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const id = getRouterParam(event, "id");
  const mealId = getRouterParam(event, "mealId");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const result = await ModelCategories.deleteOne({
    _id: new ObjectId(id),
    userId: _id,
    mealId,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return { message: "Item deleted successfully" };
});
