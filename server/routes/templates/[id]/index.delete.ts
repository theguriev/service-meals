import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const role = await getRole(event);
  if (role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }

  try {
    const templateExists = await ModelTemplate.findById(id);
    if (!templateExists) {
      throw createError({
        statusCode: 404,
        statusMessage: "Template not found",
      });
    }

    const meals = await ModelMeals.find({
      templateId: new ObjectId(id),
    });
    const mealIds = meals.map((meal) => meal._id);

    let deletedIngredients = { acknowledged: false, deletedCount: 0 };
    let deletedCategories = { acknowledged: false, deletedCount: 0 };

    if (mealIds.length > 0) {
      const categories = await ModelCategories.find({
        mealId: { $in: mealIds },
      });
      const categoryIds = categories.map((category) => category._id);

      if (categoryIds.length > 0) {
        deletedIngredients = await ModelIngredients.deleteMany({
          categoryId: { $in: categoryIds },
        });
      }

      deletedCategories = await ModelCategories.deleteMany({
        mealId: { $in: mealIds },
      });
    }

    const deletedMeals = await ModelMeals.deleteMany({
      templateId: new ObjectId(id),
    });

    const deletedTemplates = await ModelTemplate.deleteOne({
      _id: new ObjectId(id),
    });

    return {
      message: "Template and all related data deleted successfully",
      deletedTemplates,
      deletedMeals,
      deletedCategories,
      deletedIngredients,
    };
  } catch (error) {
    console.error("Error deleting template and related data:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete template and related data",
      data: error.message,
    });
  }
});
