<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Perfil;
use App\User;
use App\Models\pea\TipoProducto;
use App\Models\pea\TipoProductoUser;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Auth;
use DataTables;

use function PHPSTORM_META\map;

class UserController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		//$this->middleware('auth');
	}
	/**
	 * Show the application dashboard.
	 *
	 * @return \Illuminate\Contracts\Support\Renderable
	 */

	public function listarAll(Request $request)
	{
		$profile = $request->post('profile');

		$productos = User::withoutTrashed()
			->select('id', 'name as nombre')
			->where("status", "=", "1")
			->profile($profile)
			->get();
		return response()->json($productos);
	}

	public function listado(Request $request)
	{
		$pageSize = $request->get('pageSize');
		$pageSize == '' ? $pageSize = 20 : $pageSize;

		$nombre = $request->get('name');
		$perfil_id = $request->get('perfil_id');
		$cedula = $request->get('cedula');
		$globalSearch = $request->get('globalsearch');

		if ($globalSearch != '') {
			$users = DB::table('users')
				->join('perfiles', 'users.perfil_id', '=', 'perfiles.id')
				->select('users.id', 'users.name', 'users.email', 'users.perfil_id', 'users.cedula', 'users.status', 'perfiles.nombre as perfil')
				->addSelect(DB::raw('case users.status when 1 then "Activo" else "Inactivo" end status_des'))
				->where('users.status', '=', 1)
				->whereNull('users.deleted_at')
				->paginate($pageSize);
		} else {
			$users = DB::table('users')
				->join('perfiles', 'users.perfil_id', '=', 'perfiles.id')
				->select('users.id', 'users.name', 'users.email', 'users.perfil_id', 'users.cedula', 'users.status', 'perfiles.nombre as perfil')
				->addSelect(DB::raw('case users.status when 1 then "Activo" else "Inactivo" end status_des'))
				//->where('users.status', '=', 1)
				->whereNull('users.deleted_at')
				//->Nombre($nombre)
				->paginate($pageSize);
		}
		return response()->json($users);
	}


	public function buscarUser(Request $request)
	{

		$profile = $request->get('profile') ? $request->get('profile') : '';

		$productos = User::withoutTrashed()
			->select('id', 'name as nombre')
			->where("name", "like", "%" . $request->post('globalsearch') . "%")
			->where("status", "=", "1")
			->profile($profile)
			->take(20)
			->get();
		return response()->json($productos);
	}


	public function index(Request $request)
	{
	}

	public function show(Request $request)
	{
	}

	function getOneUserById($id){
		$users = DB::table('users')
		->join('perfiles', 'users.perfil_id', '=', 'perfiles.id')
		->select('users.id', 'users.name', 'users.email', 'users.perfil_id', 'users.cedula', 'users.status', 'perfiles.nombre as perfil')
		->addSelect(DB::raw('case users.status when 1 then "Activo" else "Inactivo" end status_des'))
		->where('users.id', '=', $id)
		->whereNull('users.deleted_at')
		->first();
		return $users;
	}


	public function store(Request $request)
	{

		
		$name = $request->post('name');
		$email = $request->post('email');
		$password = $request->post('password');
		$password_confirmation = $request->post('password_confirmation');
		$perfil_id = $request->post('perfil_id');
		$cedula = $request->post('cedula');

		$rules = [
        	'name' => 'required | min:6 | max: 191',
            'cedula' => 'required|numeric',
			'email' => ['required', 'string', 'email', 'max:255', 'unique:users','required_with:confirmar_email','same:confirmar_email'],
			'confirmar_email' => ['max:255'],
            'perfil_id' => 'required|numeric',
        	'password' => 'required| min:6| max:30 |confirmed',
			'password_confirmation' => 'required| min:6'
    	];		


		
		$validator = Validator::make($request->all(), $rules);
		

		if (!($validator->fails())) {
			$user = new User();
			$user->name = $name;
			$user->email = $email;
			$user->password = Hash::make($password);
			;
			$user->perfil_id = $perfil_id;
			$user->cedula = $cedula;
			$user->save();
			if($request->post('tipoProductosLista')){
				$this->saveTipoProductosUser($request->post('tipoProductosLista'), $user->id);	
			}			
			$response = array(
				'status' => 'ok',
				'code' => 200,
				'data'   => $this->getOneUserById($user->id),
				'msg'    => 'Guardado'
			);
		} else {
			$response = array(
				'status' => 'error',
				'msg' => $validator->errors(),
				'validator' => $validator
			);
		}

		return response()->json($response);
	}

	public function editForAdmin($id)
	{
	}

	public function usersTipoProducto(Request $request)
	{
		$user_id = $request->post('user_id');

        $productos = TipoProducto::withoutTrashed()
            ->select('tipo_productos.id as id', 'tipo_productos.name as name')
			->selectRaw("( select tipoproducto_users.id total_productos from tipoproducto_users where tipoproducto_users.tipoproducto_id = tipo_productos.id 
				and tipoproducto_users.user_id ='" . $user_id . "') as consecutivo")
			->selectRaw("( select tipoproducto_users.id total_productos from tipoproducto_users where tipoproducto_users.tipoproducto_id = tipo_productos.id 
				and tipoproducto_users.user_id ='" . $user_id . "' and tipoproducto_users.deleted_at is null) as marcado")
			->whereNull('tipo_productos.deleted_at')
            ->get();
        return response()->json($productos);		
	}


	public function edit($id)
	{
		/*
		* get model Results
		*/
		$user = User::with('perfil')->find($id);
	}

	public function updateForAdmin(Request $request, $id)
	{

		$reglas = [
			'name' => 'required | min:6 | max: 191',
			//'fecha_nacimiento' => 'required|date',
			'tipo_identificacion' => 'required|numeric',
			'celular' => 'required|numeric',
			'identificacion' => 'required|numeric',
			'ingreso' => 'required|numeric',
			'genero' => 'required',
			'empresa' => 'required',
			'ingreso' => 'required'
			//'email' => 'required | min:6 | max: 191',
		];

		$modelo = User::find($id);

		$inputs = request()->validate($reglas);

		/*
			* Verificar que se haya encontrado data, a este punto llega solo si paso validaciones
			*/
		if (!empty($modelo)) {

			/*
				* almacenar modelo cuando viene la contaseña
				*
				*/

			$modelo->name = $request->post('name');

			$modelo->celular = $request->post('celular');
			$modelo->tipo_identificacion = $request->post('tipo_identificacion');
			$modelo->ingreso = $request->post('ingreso');
			$modelo->stars = $request->post('stars');
			$modelo->empresa = $request->post('empresa') == '' ? NULL : $request->post('empresa');

			$modelo->save();
		} else {
		}
	}

	function saveTipoProductosUser($tipoProductosLista, $id){
			//$algoModificado = false;
			foreach($tipoProductosLista as $item){
				if(isset($item['modificado']) &&($item['modificado'] == false ||  $item['modificado'] ==  true)){
					//$algoModificado = true;
					if($item['consecutivo'] == null){ //new item
						$tipoProductoUser = new TipoProductoUser();
						$tipoProductoUser->tipoproducto_id = $item['id'];
						$tipoProductoUser->user_id = $id;
						$tipoProductoUser->save();
					}else{ //update item
						
						if($item['modificado'] == false){
							$tipoProductoUser = TipoProductoUser::find($item['consecutivo']);
							$tipoProductoUser->delete();
						}else{
							DB::table('tipoproducto_users')
							->where('id', '=', $item['consecutivo'])
							->update(['deleted_at' => null]);
						}
					}
					
						
						
				}
			}
	}

	public function update(Request $request, $id)
	{ //echo json_encode($request->post('tipoProductosLista'));

	
		/*
		* Reglas iniciales de validación
		*/
		$reglas = [
			'name' => 'required | min:6 | max: 191',
			'cedula' => 'required|numeric',
			'perfil_id' => 'required|numeric',
		];


		/*
		* Buscar el registro
		*/

		$modelo = User::find($id);
		/*
		*
		* Verificar que el campo contraseña tenga valor en los datos post
		*
		*/

		if ($request->post('password') != NULL && $request->post('password') != '') {
			/*
			* Agregar las reglas de password a @var $reglas
			*/

			$reglas = array_merge($reglas, [
				'password' => 'required| min:6| max:30 |confirmed',
				'password_confirmation' => 'required| min:6'
			]);


			$modelo->password = Hash::make($request->post('password'));
		}

		$validator = Validator::make($request->all(), $reglas);
		/*
			* Verificar que se haya encontrado data, a este punto llega solo si paso validaciones
			*/

		if (!($validator->fails())) {
			$modelo->name = $request->post('name');
			$modelo->perfil_id = $request->post('perfil_id');
			$modelo->cedula = $request->post('cedula');

			$modelo->save();

			if($request->post('tipoProductosLista')){
				$this->saveTipoProductosUser($request->post('tipoProductosLista'), $id);	
			}			

			$response = array(
				'status' => 'ok',
				'code' => 200,
				'data'   => $this->getOneUserById($id),
				'msg'    => 'Actualizado'
			);
		} else {
			$response = array(
				'status' => 'error',
				'msg' => $validator->errors(),
				'validator' => $validator
			);
		}

		return response()->json($response);
	}










	public function destroy($id)
	{
	}
}