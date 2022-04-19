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
    public $tiempos = array();
    public $rango = 15;
    public $launchTimeStart = 12; /* hora */
    public $launchTimeEnd = 14;
    public $today;

    public function __construct()
    {
        $this->today = date('Y-m-d');
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

    function minutosInterval($fecha_i, $fecha_f)
    {
        $minutos = (strtotime($fecha_i) - strtotime($fecha_f)) / 60;
        $minutos = abs($minutos);
        $minutos = floor($minutos);
        return $minutos;
    }


    public function unique_multidim_array($array, $key)
    {
        $temp_array = array();
        $i = 0;
        $key_array = array();
        $response_array = array();

        foreach ($array as $val) {
            if (!in_array($val[$key], $key_array)) {
                $key_array[$i] = $val[$key];
                $temp_array[$i] = $val;
            }
            $i++;
        }
        /*order index array para evitar que queden asi las llaves [0]=[valores] [4]=[valores] y pasen a tener orden consecutivi asi [0]=[valores], [1]=[valores]*/

        $i = 0;
        foreach ($temp_array as $cat) {
            $response_array[$i] = $cat;
            $i++;
        }
        return $response_array;
    }

    public function sumarTiempos($arreglo)
    {
        $size = count($arreglo);
        if ($size > 0) {
            $arr = array(
                "start" => $arreglo[0]['start'],
                "end" => $arreglo[$size - 1]['end'],
                "agenda_id" => $arreglo[0]['agenda_id'],
                "profesional" => $arreglo[0]['profesional'],
                "profesional_id" => $arreglo[0]['profesional_id'],
                "onlydate" => $arreglo[0]['onlydate'],
                "dateformat_name" => $arreglo[0]['dateformat_name'],
                "minutes" => $size * $this->rango,
            );
            array_push($this->tiempos, $arr);
        }
    }

    public function enableAgenda()
    {
        $citas = DB::table('citas')
            ->join('users', 'citas.profesional_id', '=', 'users.id')
            ->select(
                "citas.id as id",
                "citas.start",
                "citas.end",
                "citas.agenda_id",
                "users.id as profesional_id",
                "users.name as profesional"
            )
            ->where('citas.ocupado', '=', 1);

        $citas = $citas->addSelect(DB::raw(
            "date_format(citas.start, '%Y-%m-%d') onlydate"
        ))
            ->orderBy('citas.id', 'asc')
            ->get();


        //echo ("diferencia de minutos " . $this->minutosInterval('2022-03-28 08:00:00', '2022-03-28 08:15:00') . ' citastotal = ' . count($citas) . '<br>');
        $citas = json_decode($citas, true);

        $uniquesProfesionalescitas = $this->unique_multidim_array($citas, 'profesional_id');
        $uniquesDatesCitas = $this->unique_multidim_array($citas, 'onlydate');

        $data = [];
        $index = 0;
        $recolector = array();
        foreach ($uniquesProfesionalescitas as $profesionalItem) {
            foreach ($uniquesDatesCitas as $uniquesCitas) {
                foreach ($citas as $cita) {
                    if ($uniquesCitas['onlydate'] == $cita['onlydate']  && $profesionalItem['profesional_id'] == $cita['profesional_id']) {
                        $actual = $index;
                        $siguiente = $index + 1;

                        //echo ('<br>' . $citas[$siguiente - 1]['start']);
                        $dateFormatNameData = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $cita['start']);
                        $dateFormatName = $dateFormatNameData->locale('es')->isoFormat('dddd DD, MMMM');;
                        if ($siguiente < count($citas) && $this->minutosInterval($cita['start'], $citas[$siguiente]['start']) == 15) {
                            array_push($recolector, array(
                                "profesional" => $cita['profesional'],
                                "profesional_id" => $cita['profesional_id'],
                                "id" => $cita['id'],
                                "start" => $cita['start'],
                                "onlydate" => $cita['onlydate'],
                                "end" => $cita['end'],
                                "agenda_id" => $cita['agenda_id'],
                                "dateformat_name" => $dateFormatName
                            ));
                            //array_push($this->tiempos, array("item"=>$cita->id, "start"=>$cita->start, "end"=>$cita->end));
                        } else {
                            //echo('<br>'.count($citas).' - siguiente '.$siguiente.' index '.$index. ' start = '.$cita->start. ' - otro '.$citas[$siguiente]['start']);
                            array_push($recolector, array(
                                "profesional" => $cita['profesional'],
                                "profesional_id" => $cita['profesional_id'],
                                "id" => $cita['id'],
                                "start" => $cita['start'],
                                "onlydate" => $cita['onlydate'],
                                "end" => $cita['end'],
                                "agenda_id" => $cita['agenda_id'],
                                "dateformat_name" => $dateFormatName
                            ));
                            //array_push($this->tiempos, array("item"=>$cita->id, "start" => $cita->start, "end"=>$cita->end));
                            //array_push($recolector, array("item"=> -2, "start" => -2));
                            $this->sumarTiempos($recolector);
                            $recolector = array();
                        }
                        $index++;
                    }
                }
            }
        }

        $response = array(
            'status' => 'ok',
            'code' => 200,
            'data'   => $this->tiempos,
            'msg'    => 'Consulta de tiempos disponibles realizados'
        );

        return response()->json($response);
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
            for ($i = 0; $i < $countRanges; $i++) {
                $newStartDate = $newDate->addMinutes($i * $this->minutesToAdd, 'minute');
                $dateStartToMysql = $newStartDate->toDateTimeString();

                $newEndDate = $newDate->addMinutes(($i + 1) * $this->minutesToAdd, 'minute');
                $dateEndToMysql = $newEndDate->toDateTimeString();
                $startTimeHour = $newStartDate->format('H');


                array_push($response, array(
                    "profesional_id" => $profesional_id,
                    "start" => $dateStartToMysql,
                    "end" => $dateEndToMysql,
                    "ocupado" => ($startTimeHour * 1 >= $this->launchTimeStart && $startTimeHour * 1 < $this->launchTimeEnd) ? 2 : 1,
                    //"starttimehour" => $startTimeHour*1,
                    "index" => $i + 1
                ));
            }
        }
        return $response;
    }

    /*
    *que solo exista una agenda por dia. para el profesional
     */
    public function validarOnlyEnableAgendaByDay($dateInput, $profesional_id, $tipo)
    {
        $agendas = DB::table('agendas')
            ->select(
                'agendas.id',
                'profesional_id',
                'agendas.tipo',
                'start',
                'end'
            )
            ->where('profesional_id', '=', $profesional_id)
            ->where('tipo', '=', $tipo)
            ->whereRaw("date_format(start, '%Y-%m-%d') =  " . "'$dateInput'")
            ->get();

        return $agendas;
    }

    public function validateDataMayorToToday($dateStart)
    {
        $time = $dateStart->format('H:i:s');
        $today = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $this->today . ' ' . $time);
        //return $dateStart->diffInDays($today);

        $response = array();
        if ($dateStart->lte($today)) { /* lte fecha menor o igual a hoy*/
            $response = array(
                'status' => 'errortime',
                'code' => 200,
                'data'   => -1,
                'msg'    => 'no se puede programar una fecha inferior o igual a hoy = ' . $today
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

    public function store(Request $request, $id)
    {
        $validator = Validator::make($request->all(), Agenda::rules($request));
        if (!($validator->fails())) {
            $datesArray = array();
            $timeStart = $this->obtenerHoraFecha($request->post('start'));
            $timeEnd = $this->obtenerHoraFecha($request->post('end'));
            $dateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('start'));
            $dateEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('end'));
            $dateRepeat = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('repeat_end') . ' ' . $timeStart);
            $diffOnDays = $dateStart->diffInDays($dateRepeat);
            $diffOnMinutes = $dateStart->diffInMinutes($dateEnd);

            /*
            * Validar que la fecha hora fin no sea mayor que la fecha fin hora permitida
             */
            $validarMax = $this->validarFechaFinPermitida($dateStart, $dateRepeat);
            if (count($validarMax) > 0) {
                return response()->json($validarMax);
            }

            /*
            *  Validar que solo permita guardar fechas mayores a hoy
            */

            $validateDataMayorToToday = $this->validateDataMayorToToday($dateStart);

            if (count($validateDataMayorToToday) > 0) {
                return response()->json($validateDataMayorToToday);
            }

            /*
            * $request->post('tipo'); 1 = disponible, 2, bloqueo, 3 informe.
            */

            /*$agendaByDay = $this->validarOnlyEnableAgendaByDay($request, $id, $request->post('tipo'));

            return response()->json($agendaByDay);*/


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
                            "timeStart" => $timeStart,
                            "timeEnd" => $timeEnd,
                            "index" => $i,
                            "datesList" => $datesList
                        ));
                    }
                }
            }

            foreach ($datesArray as $item) {

                $modelo = new Agenda();
                $modelo->profesional_id = $id;
                $modelo->tipo    = $request->post('tipo');
                $modelo->start    = $item['onlyDate'] . ' ' . $item['timeStart'];
                $modelo->end    = $item['onlyDate'] . ' ' . $item['timeEnd'];

                $agendaByDay = $this->validarOnlyEnableAgendaByDay($item['onlyDate'], $id, $request->post('tipo'));
                //echo ('existe una ' . json_encode($agendaByDay));
                if (count($agendaByDay) == 0) {

                    $modelo->save();

                    foreach ($item['datesList'] as $newRecordCita) {
                        $newRecord = new Cita();
                        $newRecord->profesional_id = $newRecordCita['profesional_id'];
                        $newRecord->start = $newRecordCita['start'];
                        $newRecord->end = $newRecordCita['end'];
                        $newRecord->ocupado = $newRecordCita['ocupado'];
                        $newRecord->agenda_id = $modelo->id;
                        $newRecord->save();
                    }
                }
            }

            return

                $response = array(
                    'status' => 'ok',
                    'code' => 200,
                    'data'   => $datesArray,
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
                    ->selectRaw("date_format(agendas.start, '%d/%m/%Y') as onlydate")
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
                    ->selectRaw("date_format(citas.start, '%d/%m/%Y') as onlydate")
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
