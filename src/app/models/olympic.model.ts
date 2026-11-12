import {Participation} from '@models/participation.model';

export interface Olympic {
  id: number,
  country: string,
  participations: Participation[]
}
