import { defaultTemplateName } from "../constants";

let templateId: string;
describe.sequential("Templates API", () => {
  describe("POST /templates", async () => {
    it("should create a new template (200)", async () => {
      const newTemplate = {
        name: "Test Template",
      };
      await $fetch("/templates", {
        method: "POST",
        baseURL: process.env.API_URL,
        body: newTemplate,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.data).toHaveProperty("_id");
          expect(response._data.data.name).toBe(newTemplate.name);

          templateId = response._data.data._id;
        },
      });
    });

    it("should return 400 for invalid data", async () => {
      const invalidTemplate = {};
      await $fetch("/templates", {
        method: "POST",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: invalidTemplate,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });
  });

  describe("GET /templates", () => {
    it("should return a list of templates (200)", async () => {
      await $fetch("/templates", {
        method: "GET",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(Array.isArray(response._data)).toBe(true);
          expect(response._data[0]).toHaveProperty("_id");
          expect(response._data[0]).toHaveProperty("name");
        },
      });
    });
  });

  describe("GET /templates/default", () => {
    it("should return the default template (200)", async () => {
      await $fetch("/templates/default", {
        method: "GET",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response._data).toHaveProperty("_id");
          expect(response._data).toHaveProperty("name", defaultTemplateName);
          expect(response._data).toHaveProperty("categories");
        },
      });
    });
  });

  describe("GET /templates/:id", () => {
    it("should return a template by id (200)", async () => {
      let categoryId = "";
      await $fetch(`/categories`, {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { name: "Test Category", templateId },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          categoryId = response._data.data._id;
        },
      });

      let ingredientId = "";
      await $fetch(`/ingredients`, {
        method: "POST",
        baseURL: process.env.API_URL,
        body: {
          name: "Test Ingredient",
          calories: 100,
          proteins: 10,
          grams: 50,
          categoryId,
        },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          ingredientId = response._data.data._id;
        },
      });

      await $fetch(`/templates/${templateId}`, {
        method: "GET",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data).toHaveProperty("_id");
          expect(response._data).toHaveProperty("name");
          expect(response._data._id).toBe(templateId);
          expect(Array.isArray(response._data.categories)).toBe(true);
          expect(response._data.categories.length === 1).toBe(true);
          expect(response._data.categories[0]).toHaveProperty("_id");
          expect(
            Array.isArray(response._data.categories[0].ingredients)
          ).toBe(true);
          expect(
            response._data.categories[0].ingredients.length === 1
          ).toBe(true);
        },
      });
    });

    it("should return 400 for invalid id", async () => {
      await $fetch("/templates/invalid_id", {
        method: "GET",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 for non-existent id", async () => {
      const nonExistentId = "60d21b4667d0d8992e610c85";
      await $fetch(`/templates/${nonExistentId}`, {
        method: "GET",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 403 for non-admin user", async () => {
      await $fetch(`/templates/${templateId}`, {
        method: "GET",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(403);
        },
      });
    });
  });

  describe("PUT /templates/:id", () => {
    it("should update a template by id (200)", async () => {
      const updatedData = { name: "Updated Template Name" };
      await $fetch(`/templates/${templateId}`, {
        method: "PUT",
        baseURL: process.env.API_URL,
        body: updatedData,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.data).toHaveProperty("_id");
          expect(response._data.data.name).toBe(updatedData.name);
        },
      });
    });

    it("should return 400 for invalid id", async () => {
      await $fetch("/templates/invalid_id", {
        method: "PUT",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: { name: "Should Fail" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 for non-existent id", async () => {
      const nonExistentId = "60d21b4667d0d8992e610c85";
      await $fetch(`/templates/${nonExistentId}`, {
        method: "PUT",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: { name: "Should Not Exist" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });
  });

  describe("POST /templates/:id/apply", () => {
    it("should apply template to user (200)", async () => {
      const targetUserId = "test_user_123";

      await $fetch(`/templates/${templateId}/apply`, {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { userId: targetUserId },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Template applied successfully");
          expect(response._data.data).toHaveProperty("templateId");
          expect(response._data.data).toHaveProperty("userId");
          expect(response._data.data.userId).toBe(targetUserId);
          expect(response._data.data.templateId).toBe(templateId);
          expect(response._data.data.applied).toHaveProperty("categories");
          expect(response._data.data.applied).toHaveProperty("ingredients");
          expect(response._data.data.applied.categories).toBeGreaterThan(0);
          expect(Array.isArray(response._data.data.createdCategories)).toBe(true);
          expect(response._data.data.createdCategories.length).toBe(
            response._data.data.applied.categories
          );
          response._data.data.createdCategories.forEach((category) => {
            expect(category.userId).toBe(targetUserId);
            expect(category.templateId).toBe(null);
          });
          expect(response._data.data.summary).toHaveProperty("templateName");
          expect(response._data.data.summary).toHaveProperty("appliedAt");
        },
      });
    });

    it("should return 400 for invalid template id", async () => {
      await $fetch("/templates/invalid_id/apply", {
        method: "POST",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: { userId: "test_user" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 400 for missing userId", async () => {
      await $fetch(`/templates/${templateId}/apply`, {
        method: "POST",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: {}, // Missing userId
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 for non-existent template", async () => {
      const nonExistentId = "60d21b4667d0d8992e610c85";
      await $fetch(`/templates/${nonExistentId}/apply`, {
        method: "POST",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: { userId: "test_user" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 403 for non-admin user", async () => {
      await $fetch(`/templates/${templateId}/apply`, {
        method: "POST",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        body: { userId: "test_user" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(403);
        },
      });
    });
  });

  describe("DELETE /templates/:id", () => {
    it("should delete template and all related data (200)", async () => {
      let testTemplateId = "";
      let testCategoryId = "";
      let testIngredientId = "";

      await $fetch("/templates", {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { name: "Template for Cascade Delete Test" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          testTemplateId = response._data.data._id;
        },
      });

      await $fetch(`/categories`, {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { name: "Test Category for Cascade Delete", templateId: testTemplateId },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          testCategoryId = response._data.data._id;
        },
      });

      await $fetch(`/ingredients`, {
        method: "POST",
        baseURL: process.env.API_URL,
        body: {
          name: "Test Ingredient for Cascade Delete",
          calories: 150,
          proteins: 20,
          grams: 75,
          categoryId: testCategoryId,
        },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          testIngredientId = response._data.data._id;
        },
      });

      await $fetch(`/templates/${testTemplateId}`, {
        method: "DELETE",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe(
            "Template and all related data deleted successfully"
          );

          expect(response._data.deletedTemplates).toHaveProperty(
            "acknowledged"
          );
          expect(response._data.deletedTemplates).toHaveProperty(
            "deletedCount"
          );
          expect(response._data.deletedTemplates.deletedCount).toBe(1);

          expect(response._data.deletedCategories).toHaveProperty(
            "acknowledged"
          );
          expect(response._data.deletedCategories).toHaveProperty(
            "deletedCount"
          );
          expect(response._data.deletedCategories.deletedCount).toBe(1);

          expect(response._data.deletedIngredients).toHaveProperty(
            "acknowledged"
          );
          expect(response._data.deletedIngredients).toHaveProperty(
            "deletedCount"
          );
          expect(response._data.deletedIngredients.deletedCount).toBe(1);
        },
      });

      await $fetch(`/templates/${testTemplateId}`, {
        method: "GET",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });

      await $fetch(`/categories/${testCategoryId}`, {
        method: "GET",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should delete empty template without errors (200)", async () => {
      let emptyTemplateId = "";
      await $fetch("/templates", {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { name: "Empty Template for Delete" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          emptyTemplateId = response._data.data._id;
        },
      });

      await $fetch(`/templates/${emptyTemplateId}`, {
        method: "DELETE",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe(
            "Template and all related data deleted successfully"
          );

          expect(response._data.deletedTemplates.deletedCount).toBe(1);
          expect(response._data.deletedCategories.deletedCount).toBe(0);
          expect(response._data.deletedIngredients.deletedCount).toBe(0);
        },
      });
    });

    it("should return 400 for invalid id", async () => {
      await $fetch("/templates/invalid_id", {
        method: "DELETE",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });

    it("should return 404 for non-existent id", async () => {
      const nonExistentId = "60d21b4667d0d8992e610c85";
      await $fetch(`/templates/${nonExistentId}`, {
        method: "DELETE",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("should return 403 for non-admin user", async () => {
      await $fetch(`/templates/${templateId}`, {
        method: "DELETE",
        baseURL: process.env.API_URL,
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(403);
        },
      });
    });
  });
});
