<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Modulo extends Model
{
	use Notifiable;

    protected $table = 'modulos';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'nombre', 'descripcion', 'estado', 'icon', 'img'
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];

    public static $rules = [
        'nombre' => 'required',
        'descripcion' => 'required|string|max:80',
        'estado' => 'required',
        'icon' => 'required',
        'img' => 'required',
    ];
  public function links()
  {
    return $this->hasMany(ModuloLink::class);
  }	
}
