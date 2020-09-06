<?php
namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Perfil extends Model
{
	protected $table = "perfiles";
	use Notifiable;
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'nombre'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'nombre' => 'required|string|max:50'
    ];
}
