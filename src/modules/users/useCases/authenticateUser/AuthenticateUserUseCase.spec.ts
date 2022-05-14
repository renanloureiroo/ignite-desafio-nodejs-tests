import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let usersRepository: IUsersRepository;
let authenticateUserCase: AuthenticateUserUseCase;

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate a user", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    };
    const user = await usersRepository.create(userData);
    console.log(user);

    // const token = await authenticateUserCase.execute({
    //   email: userData.email,
    //   password: userData.password,
    // });

    // expect(token).toHaveProperty("token");
  });
});
