import { ObjectId } from "mongodb";
import { InferSchemaType, RootFilterQuery } from "mongoose";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");
  const { authorizationBase } = useRuntimeConfig();

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  const user = await getInitialUser(event, authorizationBase);
  const deleteMatch: RootFilterQuery<InferSchemaType<typeof schemaMeals>> = {
    _id: new ObjectId(id),
  };

  if (!can(user, "delete-all-meals") && can(user, "delete-template-meals")) {
    deleteMatch.templateId = { $exists: true };
  } else if (!can(user, "delete-all-meals")) {
    deleteMatch.userId = userId;
  }

  const resultMeals = await ModelMeals.deleteOne(deleteMatch);

  const categoriesRaw = await ModelCategories.find({ mealId: id });
  const resultIngredients = await ModelIngredients.deleteMany({
    categoryId: { $in: categoriesRaw.map((category) => category._id) }
  })
  const resultCategories = await ModelCategories.deleteMany({ mealId: id });

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
