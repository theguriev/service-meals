import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const _id = await getUserId(event);
  const ingredientId = getRouterParam(event, "id");

  if (!ObjectId.isValid(ingredientId)) {
    throw createError({ statusCode: 400, message: "Invalid ingredient ID" });
  }

  const result = await ModelIngredients.deleteOne({
    _id: new ObjectId(ingredientId),
    userId: _id,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Ingredient not found" });
  }

  return { message: "Ingredient deleted successfully" };
});
