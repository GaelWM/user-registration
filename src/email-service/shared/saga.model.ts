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
  UserCreated = "UserCreated",
}

export enum TopicNames {
  UserCreated = "UserCreated",
  EmailSent = "EmailSent",
  EmailNotSent = "EmailNotSent",
}
