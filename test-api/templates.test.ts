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

          templateId = response._data.data._id; // Store the created template ID for later tests
        },
      });
    });

    it("should return 400 for invalid data", async () => {
      const invalidTemplate = {
        // Missing required fields
      };
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

  describe("GET /templates/:id", () => {
    it("should return a template by id (200)", async () => {
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
          // Проверяем, что meals заполнились через populate (если есть)
          if (response._data.meals) {
            expect(Array.isArray(response._data.meals)).toBe(true);
          }
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

  describe("DELETE /templates/:id", () => {
    it("should delete a template by id (200)", async () => {
      let createdId = "";
      await $fetch("/templates", {
        method: "POST",
        baseURL: process.env.API_URL,
        body: { name: "Template to Delete" },
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          createdId = response._data.data._id;
        },
      });
      await $fetch(`/templates/${createdId}`, {
        method: "DELETE",
        baseURL: process.env.API_URL,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Item deleted successfully");
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
  });
});
