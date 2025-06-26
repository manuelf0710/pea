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

    protected $params;

    public function __construct($params)
    {
        $this->params = $params;
    }
    public function collection()
    {
        return Producto::all(); 
    }
    
    public function query()
    {
        $query = Producto::query()
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
        if (!empty($this->params['tipoProducto'])) {
            $query->where('productos_repso.tipoproducto_id', $this->params['tipoProducto']);
        }

        if (!empty($this->params['regional'])) {
            $query->where('productos_repso.regional_id', $this->params['regional']);
        }

        if (!empty($this->params['modalidad'])) {
            $query->where('productos.modalidad', $this->params['modalidad']);
        }

        if (!empty($this->params['grupal'])) {
            $query->where('productos_repso.grupal', $this->params['grupal']);
        }

        if (!empty($this->params['cedula'])) {
            $query->where('productos.cedula', $this->params['cedula']);
        }

        if (!empty($this->params['estado'])) {
            $query->where('productos.estado_id', $this->params['estado']);
        }

        if (!empty($this->params['contrato'])) {
            $query->where('productos_repso.contrato_id', $this->params['contrato']);
        }

        if (!empty($this->params['profesional'])) {
            $query->where('productos.profesional_id', $this->params['profesional']);
        }

        if (!empty($this->params['productoRepsoId'])) {
            $query->where('productos_repso.id', $this->params['productoRepsoId']);
        }

        if (!empty($this->params['fechaProgramacionDesde'])) {
            $query->whereDate('productos.fecha_programacion', '>=', $this->params['fechaProgramacionDesde']);
        }

        if (!empty($this->params['fechaProgramacionHasta'])) {
            $query->whereDate('productos.fecha_programacion', '<=', $this->params['fechaProgramacionHasta']);
        }

        if (!empty($this->params['fechaInicio'])) {
            $query->whereDate('productos.fecha_inicio', '>=', $this->params['fechaInicio']);
        }

        if (!empty($this->params['fechaFin'])) {
            $query->whereDate('productos.fecha_fin', '<=', $this->params['fechaFin']);
        }

        return $query;        
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