const baseURL = "http://localhost:4000";

let ingredientId;

const validAccessToken = issueAccessToken(
  { userId: 123 },
  { secret: process.env.SECRET }
);

describe.sequential("meal", () => {
  describe("POST /ingredients", () => {
    it("gets 400 on validation errors", async () => {
      await $fetch("/ingredients", {
        baseURL,
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

    it("gets 200 on valid ingredient data", async () => {
      const ingredientBody = {
        name: "Tomato",
        calories: 100,
      };

      await $fetch("/ingredients", {
        baseURL,
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: ingredientBody,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.ingredient).toMatchObject(ingredientBody);
          ingredientId = response._data.ingredient._id;
        },
      });
    });
  });

  describe("PUT /ingredients/{id}", () => {
    it("gets 404 for non-existent ingredient", async () => {
      await $fetch(`/ingredients/67fe0d2e5fd2cdf0e2014dd6`, {
        baseURL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: { name: "Updated Tomato" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("gets 400 for invalid ingredient ID", async () => {
      await $fetch(`/ingredients/invalid-id`, {
        baseURL,
        method: "PUT",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: { name: "Updated Tomato" },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid ingredient ID");
        },
      });
    });

    it("gets 200 for successful update", async () => {
      const updatedData = { name: "Updated Tomato", calories: 150 };

      await $fetch(`/ingredients/${ingredientId}`, {
        baseURL,
        method: "PUT",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        body: updatedData,
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.ingredient).toMatchObject(updatedData);
        },
      });
    });
  });

  describe("GET /ingredients", () => {
    it("gets 200 with a list of ingredients", async () => {
      await $fetch("/ingredients", {
        baseURL,
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
      await $fetch("/ingredients", {
        baseURL,
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

  describe("DELETE /ingredients/{id}", () => {
    it("gets 404 for non-existent ingredient", async () => {
      await $fetch(`/ingredients/67fe0d2e5fd2cdf0e2014dd6`, {
        baseURL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(404);
        },
      });
    });

    it("gets 400 for invalid ingredient ID", async () => {
      await $fetch(`/ingredients/invalid-id`, {
        baseURL,
        method: "DELETE",
        ignoreResponseError: true,
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400);
          expect(response._data.message).toBe("Invalid ingredient ID");
        },
      });
    });

    it("gets 200 for successful deletion", async () => {
      await $fetch(`/ingredients/${ingredientId}`, {
        baseURL,
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Cookie: `accessToken=${validAccessToken};`,
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200);
          expect(response._data.message).toBe(
            "Ingredient deleted successfully"
          );
        },
      });
    });
  });
});
