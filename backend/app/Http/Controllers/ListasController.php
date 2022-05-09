<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cita; /* entitie model */
use Illuminate\Support\Facades\DB;

class ListasController extends Controller
{


    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function listarAllItemsById($id)
    {
        $itemsList = DB::table("listas")
            ->select(
                'lista_items.id',
                'lista_items.lista_id',
                'lista_items.nombre',
                'lista_items.alias',
                'lista_items.estado',
                'lista_items.background',
                'lista_items.color'
            )
            ->join('lista_items', 'listas.id', '=', 'lista_items.lista_id')
            ->where('listas.id', '=', $id)
            ->where('listas.estado', '=', 1)
            ->where('lista_items.estado', '=', 1)
            ->get();
        return response()->json($itemsList);
    }

    public function estadosAll()
    {
        $estadosLista = DB::table("estadoprogramaciones")
            ->get();

        return response()->json($estadosLista);
    }
}
