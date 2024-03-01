export interface Family {
    uuid: number;
    name: string;
    isdel: boolean;
}

export interface Mechanism {
    uuid: number;
    name: string;
    isdel: boolean;
}

export interface ProperyType {
  uuid: number;
  name: string;
  units: string;
  validation: string;
  isdel: boolean;
}

export interface Reaction {
  uuid: number;
  type: string;
  isdel: boolean;
}

export interface Species {
  uuid: number;
  type: string;
  isdel: boolean;
}

export interface TagMechanism {
  uuid: number;
  tag: string;
  isdel: boolean;
}