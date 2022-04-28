<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModuloPerfil extends Model
{
	use Notifiable;

    protected $table = 'modulo_perfiles';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'modulo_id', 'perfil_id', 'estado'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'modulo_id' => 'required',
        'perfil_id' => 'required',
        'estado' => 'required',
    ];
}
