<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sitio extends Model
{
	use Notifiable;

    protected $table = 'sitios';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'nombre'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'nombre' => 'required',
        'regional_id' => 'required|integer',
    ];

	public function scopeNombre($query, $des){
		if($des)
			return $query->where('nombre', 'like', "%$des$%");
	}    
}
