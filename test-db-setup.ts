import { ObjectId } from "mongodb";
import { InferSchemaType, Types } from "mongoose";
import { adminId, regularId } from "./constants";

export const adminUserSeedData = {
  _id: new ObjectId(adminId), // Specific ObjectId for admin
  id: 379669528,
  firstName: "AdminSeedFirstName",
  lastName: "AdminSeedLastName",
  username: "testadminseeduser",
  photoUrl: "https://example.com/adminseed.jpg",
  authDate: Math.floor(Date.now() / 1000) - 7200,
  hash: "seed-admin-hash",
  address: "0xb75f1a7a3c9c60857A37A3C008E5619f0a934673",
  privateKey:
    "0xcb4d8dd1bd0859cde9e07fc96011fb53a80c7aff4968a199197b59efbb759b14",
  role: "admin",
};

export const regularUserSeedData = {
  _id: new ObjectId(regularId), // Specific ObjectId for regular user
  id: 123456789, // Telegram ID, must match regularUserLoginPayload in users.test.ts
  firstName: "RegularSeedUser",
  lastName: "TestSeed",
  username: "testregularseeduser",
  photoUrl: "https://example.com/regularseed.jpg",
  authDate: Math.floor(Date.now() / 1000) - 7200,
  hash: "seed-regular-hash", // Placeholder
  role: "user",
  address: "0xCa23Cfc3dffE0bC7E8fFdbE1240008ad592da1d5",
  privateKey:
    "0xce60ab2312c1f4e507f59e196f6c4e8a9d664bdfac74d1e0cffaa4debd236f4e",
  meta: {
    managerId: adminUserSeedData.id, // Link to admin user
  },
};

export const mealTestData = {
  _id: new ObjectId("64f1b2c8d4f1b2c8d4f1b2c9"),
  name: "Test Meal",
  userId: regularId,
} satisfies Omit<
  InferSchemaType<typeof schemaMeals> & {
    _id: Types.ObjectId;
  },
  "createdAt" | "updatedAt"
>;

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
    await ModelUser.deleteMany({});
    await ModelIngredients.deleteMany({});
    await ModelCategories.deleteMany({});
    await ModelMeals.deleteMany({});
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
    await ModelUser.create([adminUserSeedData, regularUserSeedData]);
    await ModelMeals.create(mealTestData);
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
