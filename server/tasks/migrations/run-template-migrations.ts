import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { defaultTemplateName, templateUserId } from "~~/constants";

interface TemplateIngredient {
  name: string;
  calories: number;
  proteins: number;
  grams: number;
  unit?: "grams" | "pieces";
  isAlcohol?: boolean;
}

interface TemplateCategory {
  name: string;
  description?: string;
  targetCalories?: number;
  ingredients: TemplateIngredient[];
}

interface TemplateData {
  name: string;
  description?: string;
  categories: TemplateCategory[];
}

interface MigrationStats {
  templatesProcessed: number;
  templatesCreated: number;
  templatesSkipped: number;
  categoriesCreated: number;
  ingredientsCreated: number;
}

export default defineTask({
  meta: {
    name: "db:migrate-templates",
    description: "Run all template migrations from data/templates directory",
  },
  run: async ({ payload, context }) => {
    try {
      console.log("🚀 Starting template migrations system");

      const stats: MigrationStats = {
        templatesProcessed: 0,
        templatesCreated: 0,
        templatesSkipped: 0,
        categoriesCreated: 0,
        ingredientsCreated: 0,
      };

      // Определяем путь к папке с шаблонами
      const templatesDir = join(process.cwd(), "data", "templates");

      if (!existsSync(templatesDir)) {
        console.log("❌ Templates directory does not exist: data/templates");
        return { result: stats };
      }

      // Читаем все JSON файлы из папки templates
      const files = await readdir(templatesDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      if (jsonFiles.length === 0) {
        console.log("⚠️  No JSON template files found in data/templates");
        return { result: stats };
      }

      console.log(`📁 Found ${jsonFiles.length} template files`);

      // Обрабатываем каждый файл
      for (const filename of jsonFiles) {
        console.log(`\n📋 Processing: ${filename}`);
        stats.templatesProcessed++;

        try {
          const templateStats = await processTemplateFile(filename);

          stats.templatesCreated += templateStats.templatesCreated;
          stats.templatesSkipped += templateStats.templatesSkipped;
          stats.categoriesCreated += templateStats.categoriesCreated;
          stats.ingredientsCreated += templateStats.ingredientsCreated;
        } catch (error) {
          console.error(`❌ Error processing ${filename}:`, error);
        }
      }

      // Выводим итоговую статистику
      console.log("\n" + "=".repeat(50));
      console.log("📊 MIGRATION SUMMARY");
      console.log("=".repeat(50));
      console.log(`📁 Templates processed: ${stats.templatesProcessed}`);
      console.log(`✅ Templates created: ${stats.templatesCreated}`);
      console.log(`⏭️  Templates skipped: ${stats.templatesSkipped}`);
      console.log(`📂 Categories created: ${stats.categoriesCreated}`);
      console.log(`🥗 Ingredients created: ${stats.ingredientsCreated}`);
      console.log("=".repeat(50));

      return { result: stats };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  },
});

async function processTemplateFile(
  filename: string,
): Promise<Omit<MigrationStats, "templatesProcessed">> {
  const stats: Omit<MigrationStats, "templatesProcessed"> = {
    templatesCreated: 0,
    templatesSkipped: 0,
    categoriesCreated: 0,
    ingredientsCreated: 0,
  };

  // Читаем и парсим JSON файл
  const filePath = join(process.cwd(), "data", "templates", filename);
  const fileContent = await readFile(filePath, "utf-8");
  const templateData: TemplateData = JSON.parse(fileContent);
  const templateName = filename === "default.json" ? defaultTemplateName : templateData.name;

  console.log(`  📝 Template: ${templateName}`);
  if (templateData.description) {
    console.log(`  💭 Description: ${templateData.description}`);
  }

  // Проверяем, существует ли шаблон с таким именем
  const existingTemplate = await ModelTemplate.findOne({
    name: templateName,
    userId: templateUserId,
  });
  if (existingTemplate) {
    console.log(
      `  ⏭️  Template "${templateName}" already exists, skipping...`,
    );
    stats.templatesSkipped++;
    return stats;
  }

  // Создаем основной template
  const template = new ModelTemplate({
    name: templateName,
    description: templateData.description,
    userId: templateUserId,
  });
  const savedTemplate = await template.save();
  console.log(
    `  ✅ Created template: ${savedTemplate.name} (${savedTemplate._id})`,
  );
  stats.templatesCreated++;

  // Создаем категории
  for (const categoryData of templateData.categories) {
    console.log(`      📂 Processing category: ${categoryData.name}`);

    // Создаем category
    const category = new ModelCategories({
      name: categoryData.name,
      description: categoryData.description,
      targetCalories: categoryData.targetCalories,
      userId: templateUserId,
      templateId: savedTemplate._id,
    });
    const savedCategory = await category.save();
    console.log(
      `      ✅ Created category: ${savedCategory.name} (${savedCategory._id})`,
    );
    stats.categoriesCreated++;

    // Создаем ingredients для этой категории
    for (const ingredientData of categoryData.ingredients) {
      const ingredient = new ModelIngredients({
        categoryId: savedCategory._id,
        name: ingredientData.name,
        calories: ingredientData.calories,
        proteins: ingredientData.proteins,
        grams: ingredientData.grams ?? 0,
        unit: ingredientData.unit ?? "grams",
        isAlcohol: ingredientData.isAlcohol ?? false,
        userId: templateUserId,
      });
      await ingredient.save();
      stats.ingredientsCreated++;
    }

    console.log(
      `      🥗 Created ${categoryData.ingredients.length} ingredients for category "${categoryData.name}"`,
    );
  }

  return stats;
}
