<?php

namespace App\Models\pea;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class TipoProducto extends Model
{
	use Notifiable;
    public $timestamps = true;
	protected $table = 'tipo_productos';
    use SoftDeletes;
	
    protected $fillable = [
        'name'
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
        	'name' => 'required'
    	];		
        return $rules;
    }	
	public function scopeName($query, $des){
		if($des)
			return $query->where('name', 'like', "%$des$%");
	}	

}
