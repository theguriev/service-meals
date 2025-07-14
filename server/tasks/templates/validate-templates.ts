import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface ValidationResult {
  filename: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    mealsCount: number;
    categoriesCount: number;
    ingredientsCount: number;
  };
}

export default defineTask({
  meta: {
    name: "templates:validate",
    description: "Validate all template JSON files for correct structure",
  },
  run: async ({ payload, context }) => {
    try {
      console.log("🚀 Starting template validation");

      const templatesDir = join(process.cwd(), "data", "templates");

      if (!existsSync(templatesDir)) {
        console.log("❌ Templates directory does not exist: data/templates");
        return { result: { error: "Templates directory not found" } };
      }

      // Читаем все JSON файлы
      const files = await readdir(templatesDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      if (jsonFiles.length === 0) {
        console.log("⚠️  No JSON template files found in data/templates");
        return {
          result: {
            files: [],
            totalFiles: 0,
            validFiles: 0,
            invalidFiles: 0,
            allValid: true,
          },
        };
      }

      console.log(`📁 Found ${jsonFiles.length} template files to validate`);

      const results: ValidationResult[] = [];
      let totalValid = 0;
      let totalInvalid = 0;

      for (const filename of jsonFiles) {
        console.log(`\n📋 Validating: ${filename}`);

        const result = await validateTemplateFile(filename);
        results.push(result);

        if (result.valid) {
          totalValid++;
          console.log(`✅ ${filename} - Valid`);
          if (result.stats) {
            console.log(
              `   📊 ${result.stats.mealsCount} meals, ${result.stats.categoriesCount} categories, ${result.stats.ingredientsCount} ingredients`
            );
          }
        } else {
          totalInvalid++;
          console.log(`❌ ${filename} - Invalid`);
          result.errors.forEach((error) => console.log(`   ❌ ${error}`));
        }

        if (result.warnings.length > 0) {
          result.warnings.forEach((warning) =>
            console.log(`   ⚠️  ${warning}`)
          );
        }
      }

      // Выводим итоговую статистику
      console.log("\n" + "=".repeat(50));
      console.log("📊 VALIDATION SUMMARY");
      console.log("=".repeat(50));
      console.log(`📁 Total files: ${jsonFiles.length}`);
      console.log(`✅ Valid: ${totalValid}`);
      console.log(`❌ Invalid: ${totalInvalid}`);
      console.log("=".repeat(50));

      if (totalInvalid > 0) {
        console.log(
          "\n⚠️  Please fix invalid templates before running migrations"
        );
      } else {
        console.log("\n🎉 All templates are valid! Ready for migration.");
      }

      return {
        result: {
          files: results,
          totalFiles: jsonFiles.length,
          validFiles: totalValid,
          invalidFiles: totalInvalid,
          allValid: totalInvalid === 0,
        },
      };
    } catch (error) {
      console.error("❌ Validation failed:", error);
      throw error;
    }
  },
});

async function validateTemplateFile(
  filename: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    filename,
    valid: false,
    errors: [],
    warnings: [],
  };

  try {
    // Читаем и парсим JSON
    const filePath = join(process.cwd(), "data", "templates", filename);
    const fileContent = await readFile(filePath, "utf-8");

    let templateData: any;
    try {
      templateData = JSON.parse(fileContent);
    } catch (parseError) {
      result.errors.push(`Invalid JSON format: ${parseError}`);
      return result;
    }

    // Валидируем основную структуру
    if (!templateData.name || typeof templateData.name !== "string") {
      result.errors.push('Missing or invalid "name" field');
    }

    if (!templateData.meals || !Array.isArray(templateData.meals)) {
      result.errors.push('Missing or invalid "meals" field (must be array)');
      return result;
    }

    if (templateData.meals.length === 0) {
      result.errors.push("Template must have at least one meal");
    }

    // Валидируем meals
    let totalCategories = 0;
    let totalIngredients = 0;

    templateData.meals.forEach((meal: any, mealIndex: number) => {
      if (!meal.name || typeof meal.name !== "string") {
        result.errors.push(
          `Meal ${mealIndex + 1}: Missing or invalid "name" field`
        );
      }

      if (!meal.categories || !Array.isArray(meal.categories)) {
        result.errors.push(
          `Meal ${
            mealIndex + 1
          }: Missing or invalid "categories" field (must be array)`
        );
        return;
      }

      if (meal.categories.length === 0) {
        result.warnings.push(`Meal "${meal.name}" has no categories`);
      }

      // Валидируем categories
      meal.categories.forEach((category: any, categoryIndex: number) => {
        totalCategories++;

        if (!category.name || typeof category.name !== "string") {
          result.errors.push(
            `Meal "${meal.name}", Category ${
              categoryIndex + 1
            }: Missing or invalid "name" field`
          );
        }

        if (!category.ingredients || !Array.isArray(category.ingredients)) {
          result.errors.push(
            `Meal "${meal.name}", Category "${category.name}": Missing or invalid "ingredients" field (must be array)`
          );
          return;
        }

        if (category.ingredients.length === 0) {
          result.warnings.push(
            `Category "${category.name}" in meal "${meal.name}" has no ingredients`
          );
        }

        // Валидируем ingredients
        category.ingredients.forEach(
          (ingredient: any, ingredientIndex: number) => {
            totalIngredients++;

            if (!ingredient.name || typeof ingredient.name !== "string") {
              result.errors.push(
                `Meal "${meal.name}", Category "${category.name}", Ingredient ${
                  ingredientIndex + 1
                }: Missing or invalid "name" field`
              );
            }

            if (
              typeof ingredient.calories !== "number" ||
              ingredient.calories < 0
            ) {
              result.errors.push(
                `Ingredient "${ingredient.name}": Invalid "calories" field (must be positive number)`
              );
            }

            if (
              typeof ingredient.proteins !== "number" ||
              ingredient.proteins < 0
            ) {
              result.errors.push(
                `Ingredient "${ingredient.name}": Invalid "proteins" field (must be positive number)`
              );
            }

            if (typeof ingredient.grams !== "number" || ingredient.grams <= 0) {
              result.errors.push(
                `Ingredient "${ingredient.name}": Invalid "grams" field (must be positive number)`
              );
            }
          }
        );
      });
    });

    // Добавляем статистику
    result.stats = {
      mealsCount: templateData.meals.length,
      categoriesCount: totalCategories,
      ingredientsCount: totalIngredients,
    };

    // Проверяем, что нет ошибок
    result.valid = result.errors.length === 0;

    return result;
  } catch (error) {
    result.errors.push(`Failed to read file: ${error}`);
    return result;
  }
}
