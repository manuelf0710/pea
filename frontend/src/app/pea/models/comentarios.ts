export interface comentarios {
  id: number;
  comentario: String;
  creado: String;
  tipo: String;
  estadoseguimiento_id?: number;
  estado_id: number;
  estado: String;
  estado_seguimiento?: String;
  usuario_comentario: String;
}
