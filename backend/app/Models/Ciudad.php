<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ciudad extends Model
{
	use Notifiable;

    protected $table = 'ciudades';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'departamento_id',
        'nombre',
        'tarifa_ciudad',
        'tarifa_transporte',
        'unis_id',
        'regional_id',
        'localidad_id',
        'servicios_medicos',
        'comite_local',
        'comite_regional',
        'comite_nacional'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'regional_id' => 'required|integer',
        'departamento_id' => 'required|integer',
        'nombre' => 'required',
        'tarifa_ciudad' => 'required|integer', 
        'tarifa_transporte' => 'required|integer',
        'unis_id' => 'required|integer',
        'regional_id' => 'required|integer',
        'localidad_id' => 'required|integer',
        'servicios_medicos' => 'required|integer',
        'comite_local' => 'required',
        'comite_regional' => 'required',
        'comite_nacional'  => 'required'      
    ];

	public function scopeNombre($query, $des){
		if($des)
			return $query->where('nombre', 'like', "%$des$%");
	}    
}
