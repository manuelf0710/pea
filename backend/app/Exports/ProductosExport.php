<?php
namespace App\Exports;
use Maatwebsite\Excel\Excel;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;
use App\Models\pea\Producto;
class ProductosExport implements FromQuery, WithHeadings
{
    public function collection()
    {
        return Producto::all(); 
    }
    public function query()
    {
        return Producto::query()
            ->join('productos_repso', 'productos.producto_repso_id', '=', 'productos_repso.id')
            ->join('contratos', 'productos_repso.contrato_id', '=', 'contratos.id')
            ->join('clientes', 'productos.cedula', '=', 'clientes.cedula')
            ->join('tipo_productos', 'productos_repso.tipoproducto_id', '=', 'tipo_productos.id')
            ->join('lista_items', 'productos.estado_id', '=', 'lista_items.id')
            ->leftJoin('estadoseguimientos', 'productos.estadoseguimiento_id', 'estadoseguimientos.id')
            ->select(
                     'contratos.nombre as ODS',
                     'tipo_productos.name as PRODUCTO', 
                     'productos.cedula as DESCRIPCION_NOMBRE',                     
                     'productos.cedula as CEDULA',
                     'clientes.email as CORREO',
                     'clientes.telefono as CELULAR',
                     'lista_items.nombre as ESTADO',
                     'estadoseguimientos.nombre as ESTADO_SEGUIMIENTO',
                     'productos.fecha_programacion as FECHA_PROGRAMACION',
                     'productos.fecha_programacion as HORA'
                    );                    
                    
        /*->where('columna1', $this->parametro1)
        ->where('columna2', $this->parametro2);*/
    }
    public function headings(): array
    {
        // Devuelve un array con los nombres de las columnas en el archivo Excel
        return [
            'ODS',
            'PRODUCTO',
            'DESCRIPCION_NOMBRE',
            'CEDULA',
            'CORREO',
            'CELULAR',
            'ESTADO',
            'ESTADO_SEGUIMIENTO',
            'FECHA_PROGRAMACION'
            
        ];
    }    
}