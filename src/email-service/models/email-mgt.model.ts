import mongoose from "mongoose";
import winston from "winston";

export interface IEmailMgt {
  token: string;
  email: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
  },
});

const EmailMgt = mongoose.model("EmailMgt", userSchema);

const getEmails = async (): Promise<
  mongoose.Document<unknown, {}, IEmailMgt[]>[]
> => {
  try {
    return await EmailMgt.find().sort("email");
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const getEmail = async (
  email: string
): Promise<mongoose.Document<unknown, {}, IEmailMgt> | null> => {
  try {
    return await EmailMgt.findOne({ email });
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const saveEmail = async (
  token: string,
  email: string
): Promise<mongoose.Document<unknown, {}, IEmailMgt> | null> => {
  const emailMgt = new EmailMgt({
    token,
    email,
  });

  try {
    await emailMgt.save();
    return emailMgt;
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const updateEmail = async (
  email: string,
  token: string
): Promise<mongoose.Document<unknown, {}, IEmailMgt> | null> => {
  try {
    return await EmailMgt.findOneAndUpdate(
      { email },
      { $set: { token } },
      { new: true }
    );
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

const deleteEmail = async (
  email: string
): Promise<mongoose.Document<unknown, {}, IEmailMgt> | null> => {
  try {
    return EmailMgt.findOneAndDelete({ email });
  } catch (error: any) {
    winston.error(error.message);
    throw new Error(error);
  }
};

export { EmailMgt, getEmails, getEmail, saveEmail, updateEmail, deleteEmail };
