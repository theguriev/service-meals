import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const resultMeals = await ModelMeals.deleteOne({
    _id: new ObjectId(id),
    userId,
  });

  const categoriesRaw = await ModelCategories.find({ mealId: id, userId });
  const ingredientIds = await categoriesRaw.reduce<Promise<Set<ObjectId>>>(
    async (accPromise, category) => {
      const acc = await accPromise;
      const ingredients = await ModelIngredients.find({
        categoryId: category._id,
        userId,
      });
      const currentIngredientIds = ingredients.map(
        (ingredient) => ingredient._id
      );
      return new Set([...acc, ...currentIngredientIds]);
    },
    Promise.resolve(new Set<ObjectId>())
  );
  const resultCategories = await ModelCategories.deleteMany({
    mealId: id,
    userId,
  });
  const resultIngredients = await ModelIngredients.deleteMany({
    _id: { $in: Array.from(ingredientIds) },
    userId,
  });

  if (resultMeals.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }

  return {
    message: "Item deleted successfully",
    deletedMeals: resultMeals,
    deletedCategories: resultCategories,
    deletedIngredients: resultIngredients,
  };
});
