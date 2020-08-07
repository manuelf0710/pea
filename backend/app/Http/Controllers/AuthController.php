<?php
namespace App\Http\Controllers;
use Tymon\JWTAuth\Facades\JWTAuth;  /* or */
//use JWTAuth;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login','refresh']]);
        //$this->middleware('jwt.refresh', ['only' => ['refresh']]);
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
       
        $response = array("token" => $this->respondWithToken($token),
                         "data" => array("modulos" => "")
    	);

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
            'user' => auth()->user(),
        ]);
    }
}