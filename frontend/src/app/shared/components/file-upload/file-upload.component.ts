import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  //@Input() url = null;
  @Input() multiple = false; /* controlar tipo single o multuple propiedad del input tipo file */
  @Input() document_type = 'archivos'; /* type document cotizacion, orden, factura etc... */
  @Input() comment = null;
  @Input() title = 'Cargador Archivos'; /*Titulo por defecto de el cargador de archivos */
  @Input() data = {}; /* Datos extra para subir con los archivos para procesar */
  @Input() fk_key = null; /* llave foranea a la que se asocia el documento  */
  @Input() accept_files_extension = []; /*Extensiones validas del cargador */
  @Input() max_size:number = 0;/* Tamaño maximo de los archivos numero entero equivalente a MB */
  @Input() autoupload = false; /* subia automatica de archivos */
  @Input() url2:string=null; /*Url de entrada si se desea una url custom */
  @Output() ArchivosCargados: EventEmitter<Object>; /*Evento que emite los archivos exitosos */
  public archivos:any[] = []; /* array de archivos subidos se envia en el emit*/
  public archivos_count:any[] = []; /*para validar repetidos */
  //public urlapi:string = 'http://localhost/archivossubir/'; /*Url por defecto del cargador */
  public urlapi:string = environment.apiUrl+'/files/uploads'; /*Url por defecto del cargador */

  error_archivos:boolean = false; /* variable de control para validaciones de extensiones, tamaño y otras */
  elementos_borrados: string[] = []; /*elementos borrados de la seleccion porque no pasan las validaciones */
  
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  constructor (){
    console.log(environment);
    let uri_files:string = this.urlapi;
    this.uploader = new FileUploader({
      url: uri_files,
      isHTML5: true,
      method:'post',
      //headers: [{ name: 'Authorization', value: 'Bearer '+ localStorage.getItem('token') }],
    });
    
    //console.log(this.uploader);
    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
    this.response = '';
    this.uploader.response.subscribe( res => this.response = res );
    this.ArchivosCargados = new EventEmitter();
  }

  obtenerArchivos(){ /*function test */
    this.ArchivosCargados.emit(this.archivos);
  }

  ngOnInit() {
      this.uploader.onCompleteAll = () => {
        //this.ArchivosCargados.emit(this.archivos);
        //console.log(this.archivos);
        console.log("por aqui");
    }; 
    this.uploader.onBuildItemForm = (item, form) => {
      form.append('fk_key', this.fk_key);
      form.append('extra_data', this.data);
      form.append('document_type', this.document_type);
    };    
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers:any)=>  {
      let respuesta = JSON.parse(response);
      //item.file.name = respuesta.file;
      if(this.multiple){
        this.archivos.push({name:item.file.name, path:respuesta.url, rename:respuesta.file, data:respuesta});
      }else{
        this.archivos = [];
        this.archivos.push({name:item.file.name, path:respuesta.url, rename:respuesta.file, data:respuesta});
      }
      this.ArchivosCargados.emit(this.archivos);
    };
    if(this.autoupload){
      this.uploader.setOptions({autoUpload: this.autoupload});
    }
    if(this.url2 != null){
      this.uploader.setOptions({ url: this.url2});    
    }
    //this.uploader.setOptions({ url: this.url2, autoUpload: this.autoupload});    
  }

  ngAfterViewInit() {
    this.uploader.onAfterAddingFile = (item => {
      item.withCredentials = false;
    });
  }  

  onFileSelected(evento: any) {
    this.validarArchivos();
    if (!this.multiple) { //single
      while (this.uploader.queue.length > 1) {
        this.uploader.queue[0].remove();
    }       
    } else { // multiple
       
    } 
    if(this.autoupload && this.uploader.queue.length > 0){
     //this.uploader.uploadAll(); 
    }
}

getFiles(){ /*function test */
  console.log(this.uploader.queue);
  this.validarRepetido();
}
echoFiles(){ /* function test */
  console.log(this.uploader.queue);
}

public SubirArchivos(){
  if (this.uploader.queue.length > 0) {
    this.validarArchivos();
    /*this.uploader.onBuildItemForm = (item, form) => {
      form.append('fk_key', this.fk_key);
      form.append('extra_data', this.data);
      form.append('document_type', this.document_type);
    }; */
    this.uploader.uploadAll();
  }
}

validarArchivos(){
  this.elementos_borrados = [];
  this.validarSize();
  this.validarExtension();
  this.validarRepetido();
}

getContadores(){
  let retorno = [];
  for(let j = 0; j < this.uploader.queue.length; j++){
    let repetido = 0;
    let add_retorno = true;
    for(let k = 0; k < this.uploader.queue.length; k++){
      if(this.uploader.queue[j].file.name == this.uploader.queue[k].file.name){
        repetido++;       
      }
      for( let s = 0; s < retorno.length; s++){
        if(retorno[s].name == this.uploader.queue[j].file.name && add_retorno == true) {
          add_retorno = false;
        }
      }
    }
    if(add_retorno == true){
      retorno.push({name: this.uploader.queue[j].file.name, contador: repetido});    
    }
  }

  for(let j = 0; j < retorno.length; j++){
    let items_eliminar = retorno[j].contador-1;
    //console.log("items a eliminar antes del while",items_eliminar);
    //console.log("file name ",retorno[j].name+" items a eliminar "+items_eliminar);
    while(items_eliminar >= 1){ //console.log("entra while");
      for(let k = this.uploader.queue.length-1; k >= 0; k--){
        //console.log("items a eliminar for ", items_eliminar);
        if(items_eliminar >= 1){
          //console.log("entra en el if items_eliminar ",items_eliminar);
          if(retorno[j].name == this.uploader.queue[k].file.name){
            //console.log("se elimina ", this.uploader.queue[k].file.name);
            this.uploader.queue[k].remove();
            items_eliminar--;
          }

        }
      }
    }
  }

  return retorno;
}


validarRepetido(){
  //let archivos_count:any[] = [];
  this.archivos_count = this.getContadores()
}
validarExtension(){
  let error = false;
  let permitido = false;
  if(this.accept_files_extension.length > 0){
    for(let j = this.uploader.queue.length-1; j >= 0; j--){
     permitido = false;
      if (this.uploader.queue[j].file.name) {
        var ext = this.uploader.queue[j].file.name.split('.').pop();
        for(let k = this.accept_files_extension.length-1; k >= 0; k--){
          if(ext == this.accept_files_extension[k]){
            permitido = true;
            error = true;
          }
        }
      }

      if(permitido == false){
        this.uploader.queue[j].remove();
      }      

    }

    if(error){
      //alert('solo se permiten archivos con extensiones '+this.accept_files_extension.toString());
    }
  }
}
validarSize(){
  let error = false; 
  if(this.max_size > 0){
    for(let j = this.uploader.queue.length-1; j >= 0; j--){
      if (this.uploader.queue[j].file.size > (this.max_size * 1000 * 1000)) {
        this.uploader.queue[j].remove();
        if(!error){
          error = true;
        }
      }
    }
    if(error){
      alert('los archivos con tamaño superior a '+this.max_size+' megas no son permitidos');
    }
  }
}

  public fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
    if (!e) { 
        if (!this.multiple) { 
            while (this.uploader.queue.length > 1) {
                this.uploader.queue[0].remove();
            }
            this.validarArchivos();
        } else {
            this.validarArchivos();
        }
    }

  }  

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }

}