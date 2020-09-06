<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\pea;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\pea\Producto;
use App\Http\Controllers\Controller;

class ProductoController extends Controller
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
		
        $codigo = $request->get('codigo');
        $descripcion = $request->get('descripcion');
        $categoria = $request->get('categoria');
        $globalSearch = $request->get('globalsearch');
		
		if($globalSearch != ''){
			$response = Producto::withoutTrashed()->orderBy('productos.id', 'desc')
			->globalSearch($globalSearch)
			->paginate($pageSize);		
		}else{
			$response = Producto::withoutTrashed()->orderBy('productos.id', 'desc')
			->codigo($codigo)
			->descripcion($descripcion)
			->categoria($categoria)
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
	
	public function buscarProducto(Request $request){
		$productos = Producto::withoutTrashed()
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
        $find = Producto::find($id);
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
