declare module './AugmentationManager' {
  type AugmentationData = {
    actions?: ActionObject[];
    conditions?: ConditionObject[];
    conditionEvaluation?: Condition['evaluate_with'];
    description?: string;
    name?: string;
    isActive?: boolean;
    isPinning?: boolean;
  };
}

export {};
