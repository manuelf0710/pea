<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\pea;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\pea\ProductoRepso;
use App\Models\pea\Producto;
use App\Http\Controllers\Controller;
use Auth;

class ProductoRepsoController extends Controller
{

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('auth');
        $this->middleware(['auth', 'verified']);
    }
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

        $globalSearch = $request->get('globalsearch');

        if ($globalSearch != '') {
            $response = ProductoRepso::withoutTrashed()->orderBy('productos_repso.id', 'desc')
                ->globalSearch($globalSearch)
                ->paginate($pageSize);
        } else {
            $response = ProductoRepso::with('regional', 'contrato', 'tipoproducto')->withoutTrashed()->orderBy('productos_repso.id', 'desc')
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
        $validator = Validator::make($request->all(), ProductoRepso::rules($request));
        if (!($validator->fails())) {
            $modelo = new ProductoRepso();
            $modelo->tipoproducto_id = $request->post('tipoproducto_id');
            $modelo->regional_id    = $request->post('regional_id');
            $modelo->contrato_id    = $request->post('contrato_id');
            $modelo->anio  = $request->post('anio');
            $modelo->cantidad  = $request->post('cantidad');
            $modelo->descripcion  = $request->post('descripcion');
            $modelo->user_id = auth()->user()->id;
            $modelo->save();

            for ($i = 0; $i < $modelo->cantidad; $i++) {
                $producto = new Producto();
                $producto->producto_repso_id = $modelo->id;
                $producto->estado_id = 9;
                $producto->user_id = auth()->user()->id;
                $producto->save();
            }

            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $modelo,
                'msg'    => 'Guardado'
            );
        } else {
            $response = array(
                'status' => 'error',
                'msg' => $validator->errors(),
                'validator' => $validator
            );
        }
        return response()->json($response);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
       /*$response = ProductoRepso::with('regional', 'contrato', 'tipoProducto')->withoutTrashed()
                    ->where('id','=', $id)
                    ->orderBy('productos_repso.id', 'desc')->get();*/
        $response = ProductoRepso::with('regional', 'contrato', 'tipoProducto')->find( $id ) ;                  
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

    public function buscarProductoRepso(Request $request)
    {
        $productos = ProductoRepso::withoutTrashed()
            ->select('id', 'descripcion as nombre')
            ->where("descripcion", "like", "%" . $request->post('globalsearch') . "%")
            ->where("estado", "=", "1")
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
        $find = ProductoRepso::find($id);
        if (!empty($find)) {
            $find->delete();
            $response = [
                'status' => 'success',
                'code' => 200,
                'data' => $find,
                'msg'  => 'Registro eliminado'
            ];
        } else {
            $response = [
                'status' => 'error',
                'msg' => "Se ha presentado un error",
            ];
        }
        return response()->json($response);
    }
}
