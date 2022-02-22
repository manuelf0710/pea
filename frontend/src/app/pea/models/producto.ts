export interface producto {
  id?: number;
  producto_repso_id: number;
  producto_id?: number;
  user_id: number;
  sitio_id?: number;
  contrato?: String;
  descripcion?: String;
  cantidad?: number;
  estado_repso?: number;
  estado_id: number;
  cedula?: number;
  dependencia_id?: number;
  profesional_id?: number;
  fecha_programacion?: String;
  fecha_ejecucion?: String;
  modalidad?: number;
  ciudad_id?: number;
  direccion?: String;
  observaciones?: number;
}
