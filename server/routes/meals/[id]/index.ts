import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");
  const role = await getRole(event);

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const meal = await ModelMeals.findOne(role === "admin" ? { _id: new ObjectId(id) } : {
    _id: new ObjectId(id),
    userId,
  });
  if (!meal) {
    throw createError({
      statusCode: 404,
      statusMessage: "Meal not found",
    });
  }

  try {
    const categoriesRaw = await ModelCategories.find(role === "admin"
      ? { mealId: id }
      : { mealId: id, userId });
    const categories = await Promise.all(
      categoriesRaw.map(async (category) => {
        const ingredients = await ModelIngredients.find(role === "admin"
          ? { categoryId: category._id }
          : {
            categoryId: category._id,
            userId,
          }
        );
        return { ...category.toObject(), ingredients };
      })
    );

    return {
      ...meal.toObject(),
      categories,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to fetch meal",
    });
  }
});
