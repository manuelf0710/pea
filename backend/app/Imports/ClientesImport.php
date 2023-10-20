<?php

namespace App\Imports;

use App\Models\Cliente;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithCustomCsvSettings;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class ClientesImport implements ToCollection, WithChunkReading, WithCustomCsvSettings
{
    public $clientesImportar = array();

    /**
     * @param Collection $collection
     */

    public function obtenerModalidad($StringToSearch){
        if($StringToSearch == null) return null;
        if(str_contains(strtolower($StringToSearch), 'vi')) return '2'; /**si contiene la palaba vi es virtual */
        if(str_contains(strtolower($StringToSearch), 'pr')) return '1'; /** si contiene pr es presencial */
        return null; 
    }
    public function collection(Collection $collection)
    {
        $i = 0;
        foreach ($collection as $row) {
            if ($i > 0) {
                /*$cliente = [
                    'cedula' => $row[0],
                    'nombre' => $row[1],
                    'dependencia_id' => $row[2],
                    'email' => $row[3],
                    'telefono' => $row[4],
                    'division' => $row[5],
                    'subdivision' => $row[6],
                    'cargo' => $row[7],
                    'direccion' => $row[8],
                    'ciudad_id' => $row[9],
                    'barrio' => $row[10],
                    'otrosi' => $row[11] == 'SI' ? 1 : 2
                ];
                $ok = Cliente::updateOrCreate(
                    $cliente
                ); */

                $find = Cliente::find($row[0]);
                if (!empty($find)) {
                    $find->cedula =  $row[0];
                    $find->nombre =  $row[1];
                    $find->dependencia_id = $row[2];
                    $find->email = $row[3];
                    $find->telefono = $row[4];
                    $find->division = $row[5];
                    $find->subdivision = $row[6];
                    $find->cargo = $row[7];
                    $find->direccion =  $row[8];
                    $find->ciudad_id =  $row[9];
                    $find->barrio =  $row[10];
                    $find->otrosi =  $row[11] == 'SI' ? 1 : 2;

                    $find->modalidad = $this->obtenerModalidad($row[13]); 
                    $find->save();
                    array_push($this->clientesImportar, $find);
                } else {
                    $find2 = new Cliente();
                    $find2->cedula =  $row[0];
                    $find2->nombre =  $row[1];
                    $find2->dependencia_id = $row[2];
                    $find2->email = $row[3];
                    $find2->telefono = $row[4];
                    $find2->division = $row[5];
                    $find2->subdivision = $row[6];
                    $find2->cargo = $row[7];
                    $find2->direccion =  $row[8];
                    $find2->ciudad_id =  $row[9];
                    $find2->barrio =  $row[10];
                    $find2->otrosi =  $row[11] == 'SI' ? 1 : 2;
                    $find2->modalidad = $this->obtenerModalidad($row[13]);
                    $find2->save();
                    $find2->cedula =  $row[0];
                    array_push($this->clientesImportar, $find2);
                }

                /*$found = 0;
                foreach ($this->clientesImportar as $item) {
                    if ($item['cedula'] === $row[0] && $found == 0) {
                        $found = 1;
                    }
                }
                if ($found == 0) {
                    array_push($this->clientesImportar, $find);
                }*/
            }
            $i++;
        }
        //echo(json_encode($this->clientesImportar));                           
    }
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    /*public function model(array $row)
    {
        return new Cliente([
            'cedula' => $row[0],
            'nombre' => $row[1],
            'dependencia_id' => $row[2],
            'email' => $row[3],
            'telefono' => $row[4],
            'division' => $row[5],
            'subdivision' => $row[6],
            'cargo' => $row[7],
            'direccion' => $row[8],
            'ciudad_id' => $row[9],
            'barrio' => $row[10],
            'otrosi' => $row[11]           

        ]);
    } */

    //por si fuesen archivos muy grandes
    public function chunkSize(): int
    {
        return 1000;
    }

    public function getCsvSettings(): array
    {
        return [
            'delimiter' => ";",
        ];
    }
}