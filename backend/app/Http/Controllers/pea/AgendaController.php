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
    private $hasError = false;


    public $timeStart;
    public $timeEnd;
    public $dateStart;
    public $dateEnd;
    public $newDateEnd;
    public $dateRepeat;
    public $diffOnDays;
    public $diffOnMinutes;
    public $tipoProductoData;

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
            if ($size * $this->rango >= $this->tipoProductoData->tiempo) {
                array_push($this->tiempos, $arr);
            }
        }
    }

    public function enableAgenda(Request $request)
    {
        $tipoproducto_id = $request->post('tipo_producto');

        $this->tipoProductoData = DB::table('tipo_productos')
            ->where('id', '=', $tipoproducto_id)
            ->first();

        $citas = DB::table('agendas')
            ->join('citas', 'agendas.id', '=', 'citas.agenda_id')
            ->join('users', 'citas.profesional_id', '=', 'users.id')
            ->join('tipoproducto_users', 'users.id', '=', 'tipoproducto_users.user_id')
            ->select(
                "citas.id as id",
                "citas.start",
                "citas.end",
                "citas.agenda_id",
                "users.id as profesional_id",
                "users.name as profesional"
            )
            ->where('tipoproducto_users.tipoproducto_id', '=', $tipoproducto_id)
            ->where('citas.ocupado', '=', 1)
            ->whereRaw("date_format(agendas.start, '%Y-%m-%d') >=  " . "'$this->today'");

            $citas = $citas->addSelect(DB::raw(
                "date_format(citas.start, '%Y-%m-%d') onlydate"
            ));
            if(auth()->user()->perfil_id === 3){
                $citas = $citas->where('users.id' , '=', auth()->user()->id );
            }

            $citas = $citas->orderBy('citas.id', 'asc')
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
                        if ($siguiente < count($citas) && $this->minutosInterval($cita['start'], $citas[$siguiente]['start']) == $this->minutesToAdd) {
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
                    //"ocupado" => ($startTimeHour * 1 >= $this->launchTimeStart && $startTimeHour * 1 < $this->launchTimeEnd) ? 2 : 1,
                    "ocupado" => 1,
                    //"starttimehour" => $startTimeHour*1,
                    //"razon_bloqueo" => ($startTimeHour * 1 >= $this->launchTimeStart && $startTimeHour * 1 < $this->launchTimeEnd) ? 'Almuerzo' : null,
                    "razon_bloqueo" => null,
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
            ->where('tipo', '=', '1')
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

    public function validarUniqueDayselectable($start, $end)
    {
        $response = array();

        if ($start !== $end) {
            $response = array(
                'status' => 'errortime',
                'code' => 200,
                'data'   => -1,
                'msg'    => 'fecha inicio ' . $start . ' es diferente de ' . $end . ', estas fechas deben ser iguales, lo que varia es la hora'
            );
        }
        return $response;
    }

    /*
  * Validar que las fracciones de tiempo ninguna este ocupada con valor 2 o 3
   */
    function validarOcupado($datesAgenda)
    {
        $response = array();
        if (count($datesAgenda) > 0) {
            $arr_output = array_filter(json_decode($datesAgenda, true), function ($item) {
                if ($item['ocupado'] != 1) {
                    return $item;
                }
            });
            if (count($arr_output)) {
                $response = array(
                    'status' => 'errorocupado',
                    "msg" => "Las horas elegidas no son validas, algunas horas se encuentran ocupadas",
                    "data" => $arr_output,
                    "size" => count($arr_output)

                );
            }

            return $response;
        }

        return $response;
    }

    /*
  * @function getMinimoAndMaxId
  * obtiene el minimo y el maximo id de citas para actualizar
   */
    public function getMinimoAndMaxId($datesAgenda)
    {
        $minimo = 0;
        $maximo = 0;
        for ($i = 0; $i < count($datesAgenda); $i++) {
            if ($i == 0) {
                $minimo = $datesAgenda[$i]->id;
                $maximo = $datesAgenda[$i]->id;
            }
            $minimo = $minimo > $datesAgenda[$i]->id ? $datesAgenda[$i]->id : $minimo;
            $maximo = $maximo < $datesAgenda[$i]->id ? $datesAgenda[$i]->id : $maximo;
        }
        //echo("el minimo es ".$minimo. ' y el maximo = '.$maximo);
        if ($minimo > $maximo) {
            $minimo = 0;
            $maximo = 0;
        }

        return array('minimo' => $minimo,  'maximo' => $maximo);
    }


    public function actualizarRangosCitas($obj, $tipo, $razonBloqueo, $agenda_id)
    {
        $razonBloqueo = $tipo == 1 ? null : $razonBloqueo;

        $response = array(
            'status' => 'ok',
            'code' => 200,
            'data'   => $obj,
            'msg'    =>  $tipo == 2 ? 'Bloqueo guardado' : 'Informe Guardado'
        );
        DB::table('citas')
            ->where('id', '>=', $obj['minimo'])
            ->where('id', '<=', $obj['maximo'])
            ->where('citas.agenda_id', '=', $agenda_id)
            ->whereNull('citas.producto_id')
            ->update(['ocupado' => $tipo, 'razon_bloqueo' => $razonBloqueo]);

        return $response;
    }

    public function getCitasAgenda($dateStart, $newDateEnd, $agendaId)
    {
        $datesAgenda = DB::table('citas')
            ->where('citas.agenda_id', '=', $agendaId)
            ->whereBetween('start', [$dateStart, $newDateEnd])
            ->get();
        return $datesAgenda;
    }

    private function setVarsTime($request)
    {

        $this->timeStart = $this->obtenerHoraFecha($request->post('start'));
        $this->timeEnd = $this->obtenerHoraFecha($request->post('end'));
        $this->dateStart = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('start'));
        $this->dateEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('end'));
        $this->newDateEnd = $this->dateEnd->subMinute($this->minutesToAdd, 'minute');
        $this->dateRepeat = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $request->post('repeat_end') . ' ' . $this->timeStart);
        $this->diffOnDays = $this->dateStart->diffInDays($this->dateRepeat);
        $this->diffOnMinutes = $this->dateStart->diffInMinutes($this->dateEnd);
    }


    public function store(Request $request, $id)
    {
        $validator = Validator::make($request->all(), Agenda::rules($request));
        if (!($validator->fails())) {
            $this->setVarsTime($request);

            $datesArray = array();

            /*
            * validar que no permita seleccionar varios dias en rango en fullcalendar
             */

            $validarUnicoDay = $this->validarUniqueDayselectable($this->dateStart->format('Y-m-d'), $this->dateEnd->format('Y-m-d'));
            if (count($validarUnicoDay) > 0) {
                return response()->json($validarUnicoDay);
            }

            /*
            * Validar que la fecha hora fin no sea mayor que la fecha fin hora permitida
             */
            $validarMax = $this->validarFechaFinPermitida($this->dateStart, $this->dateRepeat);
            if (count($validarMax) > 0) {
                return response()->json($validarMax);
            }


            /*
            * validar que fecha hora inicio no sea mayuor que fecha hhora fina
             */

            $validarMax = $this->validarFechaFinPermitida($this->dateStart, $this->dateEnd);
            if (count($validarMax) > 0) {
                return response()->json($validarMax);
            }

            /*
            *  Validar que solo permita guardar fechas mayores a hoy
            */

            $validateDataMayorToToday = $this->validateDataMayorToToday($this->dateStart);

            if (count($validateDataMayorToToday) > 0) {
                return response()->json($validateDataMayorToToday);
            }

            /*
            * $request->post('tipo'); 1 = disponible, 2, bloqueo, 3 informe.
            */
            //$getDateStart = explode(" ", $dateStart);           
            $getDateStart = $this->dateStart->format('Y-m-d');
            $agendaByDayValidateStart = $this->validarOnlyEnableAgendaByDay($getDateStart, $id, 1);

            switch ($request->post('tipo')) {

                case 1:
                    //$agendaByDayValidateStart = $this->validarOnlyEnableAgendaByDay($getDateStart[0], $id, $request->post('tipo'));  
                    if (count($agendaByDayValidateStart) > 0) {
                        $response = array(
                            'status' => 'errortime',
                            'code' => 200,
                            'data'   => -1,
                            'msg'    => 'ya existe una agenda programada para el profesional seleccionado en la fecha ' . $getDateStart[0]
                        );
                        return response()->json($response);
                    }
                    break;

                case 2:
                    if (count($agendaByDayValidateStart) == 0) {
                        $response = array(
                            'status' => 'errortime',
                            'code' => 200,
                            'data'   => -1,
                            'msg'    => 'Para almacenar un tiempo de bloqueo primero debe tener una agenda programada y sobre esta bloquear el tiempo'
                        );
                        return response()->json($response);
                    }
                    break;
                case 3:
                    if (count($agendaByDayValidateStart) == 0) {
                        $response = array(
                            'status' => 'errortime',
                            'code' => 200,
                            'data'   => -1,
                            'msg'    => 'Para almacenar un tiempo de informe primero debe tener una agenda programada y sobre esta agregar el tiempo'
                        );
                        return response()->json($response);
                    }
                    break;
                default:
            }
            /*
            if($request->post('tipo') == 2 || $request->post('tipo') == 3 && ($diffOnDays == 0)){
                //echo json_encode($agendaByDayValidateStart);
                $datesAgenda = $this->getCitasAgenda($dateStart, $newDateEnd, $agendaByDayValidateStart[0]->id);
     
                $validateOcupadosFraccionestiempo = $this->validarOcupado($datesAgenda);
                if (count($validateOcupadosFraccionestiempo) > 0) {
                    return response()->json($validateOcupadosFraccionestiempo);
                }                
                
                $datesAgenda = $datesAgenda->toArray();
                $minimoAndMaxId = $this->getMinimoAndMaxId($datesAgenda);
                if($minimoAndMaxId['minimo'] == 0 || $minimoAndMaxId['maximo'] == 0){
                    $response = array(
                        'status' => 'errortime',
                        'code' => 200,
                        'data'   => -1,
                        'msg'    => 'se presento un error al validar minimos y maximos del rango de tiempo en citas'
                    ); 
                    return response()->json($response);
                }

                $guardarBloqueo = $this->actualizarRangosCitas($minimoAndMaxId, $request->post('tipo'), $request->post('razon_bloqueo'));
                return response()->json($guardarBloqueo);
            } */

            //return 'el tipo = '.$request->post('tipo');
            //echo ' otherfield'. $agendaByDayValidateStart[0]->id;

            if ($this->diffOnDays >= 0) {
                for ($i = 0; $i <= $this->diffOnDays; $i++) {
                    $newDate = $this->dateStart;
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

                        $datesList = $this->addMinutesToDate($this->timeStart, $this->timeEnd, $id, $this->dateStart, $this->dateRepeat, $this->dateEnd, $this->diffOnMinutes, $newDate);
                        //$datesList = array();

                        array_push($datesArray, array(
                            "dateStart" => $this->dateStart,
                            "newDate" => $newDate,
                            "startTime" => $startTime,
                            "onlyDate" => $onlyDate,
                            "dayName" => $dayName,
                            "dateToMysql" => $dateToMysql,
                            "dayNumber" => $dayNumber,
                            "diffOnMinutes" => $this->diffOnMinutes,
                            "timeStart" => $this->timeStart,
                            "timeEnd" => $this->timeEnd,
                            "index" => $i,
                            "id" => '',
                            "datesList" => $datesList
                        ));
                    }
                }
            }
            $indexAgenda = 0;
            foreach ($datesArray as $item) {
                if ($request->post('tipo') == '1') {
                    $modelo = new Agenda();
                    $modelo->profesional_id = $id;
                    $modelo->tipo    = $request->post('tipo');
                    $modelo->start    = $item['onlyDate'] . ' ' . $item['timeStart'];
                    $modelo->end    = $item['onlyDate'] . ' ' . $item['timeEnd'];

                    $agendaByDay = $this->validarOnlyEnableAgendaByDay($item['onlyDate'], $id, $request->post('tipo'));
                    //echo ('existe una ' . json_encode($agendaByDay));
                    if (count($agendaByDay) == 0) {

                        $modelo->save();
                        /*
                        * Set value agenda id de modelo agenda recien guardado
                        */
                        $datesArray[$indexAgenda]['id'] = $modelo->id;

                        foreach ($item['datesList'] as $newRecordCita) {
                            $newRecord = new Cita();
                            $newRecord->profesional_id = $newRecordCita['profesional_id'];
                            $newRecord->start = $newRecordCita['start'];
                            $newRecord->end = $newRecordCita['end'];
                            $newRecord->ocupado = $newRecordCita['ocupado'];
                            $newRecord->razon_bloqueo = $newRecordCita['razon_bloqueo'];
                            $newRecord->agenda_id = $modelo->id;
                            $newRecord->save();
                        }
                    }
                } else {
                    $agendaByDay = $this->validarOnlyEnableAgendaByDay($item['onlyDate'], $id, $request->post('tipo'));
                    if (count($agendaByDay) > 0) {
                        //echo("antessS?");
                        //echo("entro en agendaday > 0 || ");
                        //echo(json_encode($item).' chhhc');

                        $newDateEndMenosminutesToAdd = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $item['onlyDate'] . ' ' . $item['timeEnd']);
                        $newDateEndValidator = $newDateEndMenosminutesToAdd->subMinute($this->minutesToAdd, 'minute');

                        $datesAgenda = $this->getCitasAgenda($item['onlyDate'] . ' ' . $item['timeStart'], $newDateEndValidator, $agendaByDay[0]->id);
                        //echo(json_encode($datesAgenda).'--]');
                        //echo($item['onlyDate'] . ' ' . $item['timeStart'].' =inicio & end ='.$item['onlyDate'] . ' ' . $item['timeEnd'].'&agenda_id = '.$agendaByDay[0]->id.'(?)');
                        $validateOcupadosFraccionestiempo = $this->validarOcupado($datesAgenda);
                        //echo(json_encode($validateOcupadosFraccionestiempo).'(?)');
                        $datesAgenda = $datesAgenda->toArray();
                        //echo('datesagenda '.$indexAgenda.' ='.json_encode($datesAgenda));
                        if (count($validateOcupadosFraccionestiempo) == 0) {
                            //echo("ingresa ".json_encode($datesAgenda));
                            $minimoAndMaxId = $this->getMinimoAndMaxId($datesAgenda);
                            //echo(json_encode($minimoAndMaxId).' (??)');
                            if ($minimoAndMaxId['minimo'] == 0 || $minimoAndMaxId['maximo'] == 0) {
                            } else {
                                $guardarBloqueo = $this->actualizarRangosCitas($minimoAndMaxId, $request->post('tipo'), $request->post('razon_bloqueo'), $agendaByDay[0]->id);
                            }
                        }

                        //echo(json_encode($datesAgenda));
                    }
                }
                $indexAgenda++;
            }



            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $datesArray,
                //'data'   => 21,
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
                $startDateView = $request->post('startDateView');
                $endDateView = $request->post('endDateView');
                /*
                $agendas = DB::table('agendas')
                    ->join('lista_items', 'agendas.tipo', '=', 'lista_items.id')
                    ->select(
                        'agendas.id',
                        'profesional_id',
                        'agendas.tipo',
                        'lista_items.background as backgroundColor',
                        'lista_items.color as textColor'
                    )
                    ->addSelect(DB::raw('"" as producto_id'))
                    ->addSelect(DB::raw('"background" as display'))
                    ->addSelect(DB::raw('"deagenda" as origen'))
                    ->selectRaw("date_format(agendas.start, '%d/%m/%Y') as onlydate")
                    ->selectRaw("lista_items.nombre as title")
                    ->selectRaw("agendas.start as start")
                    ->selectRaw("agendas.end as end")
                    ->where('profesional_id', '=', $id)
                    ->whereRaw("date_format(start , '%Y-%m-%d') >=  " . "'$startDateView'")
                    ->whereRaw("date_format(end , '%Y-%m-%d') <=  " . "'$endDateView'");



                $citas = DB::table('citas')
                    ->join('lista_items', 'citas.ocupado', '=', 'lista_items.id')
                    ->select(
                        'citas.id',
                        'profesional_id',
                        'citas.ocupado as tipo',
                        'lista_items.background as backgroundColor',
                        'lista_items.color as textColor',
                        'citas.producto_id'
                    )
                    ->addSelect(DB::raw('"" as display'))
                    ->addSelect(DB::raw('"decitas" as origen'))
                    ->selectRaw("date_format(citas.start, '%d/%m/%Y') as onlydate")
                    ->addSelect(DB::raw("(SELECT concat(tipo_productos.name,' - ', clientes.nombre)
                    FROM   productos,
                           clientes,
                           productos_repso,
                           tipo_productos
                    WHERE  productos.id = citas.producto_id
                           AND productos.cedula = clientes.cedula
                           AND productos.producto_repso_id = productos_repso.id
                           AND productos_repso.tipoproducto_id = tipo_productos.id) as title"))

                    ->selectRaw("min(start) as start")
                    ->selectRaw("max(end) as end")
                    ->where('profesional_id', '=', $id)
                    ->where('citas.ocupado', '=', 2)
                    ->whereRaw("date_format(start , '%Y-%m-%d') >=  " . "'$startDateView'")
                    ->whereRaw("date_format(end , '%Y-%m-%d') <=  " . "'$endDateView'")
                    ->whereNotNull('citas.producto_id')
                    ->groupBy('citas.producto_id')
                    ->union($agendas)
                    ->get(); */

                //$totalCitas = count($citas);
                $citas = DB::select("SELECT 
                                    citas.agenda_id as agenda_id,
                                    citas.id,
                                    citas.profesional_id,
                                    citas.ocupado AS tipo,
                                    citas.razon_bloqueo as razon_bloqueo,
                                    lista_items.background as backgroundColor,
                                    lista_items.color AS textColor,
                                    citas.producto_id,
                                    '' AS display,
                                    'decitasproducto' AS origen,
                                    date_format(citas.start, '%d/%m/%Y') AS onlydate,
                                    (SELECT concat(tipo_productos.NAME, ' - ', clientes.nombre, ' -',lista_items.nombre)
                                        FROM productos, clientes, productos_repso, tipo_productos
                                        WHERE productos.id = citas.producto_id
                                        AND productos.cedula = clientes.cedula
                                        AND productos.producto_repso_id = productos_repso.id
                                        AND productos_repso.tipoproducto_id = tipo_productos.id) AS title,
                                        min(start) AS  start, 
                                        max(end) AS end
                                FROM citas
                                inner join productos on citas.producto_id = productos.id
                                inner join lista_items on productos.estado_id = lista_items.id
                                WHERE citas.profesional_id = '" . $id . "'
                                AND citas.ocupado = 2
                                AND date_format(start, '%Y-%m-%d') >= '" . $startDateView . "'
                                AND date_format(end, '%Y-%m-%d') <= '" . $endDateView . "'
                                AND citas.producto_id IS NOT NULL
                                GROUP BY citas.producto_id
                                UNION
                                SELECT citas.agenda_id as agenda_id,
                                    citas.id,
                                    profesional_id,
                                    citas.ocupado AS tipo,
                                    citas.razon_bloqueo as razon_bloqueo,
                                    lista_items.background as backgroundColor,
                                    lista_items.color AS textColor,
                                    citas.producto_id,
                                    '' AS display,
                                    'decitas' AS origen,
                                    date_format(citas.start, '%d/%m/%Y') AS onlydate,
                                    citas.razon_bloqueo AS title,
                                    citas.start AS
                                start, citas.end AS end
                                FROM citas
                                INNER JOIN lista_items ON citas.ocupado = lista_items.id
                                WHERE profesional_id =  '" . $id . "'
                                AND citas.ocupado in (2, 3)
                                AND date_format(start, '%Y-%m-%d') >=  '" . $startDateView . "'
                                AND date_format(end, '%Y-%m-%d') <=  '" . $endDateView . "'
                                AND citas.producto_id IS NULL
                                UNION
                                
                                SELECT  agendas.id as agenda_id,
                                    concat('agenda','_',agendas.id),
                                    profesional_id,
                                    agendas.tipo,
                                    '' as razon_bloqueo,
                                    lista_items.background AS backgroundcolor,
                                    lista_items.color AS textcolor,
                                    '' AS producto_id,
                                    'background' AS display,
                                    'deagenda' AS origen,
                                    date_format(agendas.start, '%d/%m/%Y') AS onlydate,
                                    lista_items.nombre AS title,
                                    agendas.start AS
                                start, agendas.end AS end
                                FROM agendas
                                INNER JOIN lista_items ON agendas.tipo = lista_items.id
                                WHERE profesional_id =  '" . $id . "'
                                AND date_format(start, '%Y-%m-%d') >=  '" . $startDateView . "'
                                AND date_format(end, '%Y-%m-%d') <=  '" . $endDateView . "'");

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

    public function getAgendas($dateStart, $newDateEnd, $profesional_id)
    {
        $datesAgenda = DB::table('agendas')
            ->select('agendas.id', 'agendas.profesional_id', 'agendas.tipo', 'agendas.start', 'agendas.end')
            ->addSelect(DB::raw(
                "date_format(agendas.start, '%Y-%m-%d') onlydate"
            ))
            ->where('agendas.profesional_id', '=', $profesional_id)
            //->whereBetween('agendas.start', [$dateStart, $newDateEnd])
            ->whereRaw("date_format(agendas.start, '%Y-%m-%d') >=  " . "'$dateStart'")
            ->whereRaw("date_format(agendas.start, '%Y-%m-%d') <=  " . "'$newDateEnd'")
            ->get();
        return $datesAgenda;
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
        $cita_id = $id;
        $id = $request->post('profesional_id');
        $this->setVarsTime($request);

        $datesArray = array();
        /*
            * validar que no permita seleccionar varios dias en rango en fullcalendar
             */

        $validarUnicoDay = $this->validarUniqueDayselectable($this->dateStart->format('Y-m-d'), $this->dateEnd->format('Y-m-d'));
        if (count($validarUnicoDay) > 0) {
            return response()->json($validarUnicoDay);
        }
        /*
            * Validar que la fecha hora fin no sea mayor que la fecha fin hora permitida
             */
        $validarMax = $this->validarFechaFinPermitida($this->dateStart, $this->dateRepeat);
        if (count($validarMax) > 0) {
            return response()->json($validarMax);
        }


        /*
            * validar que fecha hora inicio no sea mayuor que fecha hhora fina
             */

        $validarMax = $this->validarFechaFinPermitida($this->dateStart, $this->dateEnd);
        if (count($validarMax) > 0) {
            return response()->json($validarMax);
        }

        /*
            *  Validar que solo permita guardar fechas mayores a hoy
            */

        $validateDataMayorToToday = $this->validateDataMayorToToday($this->dateStart);

        if (count($validateDataMayorToToday) > 0) {
            return response()->json($validateDataMayorToToday);
        }

        $getDateStart = $this->dateStart->format('Y-m-d');
        $agendaByDayValidateStart = $this->validarOnlyEnableAgendaByDay($getDateStart, $id, 1);


        switch ($request->post('tipo')) {

            case 1:
                //$agendaByDayValidateStart = $this->validarOnlyEnableAgendaByDay($getDateStart[0], $id, $request->post('tipo'));  
                if (count($agendaByDayValidateStart) == 0) {
                    $response = array(
                        'status' => 'errortime',
                        'code' => 200,
                        'data'   => -1,
                        'msg'    => 'debe haber una agenda programada para el profesional seleccionado en la fecha ' . $getDateStart[0]
                    );
                    return response()->json($response);
                }
                break;

            case 2:
                if (count($agendaByDayValidateStart) == 0) {
                    $response = array(
                        'status' => 'errortime',
                        'code' => 200,
                        'data'   => -1,
                        'msg'    => 'Para actualizar un tiempo de bloqueo primero debe tener una agenda programada y sobre esta liberar el tiempo'
                    );
                    return response()->json($response);
                }
                break;
            case 3:
                if (count($agendaByDayValidateStart) == 0) {
                    $response = array(
                        'status' => 'errortime',
                        'code' => 200,
                        'data'   => -1,
                        'msg'    => 'Para actualizar un tiempo de informe primero debe tener una agenda programada y sobre esta agregar el tiempo'
                    );
                    return response()->json($response);
                }
                break;
            default:
        }

        $datesArray = $this->getAgendas($this->dateStart->format('Y-m-d'), $this->dateRepeat->format('Y-m-d'), $id);
        //echo (json_encode($datesArray));

        //echo (json_encode($datesArray));
        $indexAgenda = 0;
        $citas = array();

        foreach ($datesArray as $item) {
            $newDateToEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s',  $item->onlydate . ' ' . $this->timeEnd);
            $newDateEndValidator = $newDateToEnd->subMinute($this->minutesToAdd, 'minute');
            $citasByAgenda = $this->getCitasAgenda($item->onlydate . ' ' . $this->timeStart, $newDateEndValidator->format('Y-m-d H:i:s'), $item->id);


            $minimoAndMaxId = $this->getMinimoAndMaxId($citasByAgenda);
            if ($minimoAndMaxId['minimo'] > 0 && $minimoAndMaxId['maximo'] > 0) {
                $guardarBloqueo = $this->actualizarRangosCitas($minimoAndMaxId, $request->post('tipo'), $request->post('razon_bloqueo'), $item->id);
            }
        }

        /*$newDateToEnd = CarbonImmutable::createFromFormat('Y-m-d H:i:s',  $datesArray[0]->onlydate . ' ' . $this->timeEnd);
        $newDateEndValidator = $newDateToEnd->subMinute($this->minutesToAdd, 'minute');
        $citasByAgenda = $this->getCitasAgenda($datesArray[0]->onlydate . ' ' . $this->timeStart, $newDateEndValidator->format('Y-m-d H:i:s'), $datesArray[0]->id);*/








        $extendedProps = $request->post('extendedprops');

        $tipo = $request->post('tipo');
        if (is_array($extendedProps)) {
        }


        if (count($datesArray) > 0) {

            $response = array(
                'status' => 'ok',
                'code' => 200,
                'data'   => $datesArray,
                'msg'    => 'Actualizado',
            );
        } else {
            $response = array(
                'status' => 'errorocupado',
                'code' => 200,
                'data' => -1,
                'msg' => 'Se presento un error al actualizar',
                "size" => count($datesArray)


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