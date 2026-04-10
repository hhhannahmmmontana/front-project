import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import UserService from "../../services/user.service";
import { SnackbarService } from "../../services/snackbar.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import LoginRequest from "../../requests/login.request";
import { CommonModule } from "@angular/common";
import { finalize, Subscription } from "rxjs";
import RegisterRequest from "../../requests/register.request";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
    selector: 'app-auth',
    imports: [FormsModule, RouterLink, CommonModule, MatProgressSpinner],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnDestroy {
    type!: 'login' | 'register';

    username = "";
    password = "";
    loading = false;

    sub = new Subscription();

    constructor(
        private authService: UserService,
        private snackbarService: SnackbarService,
        route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        const path = route.snapshot.routeConfig?.path;
        this.type = path === 'login' ? 'login' : 'register';
    }

    onConfirm() {
        if (this.loading) {
            return;
        }

        this.loading = true;

        this.username = this.username.trim();
        const request$ = this.type === 'login'
            ? this.authService.login(new LoginRequest(this.username, this.password))
            : this.authService.register(new RegisterRequest(this.username, this.password));

        this.sub.add(
            request$
            .pipe(finalize(() => {
                this.cdr.detectChanges();
                this.loading = false;
            }))
            .subscribe({
                next: () => {
                    this.router.navigateByUrl('/')
                },
                error: err => {
                    this.snackbarService.err(err)
                }
            })
        );
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}