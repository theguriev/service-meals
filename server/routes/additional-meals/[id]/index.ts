import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = new ObjectId(await getUserId(event) as string);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid additional meal ID" });
  }

  const model = await ModelAdditionalMeals.findOne({ _id: id, userId });

  if (!model) {
    throw createError({ statusCode: 404, message: "Additional meal not found" });
  }

  return {
    data: model,
  };
});
