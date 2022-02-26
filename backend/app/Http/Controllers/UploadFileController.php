<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadFileController extends Controller
{
	public function index()
	{
	}

	public function createDirectory($root_path, $tipo_documento)
	{
		$include_hour = false;
		$include_minutes = false;
		$include_segundos = false;
		$year = date("Y");
		$month = date("m");
		$day = date("d");
		$hour = date("H");
		$minutos = date("i");
		$segundos = date("s");
		//The folder path for our file should be YYYY/MM/DD
		$directory_date = "/$tipo_documento/$year/$month/$day";
		if ($include_hour) {
			$directory_date = "/$tipo_documento/$year/$month/$day/$hour";
		}
		if ($include_minutes) {
			$directory_date = "/$tipo_documento/$year/$month/$day/$hour/$minutos";
		}
		if ($include_segundos) {
			$directory_date = "/$tipo_documento/$year/$month/$day/$hour/$minutos/$segundos";
		}

		$full_directory = $root_path . $directory_date;
		if (!is_dir($full_directory)) {
			mkdir($full_directory, 755, true);
		}

		return $directory_date;
	}

	public function store(Request $request)
	{
		$response = array();
		$server_url = env("APP_URL");
		//$server_url = 'http://localhost/';	
		//$directory_root = base_path().'\public\uploads\\'; /*directory root file uploads*/		
		$directory_root = public_path() . env("APP_UPLOADS"); /*directory root file uploads*/
		//$datos = $request->all();
		//$tipo_documento = $datos['document_type'];
		$tipo_documento = $request->document_type;
		$file_original_name = $request->file;

		$getDirectory = $this->createDirectory($directory_root, $tipo_documento);
		$upload_dir = 'uploads' . $getDirectory;

		$aleatorio = rand(1000, 1000000);
		$path = $_FILES['file']['name'];
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		$random_name = date("Ymd_His") . '_' . $tipo_documento . '_' . $aleatorio . '.' . $ext;
		$upload_name = $upload_dir . '/' . strtolower($random_name);

		if ($request->file) {
			//$is_uploaded = Storage::disk('public')->put('/uploads'.$getDirectory, $request->file);
			//$is_uploaded = Storage::disk('public')->putFileAs($upload_dir, $request->file, $random_name);
			$is_uploaded = $file_original_name->move(public_path() . '/uploads/' . $getDirectory, $random_name);
		}
		//$is_uploaded = $file_original_name->move(public_path().'/uploads/'.$getDirectory, $random_name);
		if ($is_uploaded) {
			$response = array(
				"status" => "success",
				"error" => false,
				"message" => "File uploaded successfully",
				"url" => $upload_name,
				"full_url" => $server_url . '/' . $is_uploaded,
				"file" => $upload_name,
			);
		} else {
			$response = array(
				"status" => "error",
				"error" => true,
				"message" => "Error uploading the file!"
			);
		}
		//echo json_encode($response);
		return response()->json($response);
	}
}
