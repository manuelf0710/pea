<?php

namespace App\Models\pea;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoRepso extends Model
{
	use Notifiable;
	protected $table = 'productos_repso';
	public $timestamps = true;
	use SoftDeletes;

	protected $fillable = [
		'tipoproducto_id', 'regional_id','grupal', 'contrato_id', 'anio', 'descripcion', 'cantidad'
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
			'tipoproducto_id' => 'required|integer',
			'regional_id' => 'required|integer',
			'grupal' => 'required|integer',
			'contrato_id' => 'required|integer',
			'anio' => 'required|integer',
			'cantidad' => 'required|integer',
			'profesional_id' => 'required|integer',
		];
		return $rules;
	}

	public function tipoProducto()
	{
		return $this->hasOne('App\Models\pea\TipoProducto',  'id', 'tipoproducto_id');
	}
	public function regional()
	{
		return $this->hasOne('App\Models\Regional',  'id', 'regional_id');
	}

	public function contrato()
	{
		return $this->hasOne('App\Models\Contrato',  'id', 'contrato_id');
	}

	public function profesional()
	{
		return $this->hasOne('App\User',  'id', 'profesional_id');
	}

	public function scopeDescripcion($query, $des)
	{
		if ($des)
			return $query->where('descripcion', 'like', "%$des%");
	}

	public function scopeProgramadorProfesional($query, $perfil_id, $user_id)
	{
		if ($perfil_id == 2) {
			return $query->where('profesional_id', '=', "$user_id");
		}
		if ($perfil_id == 3) {
			return $query->whereRaw(DB::raw(
				"(select productos.id 
					from productos
				 where productos_repso.id = productos.producto_repso_id
				 and productos.profesional_id ='" . $user_id . "' limit 1) > 0"
			));
		}
	}

	public function scopeRegional($query, $des)
	{
		if ($des)
			return $query->where('regional_id', '=', "$des");
	}
	public function scopeContrato($query, $des)
	{
		if ($des)
			return $query->where('contrato_id', '=', "$des");
	}

	public function scopeTipoProducto($query, $des)
	{
		if ($des)
			return $query->where('tipoproducto_id', '=', "$des");
	}
}