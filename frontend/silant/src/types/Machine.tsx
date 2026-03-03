export interface Machine {
  id: number;
  factory_number: string | null;
  model_tech: {
    id: number;
    name: string;
  } | null;
  engine_model: {
    id: number;
    name: string;
  } | null;
  engine_factory_number: string | null;
  transmission_model: {
    id: number;
    name: string;
  } | null;
  transmission_factory_number: string | null;
  drive_axle_model: {
    id: number;
    name: string;
  } | null;
  drive_axle_factory_number: string | null;
  steering_axle_model: {
    id: number;
    name: string;
  } | null;
  steering_axle_factory_number: string | null;
  delivery_contract: string | null;
  shipment_date: string;
  consignee: string | null;
  delivery_address: string | null;
  configuration: string | null;
  client_name: string;
  service_company_name: string;
  model_tech_options: Array<{ id: number; name: string }>;
  engine_model_options: Array<{ id: number; name: string }>;
  transmission_model_options: Array<{ id: number; name: string }>;
  drive_axle_model_options: Array<{ id: number; name: string }>;
  steering_axle_model_options: Array<{ id: number; name: string }>;
}
