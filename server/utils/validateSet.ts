import { Types } from "mongoose";

const validateSet = async (sets?: {
  id?: string;
  value?: number;
}[]) => {
  const ingredients = await ModelIngredients.find({
    _id: { $in: sets?.map((set) => new Types.ObjectId(set.id)) ?? [] },
  });
  const categoryValues = sets?.reduce<Record<string, number>>((acc, set) => {
    const ingredient = ingredients.find((ing) => ing._id.toString() === set.id);
    if (!ingredient) return acc;

    const categoryId = ingredient.categoryId;
    const currentValue = acc[categoryId.toString()] || 0;
    return {
      ...acc,
      [categoryId.toString()]: currentValue + (set.value || 0),
    };
  }, {});
  console.log(ingredients, categoryValues)

  return !Object.values(categoryValues ?? {}).some(value => value > 1);
};

export default validateSet;
