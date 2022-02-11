import { Component, OnInit, TemplateRef } from '@angular/core';
import { ToastService } from './../../services/toast.service';

@Component({
  selector: 'app-toasts-container',
  templateUrl: './toasts-container.html',
  styleUrls: [],
  host: {'[class.ngb-toasts]': 'true'}
})
export class ToastsContainerComponent implements OnInit {

  constructor(public toastService: ToastService) { }

  isTemplate(toast) { return toast.textOrTpl instanceof TemplateRef; }
  ngOnInit(): void {
  }

}
