import { Request, Response } from "express";
import { UserController } from "../../controllers/user.controller";
import { User, getUsers } from "../../models/user.model";

describe("User Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("Sign Up", () => {
    it("should return a 200 response with a message", async () => {
      // Arrange
      const req = {
        body: {
          name: "John Doe",
          email: "johndoe@gmail.com",
          password: "password123",
        },
      } as Request;
      const res = {} as Response;

      // Act
      const userController = new UserController();
      await userController.signUp(req, res);

      // Assert
      const users = await getUsers();
      expect(users.length).toEqual(1);
      expect(users[0].toObject()[0].name).toEqual("John Doe");
    });

    describe("when user already exists", () => {
      beforeEach(async () => {
        await User.create({
          name: "John Doe",
          email: "johndoe@gmail.com",
          password: "password123",
        });
      });

      it("should return a 400 response with a message", async () => {
        // Arrange
        const req = {
          body: {
            name: "John Doe",
            email: "johndoe@gmail.com",
            password: "password123",
          },
        } as Request;
        const res = {} as Response;

        // Act
        const userController = new UserController();
        await userController.signUp(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "User already exists.",
        });
      });
    });
  });
});
