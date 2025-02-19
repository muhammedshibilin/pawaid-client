import { IAnimalReport } from "../entities/animal-report.interface";
import { IDoctor } from "../entities/doctor.interface";

export interface AnimalReportUpdateResponse {
    status: number;
    message: string;
    data: IAnimalReport;
    doctors?: IDoctor[];
  }