import { Saga, SagaStep } from "./saga.model";
import winston from "winston";

export class SagaOrchestrator {
  private sagas: Map<string, Saga> = new Map();

  public registerSaga(saga: Saga): void {
    this.sagas.set(saga.id, saga);
  }

  public async executeSaga(id: string, data: any): Promise<void> {
    const saga = this.sagas.get(id);

    if (!saga) {
      winston.error(`Saga with id ${id} not found.`);
      throw new Error(`Saga with id ${id} not found.`);
    }

    for (const step of saga.steps) {
      try {
        await step.action(data);
      } catch (error) {
        console.error(`Error executing step ${step.name}:`, error);
        winston.error(`Error executing step ${step.name}: ${error}`);
        await this.executeCompensations(saga, step, data);
        throw error; // Rethrow the error to indicate saga failure
      }
    }
  }

  private async executeCompensations(
    saga: Saga,
    failedStep: SagaStep,
    data: any
  ): Promise<void> {
    const reversedSteps = [...saga.steps].reverse();
    const failedStepIndex = reversedSteps.findIndex(
      (step) => step === failedStep
    );

    for (let i = 0; i <= failedStepIndex; i++) {
      const step = reversedSteps[i];
      if (step.compensation) {
        try {
          await step.compensation(data);
        } catch (error) {
          winston.error(
            `Error executing compensation for step ${step.name}: ${error}`
          );
          console.error(
            `Error executing compensation for step ${step.name}:`,
            error
          );
        }
      }
    }
  }
}
