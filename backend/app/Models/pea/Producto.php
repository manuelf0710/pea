<?php

namespace App\Models\pea;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class Producto extends Model
{
	use Notifiable;
	public $timestamps = true;
	use SoftDeletes;

	protected $fillable = [
		'producto_repso_id',
		'user_id',
		'estado_id',
		'producto_id',
		'sitio_id',
		'descripcion',
		'cantidad',
		'estado_repso',
		'cedula',
		'dependencia_id',
		'fecha_programacion',
		'modalidad',
		'ciudad_id',
		'direccion',
		'observaciones'
	];

	protected $dates = ['deleted_at'];
	protected $hidden = ['updated_at', 'deleted_at'];
	public static $directionOrder = ['ASC', 'ASC'];

	public static $customMessages = [
		'required' => 'Cuidado!! el campo :attribute no puede ser vacío',
		'unique' => 'Error! el valor de :attribute ya se encuentra registrado',
		'max' => 'Error! el valor de :attribute supero el tope permitido',
		'integer' => 'Error! el valor de :attribute debe ser un número sin comas ni puntos'
	];

	public static function rules(Request $request, $id = null)
	{

		$rules = [

			'sitio_id' => 'required|integer',
			'descripcion' => 'required|string',
			'cantidad' => 'required|integer',
			'estado_repso' => 'required|integer',
			'estado_id' => 'required|integer',
			'cedula' => 'required|integer',
			'dependencia_id' => 'required|integer',
			'modalidad' => 'required|integer',
			'ciudad_id' => 'required|integer',
			'observaciones' => 'required|string'
		];
		return $rules;
	}
	public function scopeDescripcion($query, $des)
	{
		if ($des)
			return $query->where('descripcion', 'like', "%$des%");
	}

	public function scopeProfesionalAsignado($query, $perfil_id, $user_id)
	{
		if ($perfil_id == 3) {
			return $query->where('productos.profesional_id', '=', "$user_id");
		}
	}

	public function scopeCedula($query, $des)
	{
		if ($des)
			return $query->where('clientes.cedula', '=', "$des");
	}	
	public function scopeDependencia($query, $des)
	{
		if ($des)
			return $query->where('dependencias.codigo', '=', "$des%");
	}	
	public function scopeEstado($query, $des)
	{
		if ($des)
			return $query->where('productos.estado_id', '=', "$des%");
	}	
	public function scopeModalidad($query, $des)
	{
		if ($des)
			return $query->where('dependencias.modalidad', '=', "$des%");
	}	
	public function scopeNombre($query, $des)
	{
		if ($des)
			return $query->where('clientes.nombre', 'like', "%$des%");
	}	
}
