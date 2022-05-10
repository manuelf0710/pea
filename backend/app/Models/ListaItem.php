<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class ListaItem extends Authenticatable
{
    use Notifiable;
    protected $table = 'lista_items';
    protected $primaryKey = 'id';
    public $timestamps = true;
    use SoftDeletes; /*borrado suave de laravel*/

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nombre',
        'background',
        'color'
    ];

    public static function rules(Request $request, $id = null)
    {

        $rules = [
            'nombre' => 'required|string',
        ];
        return $rules;
    }

    public function scopeByProfile($query, $userData)
    {
        if ($userData->perfil_id == 3)
            return $query->whereNotIn('lista_items.id', [4, 5, 12]);
    }
}
