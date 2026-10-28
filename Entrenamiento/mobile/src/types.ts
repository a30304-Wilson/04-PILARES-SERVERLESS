export const ZONE_STATUSES = ['OPEN', 'FULL', 'CLOSED'] as const;
export type ZoneStatus = (typeof ZONE_STATUSES)[number];

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  status: ZoneStatus;
}
export type ZoneInput = Omit<Zone, 'id'>;