<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
	use Notifiable;

    protected $table = 'clientes';
    protected $primaryKey = 'cedula';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'cedula',
        'nombre',
        'dependencia_id',
        'email',
        'telefono',
        'division',
        'subdivision',
        'cargo',
        'direccion',
        'ciudad_id',
        'barrio',
        'otrosi',
        'modalidad',
        'producto_repso_id'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'cedula' => 'required|integer',
        'nombre' => 'required|integer',
        'nombre' => 'required',
        'dependencia_id' => 'required|integer', 
        'email' => 'required|integer',
        'telefono' => 'required|integer',
        'division' => 'required|integer',
        'subdivision' => 'required|integer',
        'cargo' => 'required|integer',
        'direccion' => 'required',
        'ciudad_id' => 'required',
        'barrio'  => 'required' ,     
        'otrosi'  => 'required' ,    
        'modalidad'  => 'required'     
    ];

	public function scopeCedula($query, $des){
		if($des)
			return $query->where('cedula', '=', $des);
	}     

	public function scopeNombre($query, $des){
		if($des)
			return $query->where('nombre', 'like', "%$des$%");
	}    
}
