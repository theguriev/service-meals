import { readFile } from "fs/promises";
import { join } from "path";

interface TemplateIngredient {
  name: string;
  calories: number;
  proteins: number;
  grams: number;
}

interface TemplateCategory {
  name: string;
  description?: string;
  targetCalories?: number;
  ingredients: TemplateIngredient[];
}

interface TemplateMeal {
  name: string;
  categories: TemplateCategory[];
}

interface TemplateData {
  name: string;
  description?: string;
  meals: TemplateMeal[];
}

export default defineTask({
  meta: {
    name: "db:import-template",
    description: "Import template from JSON file",
  },
  run: async ({ payload, context }) => {
    try {
      const { filename } = payload as { filename: string };

      if (!filename) {
        throw new Error("Filename is required in payload");
      }

      console.log(`🚀 Starting template import from: ${filename}`);

      // Читаем JSON файл с данными шаблона
      const filePath = join(process.cwd(), "data", "templates", filename);
      const fileContent = await readFile(filePath, "utf-8");
      const templateData: TemplateData = JSON.parse(fileContent);

      console.log(`📋 Template: ${templateData.name}`);
      if (templateData.description) {
        console.log(`📝 Description: ${templateData.description}`);
      }

      // Проверяем, не существует ли уже такой шаблон
      const existingTemplate = await ModelTemplate.findOne({
        name: templateData.name,
      });
      if (existingTemplate) {
        console.log(
          `⚠️  Template "${templateData.name}" already exists. Skipping...`
        );
        return {
          result: "Template already exists",
          templateId: existingTemplate._id,
          templateName: existingTemplate.name,
          skipped: true,
        };
      }

      // 1. Создаем основной template
      const template = new ModelTemplate({
        name: templateData.name,
      });
      const savedTemplate = await template.save();
      console.log(
        `✅ Created template: ${savedTemplate.name} (${savedTemplate._id})`
      );

      // 2. Создаем meals, categories и ingredients
      let totalMeals = 0;
      let totalCategories = 0;
      let totalIngredients = 0;

      for (const mealData of templateData.meals) {
        // Создаем meal
        const meal = new ModelMeals({
          templateId: savedTemplate._id,
          name: mealData.name,
        });
        const savedMeal = await meal.save();
        totalMeals++;
        console.log(`  ✅ Created meal: ${savedMeal.name} (${savedMeal._id})`);

        // Создаем categories для meal
        for (const categoryData of mealData.categories) {
          const category = new ModelCategories({
            mealId: savedMeal._id,
            name: categoryData.name,
          });
          const savedCategory = await category.save();
          totalCategories++;
          console.log(
            `    ✅ Created category: ${savedCategory.name} (${
              savedCategory._id
            }) - ${categoryData.description || "No description"}`
          );

          // Создаем ingredients для category
          for (const ingredientData of categoryData.ingredients) {
            const ingredient = new ModelIngredients({
              categoryId: savedCategory._id,
              name: ingredientData.name,
              calories: ingredientData.calories,
              proteins: ingredientData.proteins,
              grams: ingredientData.grams,
            });
            const savedIngredient = await ingredient.save();
            totalIngredients++;
            console.log(
              `      ✅ Created ingredient: ${savedIngredient.name} (${savedIngredient._id})`
            );
          }
        }
      }

      console.log("🎉 Template import completed successfully!");
      console.log(`📊 Template stats:`);
      console.log(`   - Template: ${savedTemplate.name}`);
      console.log(`   - Total meals: ${totalMeals}`);
      console.log(`   - Total categories: ${totalCategories}`);
      console.log(`   - Total ingredients: ${totalIngredients}`);

      return {
        result: "Template import completed successfully!",
        templateId: savedTemplate._id,
        templateName: savedTemplate.name,
        filename,
        stats: {
          meals: totalMeals,
          categories: totalCategories,
          ingredients: totalIngredients,
        },
      };
    } catch (error) {
      console.error("❌ Template import failed:", error);
      throw error;
    }
  },
});
