let templateId;

const validAccessToken = issueAccessToken(
  { userId: 123 },
  { secret: process.env.SECRET }
);

describe.sequential("template", () => {
  describe("POST /templates", () => {
    it("should create a new template", async () => {
      const template = {
        userId: "123",
        name: "Weekly Plan",
        categories: [
          {
            name: "Breakfast",
            id: "cat1",
            ingredients: ["ing1", "ing2"],
          },
        ],
      };

      await $fetch("/templates", {
        baseURL: process.env.API_URL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: template,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe("Template added successfully");
          expect(response._data.template).toMatchObject(template);
          templateId = response._data.template._id;
        },
      });
    });

    it("gets 400 on validation errors", async () => {
      await $fetch("/templates", {
        baseURL: process.env.API_URL,
        method: "POST",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: {},
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
        },
      });
    });
  });

  describe("GET /templates", () => {
    it("gets 200 with a list of templates", async () => {
      await $fetch("/templates", {
        baseURL: process.env.API_URL,
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        query: { limit: 5, offset: 0 },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(Array.isArray(response._data)).toBe(true);
        },
      });
    });

    it("gets 500 for invalid query parameters", async () => {
      await $fetch("/templates", {
        baseURL: process.env.API_URL,
        method: "GET",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        query: { limit: -1, offset: -5 },
        onResponse: ({ response }) => {
          expect(response.status).toBe(500);
        },
      });
    });
  });
});
