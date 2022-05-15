import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import authConfig from "../../../../config/auth";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserCase: AuthenticateUserUseCase;

const jwtMocked = {
  jwt: {
    secret: "secret",
    expiresIn: "1d",
  },
};

const userData = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "123456",
};

jest.mock("../../../../config/auth");

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserCase = new AuthenticateUserUseCase(usersRepository);

    jest.mocked(authConfig).jwt = jwtMocked.jwt;
  });

  it("should be able to authenticate a user", async () => {
    await createUserUseCase.execute(userData);

    const token = await authenticateUserCase.execute({
      email: userData.email,
      password: userData.password,
    });

    expect(token).toHaveProperty("token");
    expect(token).toHaveProperty("user");
  });

  it("should not be able to authenticate with non existing user", () => {
    expect(async () => {
      await authenticateUserCase.execute({
        email: userData.email,
        password: userData.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect email", () => {
    expect(async () => {
      await authenticateUserCase.execute({
        email: "incorrect@email.com",
        password: userData.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with incorrect password", () => {
    expect(async () => {
      await authenticateUserCase.execute({
        email: userData.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
