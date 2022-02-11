<?php
namespace App\Http\Controllers;
use Tymon\JWTAuth\Facades\JWTAuth;  /* or */
//use JWTAuth;
use App\Models\Modulo; /* entitie model */
use App\Models\LinkModulo; /* entitie model */
use App\User; /* entitie model */
use Illuminate\Foundation\Auth\AuthenticatesUsers;
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
	   $modulos =  Modulo::withoutTrashed()->where('estado',  1)->get();
        $response = array("token" => $this->respondWithToken($token),
                         "data" => array("modulos" => $modulos)
    	);
		$i=0;
		foreach($modulos  as $modu){
			$modulos[$i]['pages_menu'] = $this->getLinksModulo($modu->id);
			$contador = count($modulos[$i]['pages_menu']);
			$i++;
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