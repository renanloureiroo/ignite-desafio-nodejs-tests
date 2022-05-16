import { createConnection, getConnectionOptions } from "typeorm";

// (async () => await createConnection())();

export default async () => {
  const defaultOptions = await getConnectionOptions();
  return createConnection(
    Object.assign(defaultOptions, {
      database: process.env.NODE_TEST === "test" ? "fin_api_test" : "fin_api",
    })
  );
};
