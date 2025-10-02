import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const user = await getInitialUser(event, authorizationBase);
  if (!can(user, "delete-templates")) {
    throw createError({
      statusCode: 403,
      message: "Forbidden: User does not have permission to delete templates",
    });
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

    let deletedIngredients = { acknowledged: false, deletedCount: 0 };

    const categories = await ModelCategories.find({
      templateId: new ObjectId(id),
    });
    const categoryIds = categories.map((category) => category._id);

    if (categoryIds.length > 0) {
      deletedIngredients = await ModelIngredients.deleteMany({
        categoryId: { $in: categoryIds },
      });
    }

    const deletedCategories = await ModelCategories.deleteMany({
      templateId: new ObjectId(id),
    });

    const deletedTemplates = await ModelTemplate.deleteOne({
      _id: new ObjectId(id),
    });

    return {
      message: "Template and all related data deleted successfully",
      deletedTemplates,
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
