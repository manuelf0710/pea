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
            ->join('tipo_productos', 'productos_repso.tipoproducto_id', '=', 'tipo_productos.id')
            ->select('tipo_productos.name as PRODUCTO', 'productos.cedula as DESCRIPCION_NOMBRE');
        /*->where('columna1', $this->parametro1)
        ->where('columna2', $this->parametro2);*/
    }
    public function headings(): array
    {
        // Devuelve un array con los nombres de las columnas en el archivo Excel
        return [
            'PRODUCTO',
            'DESCRIPCION_NOMBRE',
        ];
    }    
}