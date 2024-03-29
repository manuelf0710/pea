<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

//Auth::routes();

Route::get('/', 'AngularController@index')->name('inicio');
Route::get('/home', 'AngularController@index')->name('home');
Route::get('/test', 'HomeController@test')->name('testHoras');
Route::get('/reporteproductos', 'pea\ProductoController@exportExcelProducto')->name('reporteproductos.excel');
Route::any('/{any}', 'AngularController@index')->where('any', '^(?!api).*$');