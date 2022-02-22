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
		Route::post('buscarproducto', 'pea\ProductoController@buscarProducto')->name('buscar_producto');
		Route::get('regionaleslist', 'comun\RegionalController@listado')->name('regionales_listado');
		Route::post('sitioslist', 'comun\SitioController@listado')->name('sitios_listado');
		Route::post('contratoslist', 'comun\ContratoController@listado')->name('contratos_listado');
		Route::post('buscarcontrato', 'comun\ContratoController@buscarContrato')->name('buscarcontrato');

		Route::get('getcliente/{id}', 'comun\ClienteController@show')->name('clienteshow');
	});

	Route::group([
		'prefix' => 'pea',
	], function () {
		//Route::post('productoslist', 'pos\ProductoController@listado')->name('productos_listado');
		//Route::post('buscarproducto', 'pea\ProductoController@buscarProducto')->name('buscar_productoget');
		Route::post('tipoproductouserlist', 'pea\TipoProductoUserController@listado')->name('tipoproductouser_listado');
		Route::get('tipoproductouserlist', 'pea\TipoProductoUserController@listado')->name('tipoproductouser_listadoget');
		Route::get('tipoproductousers/{tipoproducto_id}', 'pea\TipoProductoUserController@tipoProductoByUser')->name('tipoproductobyuser');

		Route::get('tipoproductoslist', 'pea\TipoProductoController@buscarTipoProducto')->name('buscar_tipoproducto');
		Route::post('solicitudes', 'pea\ProductoRepsoController@listado')->name('productosrepso');
		Route::post('solicitud', 'pea\ProductoRepsoController@store')->name('productosolicitud');
		Route::get('solicitud/{id}', 'pea\ProductoRepsoController@show')->name('productosolicitudshow');

		// Rutas de Productos
		Route::put('updateproducto/{id}', 'pea\ProductoController@update')->name('productoupdate');
		Route::post('productobyrepsoid/{id}', 'pea\ProductoController@productsByProductRepso')->name('productosbyidrepso');
	});
});
