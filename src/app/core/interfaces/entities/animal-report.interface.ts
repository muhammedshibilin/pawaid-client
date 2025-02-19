import { AnimalStatus } from "../../enums/animal-status.enum";

export interface IAnimalReport {
    _id: string;
    description: string;
    imageUrl: string;
    status: AnimalStatus;
    location: {
      latitude: number;
      longitude: number;
    };
    userId: string;
    recruiterId?: string | string[];
    doctorId?: string | string[];
    expenses?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }