import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { templateUserId } from "~~/constants";

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

async function importSingleTemplate(filename: string) {
  console.log(`🔄 Importing template: ${filename}`);

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
      success: true,
      skipped: true,
      templateId: existingTemplate._id,
      templateName: existingTemplate.name,
      filename,
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
      userId: templateUserId,
    });
    const savedMeal = await meal.save();
    totalMeals++;
    console.log(`  ✅ Created meal: ${savedMeal.name} (${savedMeal._id})`);

    // Создаем categories для meal
    for (const categoryData of mealData.categories) {
      const category = new ModelCategories({
        mealId: savedMeal._id,
        name: categoryData.name,
        userId: templateUserId,
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
          userId: templateUserId,
        });
        const savedIngredient = await ingredient.save();
        totalIngredients++;
        console.log(
          `      ✅ Created ingredient: ${savedIngredient.name} (${savedIngredient._id})`
        );
      }
    }
  }

  return {
    success: true,
    skipped: false,
    templateId: savedTemplate._id,
    templateName: savedTemplate.name,
    filename,
    stats: {
      meals: totalMeals,
      categories: totalCategories,
      ingredients: totalIngredients,
    },
  };
}

export default defineTask({
  meta: {
    name: "db:import-all-templates",
    description: "Import all templates from data/templates directory",
  },
  run: async ({ payload, context }) => {
    try {
      console.log("🚀 Starting import of all templates...");

      // Получаем список всех JSON файлов в папке templates
      const templatesDir = join(process.cwd(), "data", "templates");
      const files = await readdir(templatesDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      console.log(`📁 Found ${jsonFiles.length} template files:`);
      jsonFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });

      if (jsonFiles.length === 0) {
        console.log("⚠️  No template files found");
        return {
          result: "No template files found",
          importedTemplates: [],
        };
      }

      const importResults = [];
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Импортируем каждый шаблон
      for (const filename of jsonFiles) {
        try {
          const result = await importSingleTemplate(filename);

          if (result.skipped) {
            skippedCount++;
            console.log(`⏭️  Skipped: ${filename}`);
          } else {
            successCount++;
            console.log(`✅ Imported: ${filename}`);
          }

          importResults.push(result);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to import ${filename}:`, error);

          importResults.push({
            filename,
            success: false,
            error: error.message,
          });
        }
      }

      console.log("\n🎉 Batch import completed!");
      console.log(`📊 Summary:`);
      console.log(`   - Total files: ${jsonFiles.length}`);
      console.log(`   - Successfully imported: ${successCount}`);
      console.log(`   - Skipped (already exist): ${skippedCount}`);
      console.log(`   - Errors: ${errorCount}`);

      return {
        result: "Batch import completed",
        summary: {
          totalFiles: jsonFiles.length,
          successCount,
          skippedCount,
          errorCount,
        },
        importedTemplates: importResults,
      };
    } catch (error) {
      console.error("❌ Batch import failed:", error);
      throw error;
    }
  },
});
