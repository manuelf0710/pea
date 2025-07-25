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
use App\Exports\ProductosExport;
use Auth;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() {}

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

        if ($globalSearch != '') {
            $response = Producto::withoutTrashed()->orderBy('productos.id', 'desc')
                ->globalSearch($globalSearch)
                ->paginate($pageSize);
        } else {
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
        $product = $this->insertProduct($request, $request->post('producto_repso_id'), $request->post('user_id'), true);
        if ($product) {
            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => array('producto' => $product),
                'msg'    => ' producto agregado correctamente '
            );
            return response()->json($response);
        } else {
            $response = array(
                'status' => 'error',
                'msg' => "Ha ocurrido un error al guardar el registro",
                'validator' => "Archivo no guardado"
            );
            return response()->json($response);
        }
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


    function getProductoData($id)
    {
        $response = Producto::join('clientes', 'productos.cedula', '=', 'clientes.cedula')
            //->join('dependencias', 'clientes.dependencia_id', '=', 'dependencias.codigo')
            //->join('ciudades', 'clientes.ciudad_id', '=', 'ciudades.id')
            ->join('lista_items', 'productos.estado_id', '=', 'lista_items.id')
            ->leftJoin('estadoseguimientos', 'productos.estadoseguimiento_id', '=', 'estadoseguimientos.id')
            ->leftJoin('users', 'productos.profesional_id', '=', 'users.id')
            ->select(
                'productos.id',
                'productos.producto_repso_id',
                'productos.productoReasignado',
                'productos.fechaReasignado',
                'productos.modalidad',
                'productos.descripcion',
                'productos.comentarios',
                'productos.pyp_ergonomia',
                'clientes.cedula',
                'clientes.nombre',
                'productos.estado_id',
                'productos.numero_citas',
                'lista_items.nombre as estado',
                'productos.estadoseguimiento_id',
                'estadoseguimientos.nombre as estado_seguimiento',
                'clientes.dependencia_id as dependencia',
                'clientes.email',
                'clientes.telefono',
                'clientes.division',
                'clientes.subdivision',
                'clientes.cargo',
                'clientes.direccion',
                'clientes.ciudad_id as ciudad',
                'clientes.barrio',
                'productos.profesional_id',
                'users.name as profesional_des'
            )
            //->selectRaw("( select count(id) total_productos from productos where producto_repso_id ='" . $id . "') as total_productos")
            //->selectRaw("date_format(productos.fecha_programacion, '%d/%m/%Y') as fecha_programacion")
            ->selectRaw("DATE_FORMAT(productos.fechaReasignado, '%d/%m/%Y') as fechaReasignado")
            ->selectRaw("concat(date_format(productos.fecha_inicio, '%d/%m/%Y'), ' ', date_format(productos.fecha_inicio, '%H:%i:%s  %p'), ' - ', date_format(productos.fecha_fin, '%H:%i:%s  %p')) as fecha_programacion")
            ->selectRaw("case clientes.otrosi when 1 then 'Si' else 'No' End otrosi")
            ->where('productos.id', '=', $id)
            ->first();
        return $response;
    }

    public function resetearProductoTiemposCita($producto_id)
    {
        DB::table('citas')
            ->where('producto_id',  $producto_id)
            ->update(['producto_id' => null, 'ocupado' => 1]);
    }


    public function productoCancelState(Request $request, $id)
    {
        $updateProducto = Producto::find($id);
        DB::table('productos')
            ->where('id',  $id)
            ->update([
                'estado_id' => 10,
                'modalidad' => $request->post('modalidad')
            ]);


        $productoReprogramacion = new ProductoReprogramaciones();
        $productoReprogramacion->producto_id = $id;
        $productoReprogramacion->user_id        = auth()->user()->id;
        //$productoReprogramacion->profesional_id = $updateProducto->profesional_id;
        $productoReprogramacion->comentario     = $request->post('comentario_cancelacion');
        /*$productoReprogramacion->inicio         = $updateProducto->fecha_inicio;
            $productoReprogramacion->end            = $updateProducto->fecha_fin;*/
        $productoReprogramacion->estado_id      = $request->post('estado_programacion');
        $productoReprogramacion->save();

        $response = array(
            'status' => 'ok',
            'code' => 200,
            'data'   => array('producto' => $this->getProductoData($id)),
            'msg'    => ' Cancelado '
        );
        return response()->json($response);
    }

    public function productoReasignarPersona(Request $request, $id)
    {
        $persona = $request->post('persona');
        $origenOds = $request->post('origen');
        $destinoOds = $request->post('destino');

        $response = [
            'status' => 'error',
            'msg' => "Se ha presentado un error al reasignar la persona",
            'data' => [],
        ];

        if (
            isset($persona['id']) && !empty($persona['id']) &&
            isset($origenOds['id']) && !empty($origenOds['id']) &&
            isset($destinoOds['id']) && !empty($destinoOds['id'])
        ) {
            $updateProducto = Producto::find($persona['id']);
            if ($updateProducto) {

                $updateProducto->productoReasignado = $updateProducto->producto_repso_id;
                $updateProducto->producto_repso_id = $destinoOds['id'];
                $updateProducto->fechaReasignado =  DB::raw('NOW()');
                $updateProducto->save();

                $response = array(
                    'status' => 'ok',
                    'code' => 200,
                    'data'   => array('producto' => $this->getProductoData($updateProducto->id),  'productoinfo' => $updateProducto, 'data' => $request->post()),
                    'msg'    => 'Actualizado',
                );
            }
        }

        return response()->json($response);
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
            } else {

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

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $rules = Producto::rules($request, $request->documento);
        $validator = Validator::make($request->all(), $rules, Producto::$customMessages);

        $update_producto = Producto::find($id);
        if (!($validator->fails())) {
            $update_producto->sitio_id          = $request->sitio_id;
            $update_producto->descripcion       = $request->descripcion;
            $update_producto->sitio_id          = $request->sitio_id;
            $update_producto->cantidad          = $request->cantidad;
            $update_producto->estado_repso      = $request->estado_repso;
            $update_producto->estado_id         = $request->estado_id;
            $update_producto->cedula            = $request->cedula;
            $update_producto->dependencia_id    = $request->dependencia_id;
            $update_producto->modalidad         = $request->modalidad;
            $update_producto->ciudad_id         = $request->ciudad_id;
            $update_producto->observaciones     = $request->observaciones;
            $update_producto->save();
            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $update_producto,
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

    public function buscarProducto(Request $request)
    {
        $productos = Producto::withoutTrashed()
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
        $find = Producto::find($id);
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

    /**
     * get the data relation with productrepsoid parent.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function productsByProductRepso($id, Request $request)
    {
        $pageSize = $request->get('pageSize');
        $pageSize == '' ? $pageSize = 20 : $pageSize;

        $cedula = $request->post('cedula');
        $dependencia = $request->post('dependencia');
        $estado = $request->post('estado');
        $estadoSeguimiento = $request->post('estado_seguimiento');
        $modalidad = $request->post('modalidad');
        $nombre = $request->post('nombre');
        $product_id = $request->post('product_id');
        $globalSearch = $request->get('globalsearch');

        if ($globalSearch != '') {
            $response = Producto::join('clientes', 'productos.cedula', '=', 'clientes.cedula')
                ->select('productos.id', 'clientes.cedula', 'clientes.nombre',)
                ->withoutTrashed()->orderBy('productos.id', 'desc')
                ->globalSearch($globalSearch)
                ->paginate($pageSize);
        } else {
            $response = Producto::join('clientes', 'productos.cedula', '=', 'clientes.cedula')
                //->leftJoin('dependencias', 'clientes.dependencia_id', '=', 'dependencias.codigo')
                //->join('ciudades', 'clientes.ciudad_id', '=', 'ciudades.id')
                ->join('lista_items', 'productos.estado_id', '=', 'lista_items.id')
                ->leftJoin('estadoseguimientos', 'productos.estadoseguimiento_id', '=', 'estadoseguimientos.id')
                ->leftJoin('users', 'productos.profesional_id', '=', 'users.id')
                ->select(
                    'productos.id',
                    'productos.modalidad',
                    'productos.descripcion',
                    'productos.comentarios',
                    'productos.pyp_ergonomia',
                    'clientes.cedula',
                    'clientes.nombre',
                    'productos.estado_id',
                    'productos.numero_citas',
                    'lista_items.nombre as estado',
                    'productos.estadoseguimiento_id',
                    'estadoseguimientos.nombre as estado_seguimiento',
                    'clientes.dependencia_id as dependencia',
                    'clientes.email',
                    'clientes.telefono',
                    'clientes.division',
                    'clientes.subdivision',
                    'clientes.cargo',
                    'clientes.direccion',
                    'clientes.ciudad_id as ciudad',
                    'clientes.barrio',
                    'productos.profesional_id',
                    'users.name as profesional_des'
                )
                //->selectRaw("( select count(id) total_productos from productos where producto_repso_id ='" . $id . "') as total_productos")
                ->selectRaw("concat(date_format(productos.fecha_inicio, '%d/%m/%Y'), ' ', date_format(productos.fecha_inicio, '%H:%i:%s  %p'), ' - ', date_format(productos.fecha_fin, '%H:%i:%s  %p')) as fecha_programacion")
                ->selectRaw("case clientes.otrosi when 1 then 'Si' else 'No' End otrosi")
                ->withoutTrashed()->orderBy('productos.id', 'desc')
                ->where('producto_repso_id', '=', $id)
                ->productId($product_id)
                ->profesionalAsignado(auth()->user()->perfil_id, auth()->user()->id)
                ->cedula($cedula)
                ->dependencia($dependencia)
                ->estado($estado)
                ->estadoSeguimiento($estadoSeguimiento)
                ->modalidad($modalidad)
                ->nombre($nombre)
                ->paginate($pageSize);
        }

        return response()->json($response);
    }

    public function validarErrores() {}

    public function insertProduct($item, $id, $user_id, $callbackValue = false)
    {
        $producto = new Producto();
        $producto->producto_repso_id = $id;
        $producto->estado_id = 12;
        $producto->cedula = $item['cedula'];
        $producto->dependencia_id = $item['dependencia_id'];
        $producto->user_id = $user_id;
        $producto->modalidad = $item['modalidad'];
        $producto->save();
        if ($callbackValue) {
            return $producto;
        }
    }

    /*
    * Exportar Excel de productos
     */

    public function exportExcelProducto(Request $request)
    {
        $params = $request->all();
        return Excel::download(new ProductosExport($params), 'productos.xlsx', \Maatwebsite\Excel\Excel::XLSX, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="productos.xlsx"'
        ]);
    }



    /*
    * importa el excel de clientes
     */
    public function ImportClientesByProductoRepso($id, Request $request)
    {
        //return response()->json(array("forzarCargue"=> $request->get('forzarCargue')));
        //$requestData = $request->get('descripcion');
        $requestData = $request->all();

        /*$productoRepso = DB::table('productos_repso')
            ->where("id", "=", $id)
            ->select('productos_repso.*')
            ->addSelect(DB::raw("( select count(id) total_productos from productos where producto_repso_id ='" . $id . "') as total_productos"))
            ->first();*/

        $clientesOtrasSolicitud = array();
        $user_id = auth()->user()->id;

        $find = ProductoRepso::select('id', 'tipoproducto_id', 'regional_id', 'contrato_id', 'anio', 'descripcion', 'cantidad', 'user_id', 'archivo')
            ->selectRaw("( select count(id) total_productos from productos where producto_repso_id ='" . $id . "') as total_productos")
            ->find($id);
        $validacion = 0;

        if (!empty($find)) {
            if (file_exists(public_path() . '/' . $request->get('nombrearchivo'))) {

                $importClientes = new ClientesImport;

                Excel::import($importClientes, public_path() . '/' . $request->get('nombrearchivo'));
                /*          
                $totalImport = count($importClientes->clientesImportar);
                if ($totalImport > $find->cantidad) {
                    $response = array(
                        'status' => 'error',
                        'msg' => "El archivo de Funcionarios tiene mas registros que la cantidad de la solicitud",
                        'validator' => "Las cantidades no corresponden"
                    );
                    $validacion = 1;
                }*/
                /*
                if (($totalImport + $find->total_productos) > $find->cantidad) {
                    $response = array(
                        'status' => 'error',
                        'msg' => "El archivo de Funcionarios + los  registros que ya existen es mayor a la cantidad de la solicitud",
                        'validator' => "Las cantidades no corresponden, registros existentes"
                    );
                    $validacion = 1;
                }*/

                $find->archivo = $request->get('nombrearchivo');
                $find->save();
                if ($validacion == 0) {
                    foreach ($importClientes->clientesImportar as $item) {
                        /*
                        * Consultar si existe ya la persona registrada en esta solicitud
                         */
                        $getClient = DB::table('productos')
                            ->where('producto_repso_id', '=', $id)
                            ->where('cedula', '=', $item['cedula'])
                            ->first();
                        /*
                        * Consultar si la persona existe en otra solicitud de mismo tipoproducto
                         */
                        $getClientHistories = DB::table('productos')
                            ->join('productos_repso', 'productos_repso.id', 'productos.producto_repso_id')
                            ->join('clientes', 'productos.cedula', '=', 'clientes.cedula')
                            ->select(
                                'productos_repso.id as solicitud',
                                'productos.cedula as cedula',
                                'productos.created_at as creado',
                                'clientes.nombre'
                            )
                            ->where('productos.cedula', '=', $item['cedula'])
                            ->where('productos_repso.tipoproducto_id', '=', $find->tipoproducto_id)
                            ->whereNotIn('productos_repso.id', [$find->id])
                            ->whereNull('productos.deleted_at')
                            ->get();


                        if (!$getClient && count($getClientHistories) == 0) {
                            if ($item['cedula'] > 100000) {
                                $this->insertProduct($item, $id, $user_id);
                            }
                        } elseif (count($getClientHistories) > 0 && !$getClient) {
                            $getClientHistories[0]->modalidad = $item['modalidad'];
                            $getClientHistories[0]->dependencia_id = $item['dependencia_id'];
                            $getClientHistories[0]->producto_repso_id = $id;
                            $getClientHistories[0]->user_id = $user_id;
                            array_push($clientesOtrasSolicitud, $getClientHistories);
                            if ($request->get('forzarCargue') == 'Si') {
                                $this->insertProduct($item, $id, $user_id);
                            }
                        }
                    }
                } else {
                    //return response()->json($importClientes->clientesImportar);
                    //return response()->json($response);
                }

                $response = array(
                    'status' => 'success',
                    'code' => 200,
                    'data' => array("find" => $find, "clientesOtrasSolicitudes" => $clientesOtrasSolicitud),
                    'msg'  => 'Registro Procesado correctamente'
                );

                return response()->json($response);
            } else {
                $response = array(
                    'status' => 'error',
                    'msg' => "No se ha encontrado el archivo",
                    'validator' => "Archivo no encontrado"
                );
            }
        } else {
            $response = array(
                'status' => 'error',
                'msg' => "no existe el id de solicitud " . $id,
                'validator' => "Id no encontrado"
            );
        }

        return response()->json($response);
    }
}
