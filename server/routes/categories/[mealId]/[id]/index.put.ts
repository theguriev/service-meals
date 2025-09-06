import { ObjectId } from "mongodb";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export default defineEventHandler(async (event) => {
  const { authorizationBase } = useRuntimeConfig();
  const userId = await getUserId(event);

  const id = getRouterParam(event, "id");
  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: "Invalid item ID" });
  }
  const objectId = new ObjectId(id);


  const mealId = new ObjectId(getRouterParam(event, "mealId"));
  if (!ObjectId.isValid(mealId)) {
    throw createError({ statusCode: 400, message: "Invalid meal ID" });
  }
  const objectMealId = new ObjectId(mealId);

  // Validate the request body
  const validatedBody = await zodValidateBody(event, updateSchema.parse);

  // Update the ingredient in the database
  const user = await getInitialUser(event, authorizationBase);
  if (can(user, "update-all-categories") || !can(user, "update-template-categories")) {
    const updated = await ModelCategories.findOneAndUpdate(
      can(user, "update-all-categories") ? { _id: objectId, mealId: objectMealId } : { _id: objectId, userId, mealId: objectMealId },
      { $set: validatedBody },
      { new: true }
    );

    if (!updated) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }

    return {
      message: "Item updated successfully",
      ingredient: updated,
    };
  } else {
    const categories = await ModelCategories.aggregate([
      {
        $match: {
          _id: objectId,
          mealId: objectMealId,
        }
      },
      {
        $lookup: {
          from: "meals",
          localField: "mealId",
          foreignField: "_id",
          as: "meals"
        }
      },
      {
        $match: {
          "meals.templateId": { $exists: true, $ne: null }
        }
      }
    ]);

    if (categories.length === 0) {
      throw createError({ statusCode: 404, message: "Item not found" });
    }

    const updated = await ModelCategories.findOneAndUpdate(
      { _id: objectId },
      { $set: validatedBody },
      { new: true }
    );

    return {
      message: "Item updated successfully",
      ingredient: updated,
    };
  }
});
