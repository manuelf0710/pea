import { Component, Injectable, Directive, TemplateRef, Input, Host } from '@angular/core';
import { NgForOf } from '@angular/common';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
//import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: "[ngForTrackByField]",
})
export class NgForTrackByIdDirective<T> {
  
  @Input()
  public ngForTrackByField: keyof T;

  constructor(@Host() private ngFor: NgForOf<T>) {
    this.ngFor.ngForTrackBy = (index: number, item: T) => {
      if (this.ngForTrackByField) {
        return item[this.ngForTrackByField];
      }
  
      return item;
    };
  }
  
}

/**
 * Options passed when opening a confirmation modal
 */
interface ConfirmOptions {
    title: string,  
    message: string
  }
  @Injectable({ providedIn: 'root' })
  export class ConfirmState {
    options: ConfirmOptions;
    modal: NgbModalRef;
    template: TemplateRef<any>;
  }


@Injectable({ providedIn: 'root' })
export class UtilService {
    constructor(private router: Router, private modalService: NgbModal, private state: ConfirmState) {

     }
     confirm(options: ConfirmOptions): Promise<any> {
        this.state.options = options;
        //this.state.modal = this.modalService.open(this.state.template);
        //this.state.modal = this.modalService.open(ConfirmModalComponent,{ centered: true});
        this.state.modal = this.modalService.open(ConfirmModalComponent);
        return this.state.modal.result;
      }     

    goTo(url) {
        this.router.navigate([url]);
    }
    dosDecimales(num, fixed) {
      fixed = fixed || 0;
      fixed = Math.pow(10, fixed);
      return Math.floor(num * fixed) / fixed;
    }
}

@Component({
    selector: 'confirm-modal-component',
    template: `
    <div class="modal-header">
      <h4 class="modal-title "><b>{{ options.title}}</b></h4>
      <button type="button" class="close " aria-label="Close" (click)="no()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p style="font-size:1.2rem">
      {{ options.message }}
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-danger" (click)="yes()">Aceptar <i class="fa fa-check"></i></button>
      <button type="button" class="btn btn-secondary" (click)="no()">Cancelar <i class="fa fa-ban"></i></button>
    </div>
    `
  })
  export class ConfirmModalComponent {
  
    options: ConfirmOptions;
  
    constructor(private state: ConfirmState) {
      this.options = state.options;
    }
  
    yes() {
      this.state.modal.close('confirmed');
    }
  
    no() {
      this.state.modal.dismiss('not confirmed');
    }
  }
  /*
   `<template confirm>
       <confirm-modal-component></confirm-modal-component>
   </template>`*/
  @Directive({
    selector: "template[confirm]"
  })
  export class ConfirmTemplateDirective {
    constructor(confirmTemplate: TemplateRef<any>, state: ConfirmState) {
      state.template = confirmTemplate;
    }
  }
