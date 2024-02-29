export interface Family {
    uuid: number;
    name: string;
    isDel: boolean;
}

export interface Mechanism {
    uuid: number;
    name: string;
    isDel: boolean;
}

export interface ProperyType {
  uuid: number;
  name: string;
  units: string;
  validation: string;
  isDel: boolean;
}

export interface Reaction {
  uuid: number;
  type: string;
  isDel: boolean;
}

export interface Species {
  uuid: number;
  type: string;
  isDel: boolean;
}

export interface TagMechanism {
  uuid: number;
  tag: string;
  isDel: boolean;
}