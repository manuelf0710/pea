<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\pea;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\pea\TipoProductoUser;
use App\Http\Controllers\Controller;

class TipoProductoUserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
	 
    public function listado(Request $request)
    { 
        $pageSize = $request->get('pageSize');
		$pageSize == '' ? $pageSize = 20 : $pageSize;
		
        $tipo_producto = $request->get('tipo_producto');
        $user = $request->get('user');
        $globalSearch = $request->get('globalsearch');

        $response = TipoProductoUser::
        join('users','tipoproducto_users.user_id', '=', 'users.id')
        ->join('tipo_productos','tipoproducto_users.tipoproducto_id', '=', 'tipo_productos.id')
        ->select('tipoproducto_users.tipoproducto_id', 'tipoproducto_users.user_id', 'tipo_productos.name as tipoproducto_des', 'users.name')                              
        ->orderBy('tipoproducto_users.id', 'desc')
        ->paginate($pageSize);	
						
		return response()->json($response); 
	}		
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

    public function tipoProductoByUser($id){
		$productos  = TipoProductoUser::
        join('users','tipoproducto_users.user_id', '=', 'users.id')
        ->join('tipo_productos','tipoproducto_users.tipoproducto_id', '=', 'tipo_productos.id')
        ->select('tipoproducto_users.tipoproducto_id', 'tipoproducto_users.user_id', 'tipo_productos.name as tipoproducto_des', 'users.name') 
        ->where('tipoproducto_users.tipoproducto_id', '=', $id)                             
        ->orderBy('tipoproducto_users.id', 'desc')
							->get();
		return response()->json($productos);         
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

    }
	
	public function buscarTipoProductoUser(Request $request){
		$productos = TipoProductoUser::withoutTrashed()
							->select('id','descripcion as nombre')
							->where("descripcion","like","%".$request->post('globalsearch')."%")
							->where("estado","=","1")
							->get();
		return response()->json($productos); 
	}

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $find = TipoProductoUser::find($id);
		if (! empty($find)) {
            $find->delete();
            $response = [
                'status' => 'success',
                'code' => 200,
                'data' => $find,
				'msg'  => 'Registro eliminado'
            ];			
		}else{
		    $response = [
                'status' => 'error',
                'msg' => "Se ha presentado un error",
            ];
		}
		return response()->json($response);	
    }    

}
