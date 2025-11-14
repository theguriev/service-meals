let categoryId: string;

describe.sequential("Categories API", () => {
	describe("POST /categories", () => {
		it("should create a new category", async () => {
			const newCategory = { name: "Category A" };
			await $fetch(`/categories`, {
				baseURL: process.env.API_URL,
				method: "POST",
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				body: newCategory,
				onResponse: ({ response }) => {
					expect(response.status).toBe(200);
					expect(response._data.message).toBe("Item added successfully");
					expect(response._data.data).toMatchObject(newCategory);
					categoryId = response._data.data._id; // Save categoryId for later tests
				},
			});
		});

		it("should return a validation error if name is missing", async () => {
			await $fetch(`/categories`, {
				baseURL: process.env.API_URL,
				method: "POST",
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

		it("should return 403 if user can't create category", async () => {
			await $fetch(`/categories`, {
				baseURL: process.env.API_URL,
				method: "POST",
				ignoreResponseError: true,
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_REGULAR_ACCESS_TOKEN};`,
				},
				body: { name: "Category for POST test" },
				onResponse: ({ response }) => {
					expect(response.status).toBe(403);
				},
			});
		});
	});

	describe("GET /categories (general listing, if applicable)", () => {
		it("should retrieve a list of all categories (paginated)", async () => {
			await $fetch("/categories", {
				baseURL: process.env.API_URL,
				method: "GET",
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				query: { limit: 5, offset: 0 },
				onResponse: ({ response }) => {
					expect(response.status).toBe(200);
					expect(Array.isArray(response._data)).toBe(true);
				},
			});
		});
	});

	describe("GET /categories/{id}", () => {
		it("should retrieve a single category by ID", async () => {
			await $fetch(`/categories/${categoryId}`, {
				baseURL: process.env.API_URL,
				method: "GET",
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				onResponse: ({ response }) => {
					expect(response.status).toBe(200);
					expect(response._data._id).toBe(categoryId);
				},
			});
		});

		it("should return 400 on invalid ID format", async () => {
			await $fetch(`/categories/invalid-id`, {
				baseURL: process.env.API_URL,
				method: "GET",
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

		it("should return 404 on non-existent ID", async () => {
			await $fetch(`/categories/000000000000000000000000`, {
				baseURL: process.env.API_URL,
				ignoreResponseError: true,
				method: "GET",
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

	describe("PUT /categories/{id}", () => {
		it("should update an existing category", async () => {
			const updatedCategoryData = { name: "Updated Category Name" };
			await $fetch(`/categories/${categoryId}`, {
				baseURL: process.env.API_URL,
				method: "PUT",
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				body: updatedCategoryData,
				onResponse: ({ response }) => {
					expect(response.status).toBe(200);
					expect(response._data.message).toBe("Item updated successfully");
					expect(response._data.ingredient.name).toBe(updatedCategoryData.name);
				},
			});
		});

		it("should return 404 if trying to update a non-existent category", async () => {
			const nonExistentId = "605c72ef29592b001c000000";
			await $fetch(`/categories/${nonExistentId}`, {
				baseURL: process.env.API_URL,
				method: "PUT",
				ignoreResponseError: true,
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				body: { name: "Update Non Existent" },
				onResponse: ({ response }) => {
					expect(response.status).toBe(404);
					expect(response._data.message).toBe("Item not found");
				},
			});
		});

		it("should return 400 if category ID is invalid", async () => {
			const invalidId = "invalid-id-format";
			await $fetch(`/categories/${invalidId}`, {
				baseURL: process.env.API_URL,
				method: "PUT",
				ignoreResponseError: true,
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				body: { name: "Update Invalid Id" },
				onResponse: ({ response }) => {
					expect(response.status).toBe(400);
					expect(response._data.message).toBe("Invalid item ID");
				},
			});
		});
	});

	describe("DELETE /categories/{id}", () => {
		it("should delete an existing category", async () => {
			await $fetch(`/categories/${categoryId}`, {
				baseURL: process.env.API_URL,
				method: "DELETE",
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

		it("should return 404 if trying to delete a non-existent category", async () => {
			const nonExistentId = "605c72ef29592b001c000000";
			await $fetch(`/categories/${nonExistentId}`, {
				baseURL: process.env.API_URL,
				method: "DELETE",
				ignoreResponseError: true,
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				onResponse: ({ response }) => {
					expect(response.status).toBe(404);
					expect(response._data.message).toBe("Item not found");
				},
			});
		});

		it("should return 400 if category ID is invalid", async () => {
			const invalidId = "invalid-id-format";
			await $fetch(`/categories/${invalidId}`, {
				baseURL: process.env.API_URL,
				method: "DELETE",
				ignoreResponseError: true,
				headers: {
					Accept: "application/json",
					Cookie: `accessToken=${process.env.VALID_ADMIN_ACCESS_TOKEN};`,
				},
				onResponse: ({ response }) => {
					expect(response.status).toBe(400);
					expect(response._data.message).toBe("Invalid item ID");
				},
			});
		});
	});
});
