import { ObjectId } from "mongodb";
import { InferSchemaType, Types } from "mongoose";
import { regularId } from "./constants";

export const categoriesTestData = [
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2c9"),
    name: "Test Category",
    userId: regularId,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2ca"),
    name: "Test Category 2",
    userId: regularId,
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2cb"),
    name: "Test Category 3",
    userId: regularId,
  },
] satisfies Omit<
  InferSchemaType<typeof schemaCategories> & {
    _id: Types.ObjectId;
  },
  "createdAt" | "updatedAt"
>[];

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
] satisfies Omit<
  InferSchemaType<typeof schemaIngredients> & {
    _id: Types.ObjectId;
  },
  "createdAt" | "updatedAt"
>[];

export const notesTestData = [
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2d0"),
    content: "Today's note - should appear in default filter",
    userId: regularId,
    createdAt: new Date(), // Today
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2d1"),
    content: "Another note from today with search term test",
    userId: regularId,
    createdAt: new Date(), // Today
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2d2"),
    content: "Yesterday's note - should not appear in default filter",
    userId: regularId,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2d3"),
    content: "Note from 3 days ago with important info",
    userId: regularId,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2d4"),
    content: "Old note from last week",
    userId: regularId,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
] satisfies Omit<
  InferSchemaType<typeof schemaNotes> & {
    _id: Types.ObjectId;
  },
  ""
>[];

export async function clearTestData() {
  try {
    await ModelIngredients.deleteMany({});
    await ModelCategories.deleteMany({});
    await ModelNotes.deleteMany({});
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
    await ModelCategories.create(categoriesTestData);
    await ModelIngredients.create(ingredientsTestData);
    await ModelNotes.create(notesTestData);
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

// Helper function to create note with specific date for testing
export function createNoteWithDate(content: string, daysAgo: number = 0) {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    content,
    userId: regularId,
    createdAt: date,
    updatedAt: date,
  };
}
