import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthenticationService } from "./../../auth/services/authentication.service";
import { ToastService } from "src/app/shared/services/toast.service";
import { environment } from "src/environments/environment";
import { User } from "./../../auth/models/user";
import { ProfileComponent } from "src/app/admon/profile/profile.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  currentUser: User;
  @Input() inputSideNav: any;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private _ToastService: ToastService,
    private modalService: NgbModal
  ) {
    this.authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
  }

  ngOnInit() {}

  logout() {
    this.inputSideNav.close();
    this.authenticationService.logout();
    this.router.navigate(["/login"]);
  }
  viewProfile() {
    const modalRef = this.modalService.open(ProfileComponent, {
      //backdrop: 'static',
      size: "lg",
      keyboard: false,
    });

    modalRef.componentInstance.data = this.currentUser;

    modalRef.result
      .then((result) => {
        if (result.status == "ok") {
          this._ToastService.success("contraseña modificada correctamente");
          this.logout();
        }
      })
      .catch((error) => {});
  }
}
