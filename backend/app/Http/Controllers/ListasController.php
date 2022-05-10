<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita; /* entitie model */
use Illuminate\Support\Facades\DB;
use Auth;
use App\Models\ListaItem; /* entitie model */

class ListasController extends Controller
{


    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function listarAllItemsById($id)
    {
        $userData = auth()->user();
        $itemsList = ListaItem::withoutTrashed()
            ->select(
                'id',
                'lista_id',
                'nombre',
                'alias',
                'estado',
                'background',
                'color'
            )
            ->where('lista_id', '=', $id)
            ->where('estado', '=', 1)
            ->byProfile($userData)
            ->get();
        return response()->json($itemsList);
    }

    public function estadosAll()
    {
        $estadosLista = DB::table("estadoseguimientos")
            ->get();

        return response()->json($estadosLista);
    }
}
