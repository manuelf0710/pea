<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\pea;

use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\pea\Producto;
use App\Models\pea\ProductoReprogramaciones;
use App\Models\pea\ProductoRepso;
use App\Models\Cliente;
use App\Imports\ClientesImport;
use Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;


class ComentarioController extends Controller
{

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'producto_id' => 'required',
            'estado_id' => 'required',
            'estado_seguimiento' => 'required',
            'comentario' => 'required',
        ], ProductoReprogramaciones::$customMessages);        
        if (!($validator->fails())) {
            $updateProducto = Producto::find($request->post('producto_id'));
            $productoReprogramacion = new ProductoReprogramaciones();
            $productoReprogramacion->producto_id = $request->post('producto_id');
            $productoReprogramacion->user_id        = auth()->user()->id;
            $productoReprogramacion->profesional_id = $request->post('profesional_id');
            $productoReprogramacion->comentario     = $request->post('comentario');
            $productoReprogramacion->inicio         = $updateProducto->fecha_inicio;
            $productoReprogramacion->end            = $updateProducto->fecha_fin;
            $productoReprogramacion->estado_id      = $request->post('estado_id');
            $productoReprogramacion->estadoseguimiento_id      = $request->post('estado_seguimiento');
            $productoReprogramacion->tipo           = 2;
            $updateProducto->estadoseguimiento_id = $request->post('estado_seguimiento');

            $productoReprogramacion->save();
            $updateProducto->save();
            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $this->comentariosByProductoId($productoReprogramacion->producto_id, $productoReprogramacion->id), //$request->post(),
                'msg'    => 'Guardado',
            );
        } else {
                $response = array(
                    'status' => 'error',
                    'msg' => $validator->errors(),
                    'data' => $request->post("producto"),
                    'validator' => $validator
                );
            }

    return response()->json($response);        
    }

    public function comentariosByProductoId($id, $commentId = null){
        $comentarios = ProductoReprogramaciones::join('lista_items', 'producto_reprogramaciones.estado_id', '=', 'lista_items.id')
        ->leftJoin('users', 'producto_reprogramaciones.user_id', '=', 'users.id')
        ->leftJoin('estadoseguimientos', 'producto_reprogramaciones.estadoseguimiento_id', '=', 'estadoseguimientos.id')
        ->select('producto_reprogramaciones.id',
        'producto_reprogramaciones.producto_id',
        'producto_reprogramaciones.comentario',
        'producto_reprogramaciones.created_at as creado',
        DB::raw("CASE WHEN producto_reprogramaciones.tipo = 1 THEN 'Reprogramaciones' WHEN producto_reprogramaciones.tipo = 2 THEN 'Seguimiento' ELSE '' END AS tipo"),
        'producto_reprogramaciones.estadoseguimiento_id',
        'producto_reprogramaciones.estado_id',
        'lista_items.nombre as estado',
        'estadoseguimientos.nombre as estado_seguimiento',
        'users.name as usuario_comentario');

        if($commentId){
            $comentarios->where('producto_reprogramaciones.id', '=', $commentId) ;
        } 


        $comentarios = $comentarios->where('producto_reprogramaciones.producto_id', '=', $id)->orderBy('producto_reprogramaciones.id', 'desc')->get();
        if($commentId) {
            return $comentarios;
        }
        return response()->json($comentarios);
    }




    public function productoUpdateGestion(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'estado_id' => 'required',
            'comentario_cancelacion' => 'required_if:estado_programacion, 10,11',
        ], Producto::$customMessages);
        if (!($validator->fails())) {
            $updateProducto = Producto::find($id);

            if ($request->post('estado_programacion') == 10 || $request->post('estado_programacion') == 11) {
                $productoReprogramacion = new ProductoReprogramaciones();
                $productoReprogramacion->producto_id = $id;
                $productoReprogramacion->user_id        = auth()->user()->id;
                $productoReprogramacion->profesional_id = $updateProducto->profesional_id;
                //$productoReprogramacion->profesional_id = $updateProducto->profesional_id;
                $productoReprogramacion->comentario     = $request->post('comentario_cancelacion');
                $productoReprogramacion->inicio         = $updateProducto->fecha_inicio;
                $productoReprogramacion->end            = $updateProducto->fecha_fin;
                $productoReprogramacion->estado_id      = $request->post('estado_programacion');
                $productoReprogramacion->save();

                if ($request->post('estado_programacion') == 11) {
                    $updateProducto->numero_citas =  $updateProducto->numero_citas + 1;
                    $this->resetearProductoTiemposCita($id);
                }

                $updateProducto->comentarios      = $request->post('comentarios');
                $updateProducto->estadoseguimiento_id      = $request->post('estado_seguimiento');   
                $updateProducto->estado_id = $request->post('estado_programacion');             

                $updateProducto->save();
            }else{

                $updateProducto->comentarios      = $request->post('comentarios');
                $updateProducto->estadoseguimiento_id      = $request->post('estado_seguimiento');                 
                
                $updateProducto->estado_id = $request->post('estado_programacion');
                $updateProducto->save();
            }

            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => array('producto' => $this->getProductoData($updateProducto->id),  'productoinfo' => $updateProducto, 'data' => $request->post()), 
                'msg'    => 'Actualizado',
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

}