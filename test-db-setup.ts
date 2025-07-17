import { ObjectId } from "mongodb";
import { InferSchemaType, Types } from "mongoose";
import { regularId } from "./constants";

export const mealTestData = {
  _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2c9"),
  name: "Test Meal",
  userId: regularId,
} satisfies Omit<InferSchemaType<typeof schemaMeals> & {
  _id: Types.ObjectId;
}, "createdAt" | "updatedAt">;

export const categoriesTestData = [
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2c9"),
    name: "Test Category",
    mealId: mealTestData._id,
    userId: regularId,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2ca"),
    name: "Test Category 2",
    mealId: mealTestData._id,
    userId: regularId,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cb"),
    name: "Test Category 3",
    mealId: mealTestData._id,
    userId: regularId,
  },
] satisfies Omit<InferSchemaType<typeof schemaCategories> & {
  _id: Types.ObjectId;
}, "createdAt" | "updatedAt">[];

export const ingredientsTestData = [
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2c9"),
    name: "Test Ingredient",
    categoryId: categoriesTestData[0]._id,
    userId: regularId,
    calories: 100,
    proteins: 10,
    grams: 50,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2ca"),
    name: "Test Ingredient 2",
    categoryId: categoriesTestData[0]._id,
    userId: regularId,
    calories: 200,
    proteins: 20,
    grams: 100,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cb"),
    name: "Test Ingredient 3",
    categoryId: categoriesTestData[0]._id,
    userId: regularId,
    calories: 300,
    proteins: 30,
    grams: 150,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cc"),
    name: "Test Ingredient 4",
    categoryId: categoriesTestData[1]._id,
    userId: regularId,
    calories: 400,
    proteins: 40,
    grams: 200,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cd"),
    name: "Test Ingredient 5",
    categoryId: categoriesTestData[1]._id,
    userId: regularId,
    calories: 500,
    proteins: 50,
    grams: 250,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2ce"),
    name: "Test Ingredient 6",
    categoryId: categoriesTestData[2]._id,
    userId: regularId,
    calories: 600,
    proteins: 60,
    grams: 300,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cf"),
    name: "Test Ingredient 7",
    categoryId: categoriesTestData[2]._id,
    userId: regularId,
    calories: 700,
    proteins: 70,
    grams: 350,
  },
] satisfies Omit<InferSchemaType<typeof schemaIngredients> & {
  _id: Types.ObjectId;
}, "createdAt" | "updatedAt">[]

export async function clearTestData() {
  try {
    await ModelIngredients.deleteMany({});
    await ModelCategories.deleteMany({});
    await ModelMeals.deleteMany({});
    console.log(
      "\x1b[32m%s\x1b[0m",
      "✓",
      "Test database cleared successfully."
    );
  } catch (error) {
    console.error("Error clearing test database:", error);
    throw error; // Rethrow to fail test setup if clearing fails
  }
}

export async function seedTestData() {
  try {
    await ModelMeals.create(mealTestData);
    await ModelCategories.create(categoriesTestData);
    await ModelIngredients.create(ingredientsTestData);
    console.log("\x1b[32m%s\x1b[0m", "✓", "Test database seeded successfully.");
  } catch (error) {
    console.error("Error seeding test database:", error);
    if (error.code === 11000) {
      console.warn(
        "Duplicate key error during seeding. This might indicate an issue with clearing data or ObjectId reuse."
      );
    }
    throw error;
  }
}
