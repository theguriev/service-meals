import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");
  const user = await getInitialUser(event, authorizationBase);

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const meal = await ModelMeals.findOne(can(user, "get-all-meals") ? { _id: new ObjectId(id) } : {
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
    const categoriesRaw = await ModelCategories.find(can(user, "get-all-categories")
      ? { mealId: id }
      : { mealId: id, userId });
    const categories = await Promise.all(
      categoriesRaw.map(async (category) => {
        const ingredients = await ModelIngredients.find(can(user, "get-all-ingredients")
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
