import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const id = getRouterParam(event, "id");

  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid set ID" });
  }

  const set = await ModelSets.findOne({ _id: id, userId });

  if (!set) {
    throw createError({ statusCode: 404, message: "Set not found" });
  }

  return {
    data: set,
  };
});
