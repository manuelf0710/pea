<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModuloUser extends Model
{
	use Notifiable;

    protected $table = 'modulo_users';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'usuario_id', 'modulo_id', 'estado'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'usuario_id' => 'required',
        'modulo_id' => 'required',
        'estado' => 'required',
    ];
}
