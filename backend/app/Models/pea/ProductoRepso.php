<?php

namespace App\Models\pea;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class ProductoRepso extends Model
{
	use Notifiable;
	protected $table = 'productos_repso';
	public $timestamps = true;
	use SoftDeletes;

	protected $fillable = [
		'tipoproducto_id', 'regional_id', 'contrato_id', 'anio', 'descripcion', 'cantidad'
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
			'contrato_id' => 'required|integer',
			'anio' => 'required|integer',
			'cantidad' => 'required|integer'
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

	public function scopeDescripcion($query, $des)
	{
		if ($des)
			return $query->where('descripcion', 'like', "%$des$%");
	}
}
