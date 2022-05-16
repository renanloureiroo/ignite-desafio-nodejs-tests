import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest";

import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";
import { hash } from "bcryptjs";
import { app } from "../../../../app";

const jwtMocked = {
  jwt: {
    secret: "secret",
    expiresIn: "1d",
  },
};

jest.mock("../../../../config/auth");

let connection: Connection;

describe("GetBalanceController", () => {
  beforeEach(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    const password = await hash("123456", 8);
    const id = uuid();
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at)
        VALUES('${id}', 'John Doe', 'johndoe@email.com', '${password}', 'now()')`
    );

    jest.mocked(authConfig).jwt = jwtMocked.jwt;
  });

  afterEach(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    });

    const { token } = body;

    await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("balance");
        expect(response.body).toHaveProperty("statement");
      });
  });
});
