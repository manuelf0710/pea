import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tablevalue'
})
export class TablevaluePipe implements PipeTransform {

  transform(item: [], column: any): string {
  //console.log("la columna ",column)
   let parte = column.data.split('.');
    let result:any = ''; //obtener el string del campo
    let temporal:any = ''; //valor temporal del almacenamiento 
    if(parte.length > 1){
      
      let record = []; // valor de registro final
      for(let i=0; i <= parte.length; i++){
        if(result == ''){
          temporal = item[parte[i]];
          result = temporal;
        }else{
          if(typeof(result) == 'object'){
            temporal = result[parte[i]];
            result = temporal;
          }
        }
      }
      //console.log("el result ", temporal);
    }else{
      result = item[parte[0]];
    }
    //this.counter++;
    //console.log("llamando funcion ", item['id']);    
    return result;

  }

}
