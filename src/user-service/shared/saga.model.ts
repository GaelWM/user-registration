export interface Saga {
  id: string;
  name: string;
  steps: SagaStep[];
}

export interface SagaStep {
  name: string;
  action: (data: any) => Promise<void>;
  compensation?: (data: any) => Promise<void>;
}

export enum SagaStepEventType {
  CreateUser = "Create User",
  UpdateUserStatus = "Update User Status",
  PublishUserVerifiedEvent = "Publish User Verified Event",
}

export enum TopicNames {
  UserCreated = "UserCreated",
  EmailSent = "EmailSent",
  EmailVerified = "EmailVerified",
  EmailVerificationFailed = "EmailVerificationFailed",
}
