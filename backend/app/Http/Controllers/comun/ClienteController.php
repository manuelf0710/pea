<?php

namespace App\Http\Controllers\comun;

use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Cliente;
use App\Http\Controllers\Controller;
use App\Imports\ClientesImport;

class ClienteController extends Controller
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
			$response = Cliente::withoutTrashed()
			->globalSearch($globalSearch)
			->paginate($pageSize);		
		}else{
			$response = Cliente::withoutTrashed()
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
        $response = Cliente::find( $id ) ;                  
        return response()->json($response);
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

    /*
    * importa el excel de clientes
     */
    public function importExcel($id){
        $importClientes = new ClientesImport;

        Excel::import($importClientes, public_path().'/uploads/clientes/'.'test.csv'); 
        return response()->json($importClientes->clientesImportar);
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
	
	public function buscarSitio(Request $request){
		$productos = Cliente::withoutTrashed()
							->select('cedula','nombre')
							->where("nombre","like","%".$request->post('globalsearch')."%")
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
        $find = Cliente::find($id);
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
