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

class AgendaController extends Controller
{

    public $minutesToAdd = 15;
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


    public function getAgendaById($id)
    {
        $response = Agenda::withoutTrashed()
            ->join('lista_items', 'agendas.tipo', '=', 'lista_items.id')
            ->select('agendas.id', 'profesional_id', 'agendas.tipo', 'start', 'end', 'lista_items.nombre as title', 'lista_items.background as backgroundColor', 'lista_items.color as textColor')
            ->find($id);

        return $response;
    }


    function obtenerHoraFecha($fecha)
    {
        $timePart = explode(" ", $fecha);
        return $timePart[1];
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */

    function addMinutesToDate($timeStart, $timeEnd, $profesional_id, $dateStart, $dateRepeat, $dateEnd, $diffOnMinutes, $newDate)
    {
        $response = array();

        if ($diffOnMinutes > 0) {
            $countRanges = $diffOnMinutes / $this->minutesToAdd;
            for ($i = 0; $i <= $countRanges; $i++) {
                $newStartDate = $newDate->addMinutes($i * $this->minutesToAdd, 'minute');
                $dateStartToMysql = $newStartDate->toDateTimeString();

                $newEndDate = $newDate->addMinutes(($i + 1) * $this->minutesToAdd, 'minute');
                $dateEndToMysql = $newEndDate->toDateTimeString();


                array_push($response, array(
                    "profesional_id" => $profesional_id,
                    "start" => $dateStartToMysql,
                    "end" => $dateEndToMysql,
                    "index" => $i + 1
                ));
            }
        }
        return $response;
    }

    public function store(Request $request, $id)
    {
        $validator = Validator::make($request->all(), Agenda::rules($request));
        if (!($validator->fails())) {
            $modelo = new Agenda();
            $modelo->profesional_id = $id;
            $modelo->tipo    = $request->post('tipo');
            $modelo->start    = $request->post('start');
            $modelo->end    = $request->post('end');
            //$modelo->save();


            $datesArray = array();
            $timeStart = $this->obtenerHoraFecha($request->post('start'));
            $timeEnd = $this->obtenerHoraFecha($request->post('end'));
            $dateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('start'));
            $dateEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('end'));
            $dateRepeat = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('repeat_end') . ' ' . $timeStart);
            $diffOnDays = $dateStart->diffInDays($dateRepeat);
            $diffOnMinutes = $dateStart->diffInMinutes($dateEnd);
            if ($diffOnDays >= 0) {
                for ($i = 0; $i <= $diffOnDays; $i++) {
                    $newDate = $dateStart;
                    $newDate = $newDate->addDays($i, 'day');
                    //$newDate2 = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $newDate->toDateTimeString());
                    $startTime  = $newDate->format('H:i:s');
                    $onlyDate  = $newDate->format('Y-m-d');
                    $dayName = $newDate->englishDayOfWeek;
                    $dateToMysql = $newDate->toDateTimeString();
                    $dayNumber = $newDate->dayOfWeekIso;
                    /*
                    * Diferente de sabado y domingo
                    */
                    if ($dayNumber != 6 && $dayNumber != 7) {

                        $datesList = $this->addMinutesToDate($timeStart, $timeEnd, $id, $dateStart, $dateRepeat, $dateEnd, $diffOnMinutes, $newDate);

                        array_push($datesArray, array(
                            "dateStart" => $dateStart,
                            "newDate" => $newDate,
                            "startTime" => $startTime,
                            "onlyDate" => $onlyDate,
                            "dayName" => $dayName,
                            "dateToMysql" => $dateToMysql,
                            "dayNumber" => $dayNumber,
                            "diffOnMinutes" => $diffOnMinutes,
                            "index" => $i,
                            "datesList" => $datesList
                        ));
                    }
                }
            }


            foreach ($datesArray as $item) {
                foreach ($item['datesList'] as $newRecordCita) {
                    $newRecord = new Cita();
                    $newRecord->profesional_id = $newRecordCita['profesional_id'];
                    $newRecord->start = $newRecordCita['start'];
                    $newRecord->end = $newRecordCita['end'];

                    $newRecord->save();
                }
            }




            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $this->getAgendaById($modelo->id),
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
                $response = Agenda::withoutTrashed()
                    ->join('lista_items', 'agendas.tipo', '=', 'lista_items.id')
                    ->select('agendas.id', 'profesional_id', 'agendas.tipo', 'start', 'end', 'lista_items.nombre as title', 'lista_items.background as backgroundColor', 'lista_items.color as textColor')
                    ->orderBy('agendas.id', 'desc')
                    ->where('profesional_id', '=', $id)
                    ->whereDate('start', '>=', $request->post('startDateView'))
                    ->whereDate('end', '<=', $request->post('endDateView'))
                    ->get();
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