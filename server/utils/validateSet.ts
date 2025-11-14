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
					caloriesConsumption: number;
				}[];
			}
		>
	>((acc, set) => {
		const ingredient = ingredients.find((ing) => ing._id.toString() === set.id);
		if (!ingredient || !set.value) return acc;

		const { categoryId, isAlcohol, calories, grams, unit } = ingredient;
		const perGramCaloriesConsumption = calories * grams;
		const caloriesConsumption =
			(unit === "pieces"
				? perGramCaloriesConsumption
				: perGramCaloriesConsumption / 100) * set.value;
		const currentValue = acc[categoryId.toString()]?.value || 0;
		const currentAlcoholConsumption =
			acc[categoryId.toString()]?.alcoholConsumption || 0;
		const newIngredients = [
			...(acc[categoryId.toString()]?.ingredients || []),
			{ ingredient, value: set.value, caloriesConsumption },
		];

		if (isAlcohol) {
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
				({
					value,
					caloriesConsumption,
					ingredient: { grams, calories, isAlcohol, unit },
				}) => {
					const perGramCaloriesConsumption = calories * grams;
					const maxCalories =
						(unit === "pieces"
							? perGramCaloriesConsumption
							: perGramCaloriesConsumption / 100) *
						(maxIngredientConsumption / 100 -
							(isAlcohol ? 0 : categoryValue - value));

					return (
						Math.round(
							maxCalories -
								alcoholConsumption -
								(isAlcohol ? 0 : caloriesConsumption),
						) < 0
					);
				},
			),
	);
};

export default validateSet;
