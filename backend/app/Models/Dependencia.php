<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dependencia extends Model
{
	use Notifiable;

    protected $table = 'dependencias';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'continuo',
        'padre', 
        'ordinal',
        'nombre',
        'siglas',
        'codigo',
        'tipo', 
        'unidorg',
        'ceco', 
        'vicepr',
        'ger',
        'area',
        'depejede',
        'depevisi',
        'area2',
        'area3',
        'area4',
        'area5',
        'orden'  
    ];

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'continuo' => 'required|integer',
        'padre' => 'required|integer',
        'ordinal' => 'required',
        'nombre' => 'required',
        'siglas' => 'required', 
        'codigo' => 'required',
        'tipo' => 'required|integer',
        'unidorg' => 'required',
        'ceco' => 'required|integer',
        'vicepr' => 'required',
        'ger' => 'required',
        'area' => 'required',
        'depejede' => 'required',
        'depevisi' => 'required',
        'area2'  => 'required',     
        'area3'  => 'required',    
        'area4'  => 'required',     
        'area5'  => 'required',     
        'orden'  => 'required'    
    ];

	public function scopeNombre($query, $des){
		if($des)
			return $query->where('nombre', 'like', "%$des$%");
	}    
}
