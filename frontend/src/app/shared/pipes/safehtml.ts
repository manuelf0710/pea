import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'sanitizeHtml'})

export class sanitizeHtmlPipe {
    constructor(private sanitizer:DomSanitizer){}
  
    transform(style) {
      return this.sanitizer.bypassSecurityTrustHtml(style);
      //return this.sanitizer.bypassSecurityTrustStyle(style);
      // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
    }
  }