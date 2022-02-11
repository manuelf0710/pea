<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Modulo; /* entitie model */
use App\LinkModulo; /* entitie model */

class ModuloController extends Controller
{
	public function getHijos($id_modulo){
		$response = [];
		$response = LinkModulo::withoutTrashed()->where('modulo',  $id_modulo)->where('estado', 1)->get();
		return $response;
	}
	public function getSubmenu($id_page){
		$response = [];
		$response = LinkModulo::withoutTrashed()->where('padre',  $id_page)->where('estado', 1)->get();
		return $response;
	}	
	public function administracionPos(){
		$response = $this->getSubmenu(12);
		return response()->json($response); 
	}
	
	public function prueba(){
		//return 'dentro de prueba';
        $modulos =  Modulo::withoutTrashed()->where('estado',  1)->get();
        $response = array("token" => "manuelftoken",
                         "data" => array("modulos" => $modulos));
		$i=0;
		foreach($modulos  as $modu){
			$modulos[$i]['hijos'] = $this->getHijos($modu->id);
			$i++;
		}
		return $response;
	}
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
		//$requerimientos = 'App\Detalle_req'::all();
		$requerimientos = DB::table('requerimientos')->paginate(1);
        return $requerimientos;
		//return 'hola desde el index resource';
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
