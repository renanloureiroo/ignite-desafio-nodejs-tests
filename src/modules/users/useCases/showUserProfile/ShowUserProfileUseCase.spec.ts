import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show user profile", async () => {
    const user = await usersRepository.create({
      name: "John doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    const userProfile = await showUserProfileUseCase.execute(user.id!);

    expect(userProfile).toHaveProperty("id");
    expect(userProfile).toHaveProperty("name");
    expect(userProfile).toHaveProperty("email");
  });

  it("should not be able to show the profile, with a non-existing user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non-existing-user");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
