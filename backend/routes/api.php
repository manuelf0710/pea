<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
	return $request->user();
});

Route::group([
	'prefix' => 'files',
], function () {
	Route::post('uploads', 'UploadFileController@store');
});

Route::group([
	'prefix' => 'auth',
], function () {
	Route::post('login', 'AuthController@login');
	Route::post('logout', 'AuthController@logout');
	Route::post('refresh', 'AuthController@refresh')->name('refresh');
	Route::post('me', 'AuthController@me');
	/*
	Route::get('requerimiento/{requerimiento}', 'RequerimientoController@prueba');
	Route::post('requerimientos_lista', 'RequerimientoController@index');
	Route::get('requerimientos_lista', 'RequerimientoController@index');*/
});

Route::group(['middleware' => ['jwt.auth']], function () {

	Route::group([
		'prefix' => 'comun',
	], function () {
		Route::post('buscarproducto', 'pea\ProductoController@buscarProducto')->name('productos.buscar');
		Route::get('regionaleslist', 'comun\RegionalController@listado')->name('regionales.listado');
		Route::post('sitioslist', 'comun\SitioController@listado')->name('sitios.listado');
		Route::post('contratoslist', 'comun\ContratoController@listado')->name('contratos.listado');
		Route::post('buscarcontrato', 'comun\ContratoController@buscarContrato')->name('contratos.buscar');
		Route::post('buscarusers', 'UserController@buscarUser')->name('users.buscar');
		Route::get('listarusuarios', 'UserController@listarAll')->name('users.listar.all');
		Route::get('listaestadosbyprofile/{id}', 'ListasController@listarEstadosByPerfil')->name('listaritems.listar.estadosbyperfil');
		Route::get('listaById/{id}', 'ListasController@listaById')->name('listaritems.lista.ById');
		Route::get('listaestados', 'ListasController@estadosAll')->name('listar.estados.all');
		Route::get('odslista', 'ContratoController@contratosAll')->name('listar.contratos.all');

		Route::get('getcliente/{id}', 'comun\ClienteController@show')->name('cliente.show');
	});

	Route::group([
		'prefix' => 'imports',
	], function () {
		Route::get('importclientes/{id}', 'comun\ClienteController@importExcel')->name('clientes.import.excel');
	});

	Route::group([
		'prefix' => 'exports',
	], function () {
		Route::post('productos', 'pea\ProductoController@exportExcelProducto')->name('productos.export.excel');
	});	

	Route::group([
		'prefix' => 'admon',
	], function () {
		Route::post('userslist', 'UserController@listado')->name('users.listado');
		Route::post('usuario', 'UserController@store')->name('users.store');
		Route::put('usuario/{id}', 'UserController@update')->name('users.update');
		Route::get('usuario', 'UserController@usersTipoProducto')->name('users.tipo.productos');
		Route::get('usuariobyid/{id}', 'UserController@userById')->name('users.userbyid');
	});


	Route::group([
		'prefix' => 'pea',
	], function () {
		//Route::post('productoslist/{id}', 'pos\ProductoController@listado')->name('productos_listado');
		//Route::post('buscarproducto', 'pea\ProductoController@buscarProducto')->name('buscar_productoget');
		Route::post('tipoproductouserlist', 'pea\TipoProductoUserController@listado')->name('tipoproductouser.listado');
		Route::get('tipoproductouserlist', 'pea\TipoProductoUserController@listado')->name('tipoproductouser.listadoget');
		Route::get('tipoproductousers/{tipoproducto_id}', 'pea\TipoProductoUserController@tipoProductoByUser')->name('tipoproductobyuser');

		Route::get('tipoproductoslist', 'pea\TipoProductoController@buscarTipoProducto')->name('tipoproductos.buscar');
		Route::post('solicitudes', 'pea\ProductoRepsoController@listado')->name('productosrepso');
		Route::post('solicitud', 'pea\ProductoRepsoController@store')->name('producto.solicitud');
		Route::post('solicitudexist', 'pea\ProductoRepsoController@getExistProduct')->name('producto.getexist');
		Route::put('solicitud/{id}', 'pea\ProductoRepsoController@update')->name('productorepso.update');
		Route::get('solicitud/{id}', 'pea\ProductoRepsoController@show')->name('productosolicitud.show');
		Route::get('solicitud/statsbyid/{id}', 'pea\ProductoRepsoController@statsById')->name('productosolicitud.statsbyid');

		// Rutas de Productos
		Route::put('updateproducto/{id}', 'pea\ProductoController@update')->name('productos.update');
		Route::post('createproducto', 'pea\ProductoController@store')->name('productos.create');
		Route::post('productobyrepsoid/{id}', 'pea\ProductoController@productsByProductRepso')->name('productosbyidrepso');
		Route::post('productosprocesarcargue/{id}', 'pea\ProductoController@ImportClientesByProductoRepso')->name('import.clientesbyproductorepso');



		Route::put('productoupdategestion/{id}', 'pea\ProductoController@productoUpdateGestion')->name('producto.gestion.update');
		Route::put('productocancelstate/{id}', 'pea\ProductoController@productoCancelState')->name('producto.cancel');
		Route::delete('productodelete/{id}', 'pea\ProductoController@destroy')->name('producto.destroy');
		Route::post('productoReasignarPersona/{id}', 'pea\ProductoController@productoReasignarPersona')->name('producto.reasignarPersona');

		Route::post('comentarios', 'pea\ComentarioController@store')->name('comentario.store');
		Route::get('comentariosbyproductoid/{id}', 'pea\ComentarioController@comentariosByProductoId')->name('comentario.byproductoid');

		/*rutyas de agenda */
		Route::post('agenda/profesionalagenda/{id}', 'pea\AgendaController@show')->name('agenda.show');
		Route::post('agenda/profesional/{id}', 'pea\AgendaController@store')->name('agenda.store');
		Route::put('agenda/cita/{id}', 'pea\AgendaController@update')->name('agenda.update');
		Route::post('agenda/agendadisponible', 'pea\AgendaController@enableAgenda')->name('agenda.enable');


		Route::post('cita', 'pea\CitaController@store')->name('cita.store');
		Route::post('countcitasbyprofesional', 'pea\CitaController@citasbyprofesional')->name('cita.citasvyprofesional');
	});
});