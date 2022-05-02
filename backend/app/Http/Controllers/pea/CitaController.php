<?php

//namespace App\Http\Controllers;
namespace App\Http\Controllers\pea;

use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\pea\Producto;
use App\Models\pea\ProductoRepso;
use App\Models\Agenda;
use App\Models\Cita;
use App\User;
use App\Imports\ClientesImport;
use Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Carbon\CarbonImmutable;

class CitaController extends Controller
{

    public $minutesToAdd = 15;
    public $tiempos = array();
    public $rango = 15;
    public $launchTimeStart = 12; /* hora */
    public $launchTimeEnd = 14;
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

    function obtenerHoraFecha($fecha)
    {
        $timePart = explode(" ", $fecha);
        return $timePart[1];
    }

    /*
* function getDiffMinutes obtener la diferencia en minutos entre fecha inicio fecha fin y el valor retornado debe ser igual al tiemnpo del servicio
 */

    function getDiffMinutes($start, $end)
    {
        $start = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $start);
        $end = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $end);
        $minutesDiff = $start->diffInMinutes($end);
        return $minutesDiff;
    }

    function validarFechaInicioPermitida($dateStart, $minDateStart)
    {
        $response = array();
        if ($dateStart->lt($minDateStart)) {
            $response = array(
                'status' => 'errortime',
                'code' => 200,
                'data'   => -1,
                'msg'    => 'Fecha hora inicio ' . $dateStart . ' no debe ser menor a ' . $minDateStart
            );
        }
        return $response;
    }

    function validarFechaFinPermitida($dateEnd, $maxDateStart)
    {
        $response = array();
        if ($dateEnd->gt($maxDateStart)) {
            $response = array(
                'status' => 'errortime',
                'code' => 200,
                'data'   => -1,
                'msg'    => 'Fecha hora fin ' . $dateEnd . ' no debe ser mayor a ' . $maxDateStart
            );
        }
        return $response;
    }



    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Cita::rules($request));
        if (!($validator->fails())) {

            $start = $request->post('start');
            $end = $request->post('end');
            $profesional_id = $request->post('profesional_id');
            $agenda_id = $request->post('agenda_id');
            $producto_id = $request->post('producto_id');
            $ocupado = $request->post('ocupado');
            $info = $request->post('info');
            $dataCita = $request->post('cita');



            $timestart = $this->obtenerHoraFecha($request->post('start'));
            $timeend = $this->obtenerHoraFecha($request->post('end'));

            $dateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('start'));
            $dateEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('end'));
            $newDateEnd = $dateEnd->subMinute($this->minutesToAdd, 'minute');

            /*
            * mínimo horario para inicio de cita
             */
            $minDateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $dataCita['start']);
            $maxDateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $dataCita['end']);
            /*
            * Validar que la fecha hora inicio no sea mayor que la fecha inicio hora permitida
            */
            $validarMin = $this->validarFechaInicioPermitida($dateStart, $minDateStart);
            if (count($validarMin) > 0) {
                return response()->json($validarMin);
            }

            /*echo('la cita start pérmitida = '.$dataCita['start']);
            echo('la cita start ingresada ='.$dateStart);*/



            /*
            * Validar que la fecha hora fin no sea mayor que la fecha fin hora permitida
             */
            $validarMax = $this->validarFechaFinPermitida($dateEnd, $maxDateStart);
            if (count($validarMax) > 0) {
                return response()->json($validarMax);
            }

            /*echo('la cita end pérmitida = '.$dataCita['end']);
            echo('la cita end ingresada ='.$dateStart);            
            return; */

            /*
            * Validar que la fecha fin no sea mayo
             */

            $productoInfo = DB::table('productos')
                ->join('productos_repso', 'productos.producto_repso_id', '=', 'productos_repso.id')
                ->join('tipo_productos', 'productos_repso.tipoproducto_id', '=', 'tipo_productos.id')
                ->select('productos.id as producto_id', 'tipo_productos.id as tipoproducto_id', 'tipo_productos.name', 'tipo_productos.tiempo')
                ->addSelect(DB::raw(' sysdate() as ahora
                '))
                ->where('productos.id', '=', $producto_id)
                ->first();

            $datesAgenda = DB::table('citas')
                ->where('citas.agenda_id', '=', $agenda_id)
                /*->whereDate('start','>=', $start)
            ->whereDate('end','<', $end) */
                ->whereBetween('start', [$start, $newDateEnd])
                //->toSql();
                ->get();

            /*
        * Validar que la fecha inicio no sea mayor que la fecha fin
        */
            if ($dateStart->gt($dateEnd)) {
                $response = array(
                    'status' => 'errortime',
                    'code' => 200,
                    'data'   => -1,
                    'msg'    => 'Fecha inicio ' . $dateStart . ' no debe ser mayor a ' . $dateEnd
                );
                return response()->json($response);
            }

            /*
        * Validar que la diferencia en minutos sea igual al tiempo del servicio
         */

            $diffMinutes = $this->getDiffMinutes($request->post('start'), $request->post('end'));

            if ($diffMinutes != $productoInfo->tiempo) {
                $response = array(
                    'status' => 'errortime',
                    'code' => 200,
                    'data'   => -1,
                    'msg'    => 'el tiempo de la cita es diferente de ' . $productoInfo->tiempo . ' minutos'
                );
                return response()->json($response);
            }

            /*
            * Validar que no haya ningun sector ocupado en la tabla citas para guardar la cita.
             */
            $validarOcupado = $this->validarOcupado($datesAgenda, $productoInfo->tiempo);
            if (count($validarOcupado) > 0) {
                if (array_key_exists('status', $validarOcupado)) {
                    if ($validarOcupado['size'] > 0) {
                        return  response()->json($validarOcupado);
                    }
                }
            }


            foreach ($datesAgenda as $item) {
                DB::table('citas')
                    ->where('id',  $item->id)
                    ->update(['producto_id' => $producto_id, 'ocupado' => 2]);
            }


            if ($request->post('block_cita') == '1') {
                $dateBloqueo = DB::table('citas')
                    ->where('citas.agenda_id', '=', $agenda_id)
                    ->whereBetween('start', [$dateEnd->format('Y-m-d H:i:s'), $dateEnd->format('Y-m-d H:i:s')])
                    ->get();
                $iterator = 0;

                foreach ($dateBloqueo as $item) {
                    if ($iterator == 0) {
                        DB::table('citas')
                            ->where('id',  $item->id)
                            ->whereNull('citas.producto_id')
                            ->update(['ocupado' => 2, 'razon_bloqueo' => 'tiempo espera']);
                    }
                    $iterator++;
                }
            }


            /*
            * Actualizar en la tabla de productos la información
             */

            $productoToUpdate = Producto::find($producto_id);


            if (!empty($productoToUpdate)) {
                $productoToUpdate->descripcion = $info['descripcion'];
                $productoToUpdate->profesional_id = $profesional_id;
                $productoToUpdate->modalidad = $info['modalidad'];
                $productoToUpdate->fecha_programacion = $productoInfo->ahora;
                $productoToUpdate->fecha_inicio = $request->post('start');
                $productoToUpdate->fecha_fin = $request->post('end');
                $productoToUpdate->estado_id = 7;
                $productoToUpdate->pyp_ergonomia = $info['pyp_ergonomia'];
                $productoToUpdate->comentarios = $info['comentarios'];
                $productoToUpdate->fecha_seguimiento = $info['fecha_seguimiento'];
                $productoToUpdate->save();
            }



            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => array('producto' => $this->getProductoData($producto_id),  'productoinfo' => $productoInfo, 'data' => $request->post()),
                'msg'    => 'cita guardada correctamente'
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


    function getProductoData($id)
    {
        $response = Producto::join('clientes', 'productos.cedula', '=', 'clientes.cedula')
            ->join('dependencias', 'clientes.dependencia_id', '=', 'dependencias.codigo')
            ->join('ciudades', 'clientes.ciudad_id', '=', 'ciudades.id')
            ->join('estadoprogramaciones', 'productos.estado_id', '=', 'estadoprogramaciones.id')
            ->select(
                'productos.id',
                'productos.modalidad',
                'productos.descripcion',
                'productos.comentarios',
                'clientes.cedula',
                'clientes.nombre',
                'productos.estado_id',
                'estadoprogramaciones.nombre as estado',
                'dependencias.nombre as dependencia',
                'clientes.email',
                'clientes.telefono',
                'clientes.division',
                'clientes.subdivision',
                'clientes.cargo',
                'clientes.direccion',
                'ciudades.nombre as ciudad',
                'clientes.barrio',
            )
            //->selectRaw("( select count(id) total_productos from productos where producto_repso_id ='" . $id . "') as total_productos")
            ->selectRaw("date_format(productos.fecha_programacion, '%d/%m/%Y') as fecha_programacion")
            ->selectRaw("case clientes.otrosi when 1 then 'Si' else 'No' End otrosi")
            ->where('productos.id', '=', $id)
            ->first();
        return $response;
    }

    /*
  * Validar que las fracciones de tiempo y los resultados que la consulta sean iguales
   */
    function validarOcupado($datesAgenda, $tiempo)
    {
        $response = array();
        $fracciones = $tiempo / $this->minutesToAdd;
        if ($fracciones == count($datesAgenda)) {
            $arr_output = array_filter(json_decode($datesAgenda, true), function ($item) {
                if ($item['ocupado'] != 1) {
                    return $item;
                }
            });

            $response = array(
                'status' => 'errorocupado',
                "msg" => "Las horas elegidas no son validas, se encuentran ocupadas",
                "data" => $arr_output,
                "size" => count($arr_output)

            );
            return $response;
        }

        return $response;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id, Request $request)
    {
        $pageSize = $request->get('pageSize');
        $pageSize == '' ? $pageSize = 20 : $pageSize;

        $profesional_id = $request->get('profesional_id');
        $globalSearch = $request->get('globalsearch');

        $user = User::find($id);

        if (!empty($user)) {

            if ($globalSearch != '') {
                $response = Agenda::withoutTrashed()->orderBy('agendas.id', 'desc')
                    ->globalSearch($globalSearch)
                    ->get();
            } else {
                /*$response = Agenda::withoutTrashed()
                    ->join('lista_items', 'agendas.tipo', '=', 'lista_items.id')
                    ->select('agendas.id', 'profesional_id', 'agendas.tipo', 'start', 'end', 'lista_items.nombre as title', 'lista_items.background as backgroundColor', 'lista_items.color as textColor')
                    ->addSelect(DB::raw(' case agendas.tipo 
                        when 1
                            then "background"
                            else ""
                            end display
                        '))
                    ->orderBy('agendas.id', 'desc')
                    ->where('profesional_id', '=', $id)
                    ->whereDate('start', '>=', $request->post('startDateView'))
                    ->whereDate('end', '<=', $request->post('endDateView'))
                    ->get();*/
                /*$response = Cita::withoutTrashed()
                    ->join('lista_items', 'citas.ocupado', '=', 'lista_items.id')
                    ->select(
                        'citas.id',
                        'profesional_id',
                        'citas.ocupado as tipo',
                        'start',
                        'end',
                        'lista_items.nombre as title',
                        'lista_items.background as backgroundColor',
                        'lista_items.color as textColor'
                    )
                    ->orderBy('citas.id', 'desc')
                    ->where('profesional_id', '=', $id)
                    ->whereDate('start', '>=', $request->post('startDateView'))
                    ->whereDate('end', '<=', $request->post('endDateView'))
                    ->get();*/

                $agendas = DB::table('agendas')
                    ->join('lista_items', 'agendas.tipo', '=', 'lista_items.id')
                    ->select(
                        'agendas.id',
                        'profesional_id',
                        'agendas.tipo',
                        'start',
                        'end',
                        'lista_items.nombre as title',
                        'lista_items.background as backgroundColor',
                        'lista_items.color as textColor'
                    )
                    ->addSelect(DB::raw('"background" as display'))
                    ->orderBy('agendas.id', 'desc')
                    ->where('profesional_id', '=', $id)
                    ->whereDate('start', '>=', $request->post('startDateView'))
                    ->whereDate('end', '<=', $request->post('endDateView'));

                $citas = DB::table('citas')
                    ->join('lista_items', 'citas.ocupado', '=', 'lista_items.id')
                    ->select(
                        'citas.id',
                        'profesional_id',
                        'citas.ocupado as tipo',
                        'start',
                        'end',
                        'lista_items.nombre as title',
                        'lista_items.background as backgroundColor',
                        'lista_items.color as textColor'
                    )
                    ->addSelect(DB::raw('"" as display'))
                    ->orderBy('citas.id', 'desc')
                    ->where('profesional_id', '=', $id)
                    ->where('citas.ocupado', '=', 2)
                    ->whereDate('start', '>=', $request->post('startDateView'))
                    ->whereDate('end', '<=', $request->post('endDateView'))
                    ->union($agendas)
                    ->get();

                $totalCitas = count($citas);

                $response = array(
                    'code' => 200,
                    'status' => $totalCitas > 0 ? "ok" : "nodata",
                    'msg' => $totalCitas > 0 ? "Agenda cargada exitosamente" : "No hay agenda en la fecha consultada",
                    'data' => $citas,
                );
            }
        } else {

            $response = array(
                'code' => 200,
                'status' => 'error',
                'msg' => "no existe usuario con " . $id,
                'validator' => "Id no encontrado"
            );
        }


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
                'status' => 'ok',
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
