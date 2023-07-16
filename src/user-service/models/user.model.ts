import mongoose, { Query } from "mongoose";
import winston from "winston";

export interface IUser {
  name: string;
  email: string;
  password: string;
  status: "Verified" | "Not Verified";
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
  },
  status: {
    type: String,
    required: true,
    enum: ["Verified", "Not Verified"],
    default: "active",
  },
});

const User = mongoose.model("User", userSchema);

const getUsers = async (): Promise<
  mongoose.Document<unknown, {}, IUser[]>[]
> => {
  try {
    return await User.find().sort("name");
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const getUser = async (
  email: string
): Promise<mongoose.Document<unknown, {}, IUser> | null> => {
  try {
    return await User.findOne({ email });
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<mongoose.Document<unknown, {}, IUser> | null> => {
  const user = new User({
    name,
    email,
    password,
  });

  try {
    await user.save();
    return user;
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const updateUser = async (
  email: string,
  name: string
): Promise<mongoose.Document<unknown, {}, IUser> | null> => {
  try {
    return await User.findOneAndUpdate(
      { email },
      { $set: { name } },
      { new: true }
    );
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const deleteUser = async (
  email: string
): Promise<mongoose.Document<unknown, {}, IUser> | null> => {
  try {
    return User.findOneAndDelete({ email });
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

export { User, createUser, updateUser, getUser, getUsers, deleteUser };
