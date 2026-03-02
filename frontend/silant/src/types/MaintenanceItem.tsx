export interface MaintenanceItem {
  id: number;
  maintenance_date: string;
  operating_hours: number;
  work_order_number: string | null;
  work_order_date: string | null;
  machine: {
    id: number;
    factory_number: string;
    model_tech_name: string;
    model_tech_id: number;
  };
  maintenance_type: {
    id: number;
    name: string;
  };
  service_company: {
    description: string;
  };
}
