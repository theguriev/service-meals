import { Types } from "mongoose";

const validateSet = async (
  sets?: {
    id?: string;
    value?: number;
  }[],
  maxIngredientConsumption: number = 100,
) => {
  const ingredients = await ModelIngredients.find({
    _id: { $in: sets?.map((set) => new Types.ObjectId(set.id)) ?? [] },
  });

  const categoryValues = sets?.reduce<
    Record<
      string,
      {
        value: number;
        alcoholConsumption: number;
        ingredients: {
          ingredient: (typeof ingredients)[number];
          value: number;
        }[];
      }
    >
  >((acc, set) => {
    const ingredient = ingredients.find((ing) => ing._id.toString() === set.id);
    if (!ingredient || !set.value) return acc;

    const { categoryId, isAlcohol, calories, grams } = ingredient;
    const currentValue = acc[categoryId.toString()]?.value || 0;
    const currentAlcoholConsumption =
      acc[categoryId.toString()]?.alcoholConsumption || 0;
    const newIngredients = [
      ...(acc[categoryId.toString()]?.ingredients || []),
      { ingredient, value: set.value },
    ];

    if (isAlcohol) {
      const caloriesConsumption = ((calories * grams) / 100) * set.value;

      return {
        ...acc,
        [categoryId.toString()]: {
          value: currentValue,
          alcoholConsumption: currentAlcoholConsumption + caloriesConsumption,
          ingredients: newIngredients,
        },
      };
    }

    return {
      ...acc,
      [categoryId.toString()]: {
        value: currentValue + set.value,
        alcoholConsumption: currentAlcoholConsumption,
        ingredients: newIngredients,
      },
    };
  }, {});

  return !Object.values(categoryValues ?? {}).some(
    ({ value: categoryValue, alcoholConsumption, ingredients }) =>
      ingredients.some(
        ({ value, ingredient: { grams, calories, isAlcohol } }) => {
          const maxCalories =
            ((calories * grams) / 100) *
            (maxIngredientConsumption / 100 -
              (isAlcohol ? 0 : categoryValue - value));
          const caloriesConsumption = ((calories * grams) / 100) * value;

          return (
            Math.round(maxCalories - alcoholConsumption - caloriesConsumption) <
            0
          );
        },
      ),
  );
};

export default validateSet;
