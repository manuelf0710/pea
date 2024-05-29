<?php
namespace App\Exports;
use Maatwebsite\Excel\Excel;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;
use App\Models\pea\Producto;
use Illuminate\Support\Facades\DB;
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
            ->leftJoin('users', 'productos.profesional_id', 'users.id')
            ->select(
                     'contratos.nombre as ODS',
                     'productos_repso.id as CODIGO_PRODUCTO', 
                     'tipo_productos.name as PRODUCTO', 
                     'clientes.nombre as DESCRIPCION_NOMBRE',                     
                     'productos.cedula as CEDULA',
                     'clientes.email as CORREO',
                     'clientes.telefono as CELULAR',
                     'lista_items.nombre as ESTADO',
                     'users.name as PROFESIONAL_REGISTRO',
                     'estadoseguimientos.nombre as ESTADO_SEGUIMIENTO',
                     'productos.fecha_programacion as FECHA_PROGRAMACION',
                     DB::raw('CONCAT(productos.fecha_inicio, " - ", productos.fecha_fin) as FECHA_AGENDAMIENTO'),
                     DB::raw('(SELECT GROUP_CONCAT(comentario SEPARATOR \'\n-\') FROM producto_reprogramaciones WHERE producto_id = productos.id) as COMENTARIOS')
                    );                    
                    
        /*->where('columna1', $this->parametro1)
        ->where('columna2', $this->parametro2);*/
    }
    public function headings(): array
    {
        // Devuelve un array con los nombres de las columnas en el archivo Excel
        return [
            'ODS',
            'CODIGO_PRODUCTO',
            'PRODUCTO',
            'DESCRIPCION_NOMBRE',
            'CEDULA',
            'CORREO',
            'CELULAR',
            'ESTADO',
            'PROFESIONAL_REGISTRO',
            'ESTADO_SEGUIMIENTO',
            'FECHA_PROGRAMACION',
            'FECHA_AGENDAMIENTO',
            'COMENTARIOS',
            
        ];
    }    
}