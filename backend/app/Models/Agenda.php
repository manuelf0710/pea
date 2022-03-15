<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;

class Agenda extends Model
{
	use Notifiable;

    protected $table = 'agendas';
    public $timestamps = true;

    use SoftDeletes;
	
    protected $fillable = [
        'profesional_id',
        'start',
        'end',
        'tipo',
    ];	

    protected $dates = ['deleted_at'];
    protected $hidden = ['created_at','updated_at','deleted_at'];
    public static $directionOrder = ['ASC','ASC'];



	public static function rules(Request $request, $id = null)
	{
        $rules = [
            'profesional_id' => 'required',
            'start' => 'required',
            'end' => 'required',
            'tipo' => 'required',
        ];
		return $rules;
	}    

	public function scopeProfesional($query, $des){
		if($des)
			return $query->where('profesional_id', '=', $des);
	}    
}
