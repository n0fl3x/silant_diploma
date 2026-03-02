export interface ClaimItem {
  id: number;
  failure_date: string;
  operating_hours: number;
  failure_node: number;
  failure_node_name: string;
  failure_description: string | null;
  recovery_method: number | null;
  recovery_method_name: string | null;
  spare_parts: string | null;
  recovery_date: string | null;
  downtime_days: number;
  machine: number;
  machine_factory_number: string;
}
