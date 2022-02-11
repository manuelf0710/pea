<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Departamento extends Model
{
	use Notifiable;

    protected $table = 'departamentos';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'nombre'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'nombre' => 'required'
    ];

	public function scopeNombre($query, $des){
		if($des)
			return $query->where('nombre', 'like', "%$des$%");
	}    
}
