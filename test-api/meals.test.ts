const baseURL = "http://localhost:4000";

const mealBody = {
  timestamp: Date.now(),
  type: "temperature",
  meta: {
    unit: "Celsius",
    location: "office",
  },
};

let mealId = undefined;

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
        },
      });
    });
  });
});
