import { Injectable, TemplateRef  } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: any[] = [];
  iconInfo = '<i class="fa fa-info-circle fa-2x"></i>';
  iconSuccess = '<i class="fa fa-check fa-2x"></i>';
  iconError =   '<i class="fa fa-close fa-2x"></i>';
  iconWarning =   '<i class="fa fa-warning fa-2x"></i>';

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }
  success(textOrTpl: string, options: any = { classname: 'bg-success text-light', delay: 5000 }) {
    textOrTpl = this.iconSuccess+' '+textOrTpl;
    this.toasts.push({ textOrTpl, ...options });
  }
  danger(textOrTpl: string, options: any = { classname: 'bg-danger text-light', delay: 5000 }) {
    textOrTpl = this.iconError+' '+textOrTpl;
    this.toasts.push({ textOrTpl, ...options });
  }
  info(textOrTpl: string, options: any = { classname: 'bg-info text-light', delay: 5000 }) {
    textOrTpl = this.iconInfo+' '+textOrTpl;
    this.toasts.push({ textOrTpl, ...options });
  }
  warning(textOrTpl: string, options: any = { classname: 'bg-warning text-light', delay: 5000 }) {
    textOrTpl = this.iconWarning+' '+textOrTpl;
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
  
  errorMessage(errors){
   let message = '';
   let inputsError = Object.keys(errors);
 	 inputsError.forEach(function(item){
		for(let i = 0; i < errors[item].length; i++){
			message = message + errors[item][i] + '</p>';
		}
 	 });
	return message;  
  }
}
