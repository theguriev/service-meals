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

  const template = await ModelTemplate.findOne({
    _id: new ObjectId(id),
  });
  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: "Item not found",
    });
  }

  return template;
});
