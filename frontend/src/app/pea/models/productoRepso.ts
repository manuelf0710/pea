import { tipoProducto } from "./tipoproducto";
import { regional } from "../../models/regional";
export interface productoRepso {
  id?: number;
  anio: number;
  contrato: { id; nombre };
  contrato_id: number;
  descripcion: String;
  regional: regional;
  regional_id: number;
  tipo_producto: tipoProducto;
  tipoproducto_id: number;
  cantidad:number;
}
