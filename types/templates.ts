export interface TemplateIngredient {
	name: string;
	calories: number;
	proteins: number;
	grams: number;
	unit?: "grams" | "pieces";
	isAlcohol?: boolean;
}

export interface TemplateCategory {
	name: string;
	description?: string;
	targetCalories?: number;
	ingredients: TemplateIngredient[];
}

export interface TemplateData {
	name: string;
	description?: string;
	categories: TemplateCategory[];
}
