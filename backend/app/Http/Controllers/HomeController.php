<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita; /* entitie model */
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{

    public $tiempos = array();
    public $rango = 15;
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        // $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
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

    function orderArrayByDay($appointments)
    {
        $ordenAgendas = array();
    }

    public function test()
    {


        /*$citas = Cita::withoutTrashed()
            ->join('users', 'profesional_id', '=', 'users.id')
            ->select('citas.id as id', 'citas.start', 'citas.end', 'citas.agenda_id', 'users.id as profesional_id', 'users.name as  profesional')
            ->orderBy('citas.id', 'asc')
            ->where('ocupado', '=', 1)->get();*/
        //echo json_encode($citas);

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

        $uniquesDatesCitas = $this->unique_multidim_array($citas, 'onlydate');

        $this->orderArrayByDay($citas);

        $data = [];
        $index = 0;
        $recolector = array();

        foreach ($uniquesDatesCitas as $uniquesCitas) {
            foreach ($citas as $cita) {
                if ($uniquesCitas['onlydate'] == $cita['onlydate']) {
                    $actual = $index;
                    $siguiente = $index + 1;

                    //echo ('<br>' . $citas[$siguiente - 1]['start']);

                    if ($siguiente < count($citas) && $this->minutosInterval($cita['start'], $citas[$siguiente]['start']) == 15) {
                        array_push($recolector, array(
                            "profesional" => $cita['profesional'],
                            "profesional_id" => $cita['profesional_id'],
                            "id" => $cita['id'],
                            "start" => $cita['start'],
                            "end" => $cita['end'],
                            "agenda_id" => $cita['agenda_id'],
                        ));
                        //array_push($this->tiempos, array("item"=>$cita->id, "start"=>$cita->start, "end"=>$cita->end));
                    } else {
                        //echo('<br>'.count($citas).' - siguiente '.$siguiente.' index '.$index. ' start = '.$cita->start. ' - otro '.$citas[$siguiente]['start']);
                        array_push($recolector, array(
                            "profesional" => $cita['profesional'],
                            "profesional_id" => $cita['profesional_id'],
                            "id" => $cita['id'],
                            "start" => $cita['start'],
                            "end" => $cita['end'],
                            "agenda_id" => $cita['agenda_id'],
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

        echo ('<br>tiempos<br>');
        echo json_encode($this->tiempos);
    }

    public function sumarTiempos($arreglo)
    {
        $size = count($arreglo);
        $response = array();
        if ($size > 0) {
            $arr = array(
                "start" => $arreglo[0]['start'],
                "end" => $arreglo[$size - 1]['end'],
                "agenda_id" => $arreglo[0]['agenda_id'],
                "profesional" => $arreglo[0]['profesional'],
                "profesional_id" => $arreglo[0]['profesional'],
                "minutes" => $size * $this->rango
            );
            array_push($response, $arr);
            array_push($this->tiempos, $arr);
        }
    }
}
