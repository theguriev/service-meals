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
});
