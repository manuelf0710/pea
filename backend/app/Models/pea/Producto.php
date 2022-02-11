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
        'descripcion', 'unidad', 'precio_unitario','estado'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];
	
	public static $customMessages = [
    	'required' => 'Cuidado!! el campo :attribute no puede ser vacío',
    	'unique' => 'Error! el valor de :attribute ya se encuentra registrado',
    	'max' => 'Error! el valor de :attribute supero el tope permitido',
		'integer' => 'Error! el valor de :attribute debe ser un número sin comas ni puntos'
	];	
	
	public static function rules(Request $request, $id = null)
    {
		
     	$rules = [
        	'descripcion' => 'required|string',
        	'unidad' => 'required',
			'precio_unitario' =>'required'
    	];		
        return $rules;
    }	
	public function scopeDescripcion($query, $des){
		if($des)
			return $query->where('descripcion', 'like', "%$des$%");
	}	

}
