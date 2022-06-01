<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Http\Request;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    public $timestamps = true;

    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public static function rules(Request $request, $id = null)
    {
		
     	$rules = [
        	'name' => 'required | min:6 | max: 191',
            'cedula' => 'required|numeric',
            'perfil_id' => 'required|numeric',
        	'email' => 'required | min:6 | max: 191',
    	];		
        switch( $request->method() )
        {
            case 'POST':
            {
 				return array_merge( $rules, ['password' => 'required|string|confirmed', 'password_confirmation' => 'required| min:6', 'email' => 'required|min:6|max:191|unique:users', ] );
            }
            case 'PUT':
            {
				return array_merge( $rules, ['email' => 'required|min:6|max:191|string|unique:users,email,'. $id, ] );
            }
            default:break;
        }
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
    /*
	* Relationships
	*/

    public function perfil()
    {
        return $this->belongsTo('App\Perfil', 'perfil_id', 'id');
    }

    public function profesional()
    {
        return $this->belongsTo('App\Perfil', 'perfil_id', 'id');
    }
    public function scopeProfile($query, $profile)
    {
        if ($profile != '')
            return $query->where('users.perfil_id', '=', "$profile");
    }

    public function scopeNombre($query, $cat)
    {
        if ($cat)
            return $query->where('users.name', 'like', "%$cat%");
    }
}
