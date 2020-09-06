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
		
	});
	
	Route::group([
    'prefix' => 'pea',
	], function () {
		//Route::post('productoslist', 'pos\ProductoController@listado')->name('productos_listado');
		//Route::post('buscarproducto', 'pea\ProductoController@buscarProducto')->name('buscar_productoget');
	});
});
