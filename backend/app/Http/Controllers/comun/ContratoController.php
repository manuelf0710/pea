<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\comun;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Contrato;
use App\Http\Controllers\Controller;

class ContratoController extends Controller
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
		
        $nombre = $request->get('descripcion');
        $globalSearch = $request->get('globalsearch');
		
		if($globalSearch != ''){
			$response = Contrato::withoutTrashed()->orderBy('contratos.id', 'desc')
			->globalSearch($globalSearch)
			->paginate($pageSize);		
		}else{
			$response = Contrato::withoutTrashed()->orderBy('contratos.id', 'desc')
			->nombre($nombre)
			->paginate($pageSize);
		}
						
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
	
	public function buscarContrato(Request $request){
		$productos = Contrato::withoutTrashed()
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
        $find = Contrato::find($id);
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
