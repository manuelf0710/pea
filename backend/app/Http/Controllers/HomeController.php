<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita; /* entitie model */

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

    public function test()
    {


        $citas = Cita::withoutTrashed()->orderBy('citas.id', 'asc')
            ->join('users', 'profesional_id', '=', 'users.id')
            ->select('citas.id as id', 'citas.start', 'citas.end', 'citas.agenda_id', 'users.id as profesional_id', 'users.name as  profesional')
            ->orderBy('citas.id', 'asc')
            ->where('ocupado', '=', 1)->get();
        //echo json_encode($citas);
        echo ("diferencia de minutos " . $this->minutosInterval('2022-03-28 08:00:00', '2022-03-28 08:15:00'));
        echo "---" . count($citas);

        $data = [];
        $index = 0;
        $recolector = array();
        foreach ($citas as $cita) {
            $actual = $index;
            $siguiente = $index + 1;

            //echo('<br>'.$citas[$siguiente-1]['start']);

            if ($siguiente < count($citas) && $this->minutosInterval($cita->start, $citas[$siguiente]['start']) == 15) {
                array_push($recolector, array(
                    "profesional" => $cita->profesional,
                    "profesional_id" => $cita->profesional_id,
                    "id" => $cita->id,
                    "start" => $cita->start,
                    "end" => $cita->end,
                    "agenda_id" => $cita->agenda_id,
                ));
                //array_push($this->tiempos, array("item"=>$cita->id, "start"=>$cita->start, "end"=>$cita->end));
            } else {
                //echo('<br>'.count($citas).' - siguiente '.$siguiente.' index '.$index. ' start = '.$cita->start. ' - otro '.$citas[$siguiente]['start']);
                array_push($recolector, array(
                    "id" => $cita->id,
                    "start" => $cita->start,
                    "end" => $cita->end,
                    "agenda_id" => $cita->agenda_id,
                    "profesional" => $cita->profesional,
                    "profesional_id" => $cita->profesional_id
                ));
                //array_push($this->tiempos, array("item"=>$cita->id, "start" => $cita->start, "end"=>$cita->end));
                //array_push($recolector, array("item"=> -2, "start" => -2));
                $this->sumarTiempos($recolector);
                $recolector = array();
            }
            $index++;
        }
        /*foreach($recolector as $item){
            echo("<br>".$item['id'].'-- start --'.$item['start'].' --end --'.$item['end']);
        }*/
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
