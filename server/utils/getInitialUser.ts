import type { H3Event } from "h3";

type User = {
  _id: string;
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  authDate?: number;
  hash: string;
  role?: string;
  permissions: string[];
  address: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

const getInitialUser = async (event: H3Event, baseURL: string) => {
  if (process.env.VITEST === "true") {
    const _id = await getId(event);
    const role = await getRole(event);
    return {
      _id,
      id: "test",
      username: "test",
      firstName: "test",
      lastName: "test",
      photoUrl: "test",
      authDate: 1234567890,
      hash: "test",
      role,
      permissions: [],
      address: "test",
      meta: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    } as User;
  }

  return await $fetch<User>(`/initial`, {
    baseURL,
    headers: {
      Cookie: String(getHeader(event, "cookie")),
      Accept: "application/json",
    },
    retry: 5,
    retryDelay: 1000,
  });
};

export default getInitialUser;
