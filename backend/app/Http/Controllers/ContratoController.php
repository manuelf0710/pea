<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita; /* entitie model */
use Illuminate\Support\Facades\DB;
use Auth;
use App\Models\ListaItem; /* entitie model */

class ContratoController extends Controller
{


    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */

    public function contratosAll()
    {
        $estadosLista = DB::table("contratos")
            ->select('id as value','nombre as label')
            ->get();

        return response()->json($estadosLista);
    }
}
