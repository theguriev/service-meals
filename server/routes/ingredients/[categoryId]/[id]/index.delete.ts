import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");
  const categoryId = getRouterParam(event, "categoryId");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  // Check if the category exists and belongs to the user
  const category = await ModelCategories.findOne({
    _id: new ObjectId(categoryId),
    userId,
  });
  if (!category) {
    throw createError({
      statusCode: 404,
      message: "Category not found or access denied",
    });
  }

  const result = await ModelIngredients.deleteOne({
    _id: new ObjectId(id),
    userId,
    categoryId,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return { message: "Item deleted successfully" };
});
