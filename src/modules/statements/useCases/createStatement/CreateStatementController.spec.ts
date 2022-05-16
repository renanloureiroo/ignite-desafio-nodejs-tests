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
  beforeAll(async () => {
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

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to a new create statement deposit", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    });

    const { token } = body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toHaveProperty("id");
      });
  });

  it("should be able to a new create statement withdraw", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    });

    const { token } = body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Withdraw statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toHaveProperty("id");
      });
  });

  it("should not be able to a new create statement withdraw with insufficient funds", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    });

    const { token } = body;

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Withdraw statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(400)
      .expect((response) => {
        expect(response.body).toEqual({
          message: "Insufficient funds",
        });
      });
  });
});
