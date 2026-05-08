import { PlanType } from './plan-type';
import { SustainabilityScore } from './sustainability-score';

export interface PlanSpecificationProps {
  type: PlanType;
  monthlyAmount: number;
  duration: number;
  totalRepayment: number;
  sustainability: SustainabilityScore;
}

export class PlanSpecification {
  readonly type: PlanType;
  readonly monthlyAmount: number;
  readonly duration: number;
  readonly totalRepayment: number;
  readonly sustainability: SustainabilityScore;

  private constructor(props: PlanSpecificationProps) {
    this.type = props.type;
    this.monthlyAmount = props.monthlyAmount;
    this.duration = props.duration;
    this.totalRepayment = props.totalRepayment;
    this.sustainability = props.sustainability;
  }

  static create(props: PlanSpecificationProps): PlanSpecification {
    if (props.monthlyAmount < 0) {
      throw new Error('Monthly amount must be non-negative');
    }
    if (props.duration <= 0) {
      throw new Error('Duration must be positive');
    }
    if (props.totalRepayment < 0) {
      throw new Error('Total repayment must be non-negative');
    }
    return new PlanSpecification(props);
  }

  static reconstruct(props: PlanSpecificationProps): PlanSpecification {
    return new PlanSpecification(props);
  }

  equals(other: PlanSpecification): boolean {
    return (
      this.type === other.type &&
      this.monthlyAmount === other.monthlyAmount &&
      this.duration === other.duration &&
      this.totalRepayment === other.totalRepayment &&
      this.sustainability === other.sustainability
    );
  }

  toJSON(): PlanSpecificationProps {
    return {
      type: this.type,
      monthlyAmount: this.monthlyAmount,
      duration: this.duration,
      totalRepayment: this.totalRepayment,
      sustainability: this.sustainability,
    };
  }
}
