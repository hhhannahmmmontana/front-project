import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import UserService from '../../services/user.service';
import UserModel from '../../models/user.model';
import { SnackbarService } from '../../services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, Subscription } from 'rxjs';

@Component({
	standalone: true,
	selector: 'app-header',
	imports: [FontAwesomeModule, MatProgressSpinnerModule],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent {
	@ViewChild('menu', { static: false }) menuRef!: ElementRef;

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		if (!this.doShowUserMenu) return;

		const clickedInside = this.menuRef.nativeElement.contains(
			event.target as Node
		);

		if (!clickedInside) {
			this.doShowUserMenu = false;
		}
	}

	icons = {
		faBars: faBars,
		faSearch: faSearch
	}

	currentUser: UserModel | null = null;
	userLoading = true;
	openMenu = false;
	doShowUserMenu = false;
	sub: Subscription = new Subscription();

	constructor(
		private userService: UserService,
		private snackbarService: SnackbarService,
    	private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
		if (this.currentUser != null) {
			this.userLoading = false;
			return;
		}

		this.sub.add(
			this.userService.getCurrentUser().pipe(
				finalize(() => {
					this.userLoading = false;
					this.cdr.detectChanges();
				})
			).subscribe({
				next: user => this.currentUser = user,
				error: err => this.snackbarService.err(err)
			})
		);
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	toggleUserMenu() {
		this.doShowUserMenu = !this.doShowUserMenu;
	}
}
