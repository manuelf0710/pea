<?php
namespace App\Http\Controllers;
use Tymon\JWTAuth\Facades\JWTAuth;  /* or */
//use JWTAuth;
use App\Models\Modulo; /* entitie model */
use App\Models\LinkModulo; /* entitie model */
use App\User; /* entitie model */
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login','refresh']]);
        //$this->middleware('jwt.refresh', ['only' => ['refresh']]);
    }
	
	public function getSubLinks($id_link){
		$response = [];
		$response = LinkModulo::withoutTrashed()->where('padre',  $id_link)->where('estado', 1)->get();
		return $response;
	}	
	
	public function getLinksModulo($id_modulo){
		$response = [];
		$response = LinkModulo::withoutTrashed()->where('modulo',  $id_modulo)->where('estado', 1)->whereNull('padre')->get();
		$i=0;
		foreach($response  as $link){
			$heading = false;
			$response[$i]['hijos'] = $this->getSubLinks($link->id);
			$contador = count($response[$i]['hijos']);
			$response[$i]['heading'] = $contador > 0 ? true : false; 
			$i++;
		}		
		
		return $response;
	}
	
	public function getSubLinksByPerfilAndUser($id_link){
		$response = [];
		//$response = LinkModulo::withoutTrashed()->where('padre',  $id_link)->where('estado', 1)->get();
		
		$link_modulos = DB::table('link_modulos')
						  ->join('link_perfiles', 'link_modulos.id', '=', 'link_perfiles.link_id')
						  ->select('link_modulos.id', 'link_modulos.modulo', 'link_modulos.page', 
						  'link_modulos.url', 'link_modulos.estado', 'link_modulos.padre')
						  ->where('link_perfiles.perfil_id', auth()->user()->perfil_id)
						  ->where('link_modulos.padre', '=', $id_link)
						  ->where('link_modulos.estado', 1)
						  ->where('link_perfiles.estado', 1);

			$response = DB::table('link_modulos')
						  ->join('link_users', 'link_modulos.id', '=', 'link_users.link_id')
						  ->select('link_modulos.id', 'link_modulos.modulo', 'link_modulos.page', 
						  'link_modulos.url', 'link_modulos.estado', 'link_modulos.padre')
						  ->where('link_users.usuario_id', auth()->user()->id)
						  ->where('link_modulos.padre', '=', $id_link)
						  ->where('link_modulos.estado', 1)
						  ->where('link_users.estado', 1)
						  ->union($link_modulos)->get();
		
		return $response;
	}	
	

    public function getLinksModuloByPerfilAndUser($id_modulo){
		$response = [];
		//$response = LinkModulo::withoutTrashed()->where('modulo',  $id_modulo)->where('estado', 1)->whereNull('padre')->get();
		
		$link_modulos = DB::table('link_modulos')
						  ->join('link_perfiles', 'link_modulos.id', '=', 'link_perfiles.link_id')
						  ->select('link_modulos.id', 'link_modulos.modulo', 'link_modulos.page', 
						  'link_modulos.url', 'link_modulos.estado', 'link_modulos.padre')
						  ->where('link_perfiles.perfil_id', auth()->user()->perfil_id)
						  ->whereNull('link_modulos.padre')
						  ->where('link_modulos.modulo', '=', $id_modulo)
						  ->where('link_modulos.estado', 1)
						  ->where('link_perfiles.estado', 1);
						  
		$response = DB::table('link_modulos')
						  ->join('link_users', 'link_modulos.id', '=', 'link_users.link_id')
						  ->select('link_modulos.id', 'link_modulos.modulo', 'link_modulos.page', 
						  'link_modulos.url', 'link_modulos.estado', 'link_modulos.padre')
						  ->where('link_users.usuario_id', auth()->user()->id)
						  ->whereNull('link_modulos.padre')
						  ->where('link_modulos.modulo', '=', $id_modulo)
						  ->where('link_modulos.estado', 1)
						  ->where('link_users.estado', 1)
						  ->union($link_modulos)->get();						  
						  
		
		$i=0;
		foreach($response  as $link){
			$heading = false;
			$response[$i]->hijos = $this->getSubLinksByPerfilAndUser($link->id);
			$contador = count($response[$i]->hijos);
			$response[$i]->heading = $contador > 0 ? true : false; 
			$i++;
		}		
		
		return $response;		
	}	
	
	/*
	* obtener todos los modulos links del aplicativo
	*
	*/
	public function	allAccess($token){
		$modulos =  Modulo::withoutTrashed()->where('estado',  1)->get();
		$i=0;
		foreach($modulos  as $modu){
			$modulos[$i]['pages_menu'] = $this->getLinksModulo($modu->id);
			$contador = count($modulos[$i]['pages_menu']);
			$i++;
		}
		
		$response = array("token" => $this->respondWithToken($token),
						 "data" => array("modulos" => $modulos)
		);
		return $response;
	}
	
	public function ConfigurableAccess($token){
			$modulosperfil = DB::table('modulos')
								->join('modulo_perfiles', 'modulos.id', '=', 'modulo_perfiles.modulo_id')
								->select('modulos.id', 'modulos.nombre', 'modulos.descripcion', 'modulos.estado', 'modulos.icon', 'modulos.img', 'modulos.url')
								->where('modulo_perfiles.perfil_id',  auth()->user()->perfil_id)
								->where('modulo_perfiles.estado',  1)
								->where('modulos.estado', '=', 1)
								->whereNull('modulo_perfiles.deleted_at')
								->whereNull('modulos.deleted_at');
								
			$modulos = DB::table('modulos')
								->join('modulo_users', 'modulos.id', '=', 'modulo_users.modulo_id')
								->select('modulos.id', 'modulos.nombre', 'modulos.descripcion', 'modulos.estado', 'modulos.icon', 'modulos.img', 'modulos.url')
								->where('modulo_users.usuario_id',  auth()->user()->id)
								->where('modulo_users.estado',  1)
								->where('modulos.estado', '=', 1)
								->whereNull('modulo_users.deleted_at')
								->whereNull('modulos.deleted_at')
								->union($modulosperfil)->get();
								
		$i=0;
		foreach($modulos  as $modu){
			$modulos[$i]->pages_menu = $this->getLinksModuloByPerfilAndUser($modu->id);
			$contador = count($modulos[$i]->pages_menu);
			$i++;
		}

		//return response()->json($modulos);
		
		$response = array("token" => $this->respondWithToken($token),
						 "data" => array("modulos" => $modulos)
		);
		return $response;		
		
	}
	
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {
        $credentials = request(['email', 'password']);
        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
       /*echo json_encode(auth()->user());
       echo json_encode($this->respondWithToken($token));*/
	   $response = array();
	   if(auth()->user()->privilegios == '1'){
		  
			$response = $this->allAccess($token);		
		
	   }else{
		   
		   $response = $this->ConfigurableAccess($token);
		   
	   }	   
        //return $this->respondWithToken($token);
        return response()->json($response);
    }
    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }
    public function payload()
    {
        return response()->json(auth()->payload());
    }
    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }
    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
		/*$current_token  = JWTAuth::getToken();
        $token          = JWTAuth::refresh($current_token);*/
		$token = \Auth::guard('api')->refresh();
    	return ['token' => $token];
		return $this->respondWithToken(auth()->refresh());
    }
    /**
     * Get the token array structure.
     *
     * @param string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => User::with('perfil')->find(auth()->user()->id),
        ]);
    }
}