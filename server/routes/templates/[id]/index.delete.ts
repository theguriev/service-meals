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

  const resultTemplate = await ModelMeals.deleteOne({
    _id: new ObjectId(id),
  });

  return {
    message: "Item deleted successfully",
    deletedMeals: resultTemplate,
  };
});
