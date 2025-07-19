import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = new ObjectId(await getUserId(event) as string);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid additional meal ID" });
  }

  const result = await ModelAdditionalMeals.deleteOne({
    _id: new ObjectId(id),
    userId,
  });

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, message: "Additional meal not found" });
  }

  return {
    message: "Additional meal deleted successfully",
  };
});
