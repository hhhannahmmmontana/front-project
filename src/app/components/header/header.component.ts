import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import UserService from '../../services/user.service';
import UserModel from '../../models/user.model';
import { SnackbarService } from '../../services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, Subscription} from 'rxjs';
import { FormsModule } from '@angular/forms';
import SearchComponent from './search/search.component';
import SearchModel from './search/search.model';
import SearchService from '../../services/search.service';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	selector: 'app-header',
	imports: [
		FontAwesomeModule,
		MatProgressSpinnerModule,
		FormsModule,
		SearchComponent,
		RouterLink,
		CommonModule
	],
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
		faUser: faUser
	}

	currentUser: UserModel | null = null;
	userLoading = true;
	openMenu = false;
	doShowUserMenu = false;
	sub: Subscription = new Subscription();
	searchModel: SearchModel;

	loadingLogout = false;

	constructor(
		private userService: UserService,
		searchService: SearchService,
		private snackbarService: SnackbarService,
    	private cdr: ChangeDetectorRef
	) {
		this.searchModel = new SearchModel(searchService, snackbarService, cdr);
	}

	ngOnInit() {
		if (this.currentUser != null) {
			this.userLoading = false;
			return;
		}

		this.sub.add(
			this.userService.currentUser$
				.subscribe({
					next: user => {
						this.currentUser = user;
						this.userLoading = false;
					},
					error: err => {
						this.snackbarService.err(err);
						this.userLoading = false;
					}
				})
		);
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	toggleUserMenu() {
		this.doShowUserMenu = !this.doShowUserMenu;
	}

	logout() {
		if (this.loadingLogout) {
			return;
		}

		this.loadingLogout = true;
		this.sub.add(
			this.userService.logout()
				.pipe(
					finalize(() => window.location.reload())
				)
				.subscribe()
		);
	}
}
