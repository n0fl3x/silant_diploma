import type { Machine } from "./Machine";

export interface MachineTableProps {
  onMachineSelect?: (machine: Machine) => void;
  initialPage?: number;
  itemsPerPage?: number;
  filterModelTech?: string | null;
  filterEngineModel?: string | null;
  filterTransmissionModel?: string | null;
  filterSteeringAxleModel?: string | null;
  filterDriveAxleModel?: string | null;
  onFilterChange?: (filters: {
    modelTech?: string | null;
    engineModel?: string | null;
    transmissionModel?: string | null;
    steeringAxleModel?: string | null;
    driveAxleModel?: string | null;
  }) => void;
}
