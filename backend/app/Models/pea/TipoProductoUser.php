<?php

namespace App\Models\pea;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class TipoProductoUser extends Model
{
	use Notifiable;
	protected $table = 'tipoproducto_users';
    public $timestamps = true;
    use SoftDeletes;
	
    protected $fillable = [
        'tipoproducto_id', 'user_id '
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
        	'tipoproducto_id' => 'required|integer',
        	'user_id' => 'required|integer'
    	];		
        return $rules;
    }	
	public function scopeTipoProducto($query, $des){
		if($des)
			return $query->where('tipoproducto_id', '=', "%$des$%");
	}	
	public function scopeUser($query, $des){
		if($des)
			return $query->where('user_id', '=', "%$des$%");
	}	

}
