import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import ExploreService from '../../services/explore.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import PostModel from '../../models/post.model';
import { catchError, concatMap, EMPTY, finalize, Observable, Subject, tap, throwError } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { CommonModule, DatePipe } from '@angular/common';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpErrorResponse } from '@angular/common/http';

const POSTS_PAGE_SIZE = 9;

type Command = () => Observable<any>;

@Component({
	selector: 'app-explore',
	imports: [FontAwesomeModule, MatProgressSpinner, DatePipe, CommonModule],
	templateUrl: './explore.component.html',
	styleUrl: './explore.component.scss'
})
export class ExploreComponent {
	@HostListener('window:scroll', [])
  	onWindowScroll() {
    	const height = document.documentElement.scrollHeight;
    	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    	const clientHeight = document.documentElement.clientHeight;

		if (scrollTop + clientHeight >= height - 100) {
			this.loadPosts();
		}
	}

	icons = {
		faStarSolid: faStarSolid,
		faStarRegular: faStarRegular
	}

	loadingPosts = false;
	postsToken: string | null = null;
	posts: PostModel[] = [];
	starsRange = [1, 2, 3, 4, 5];

	private commandQueue$ = new Subject<Command>();

	constructor(
		public exploreService: ExploreService,
		public snackbarService: SnackbarService,
		public cdr: ChangeDetectorRef
	) {
		this.commandQueue$
			.pipe(concatMap(cmd =>
				cmd().pipe(
					catchError(err => {
						this.snackbarService.err(err);
						return EMPTY;
					})
				),
			))
			.subscribe();

	}

	ngOnInit() {
		this.loadPosts();
	}

	loadPosts() {
		if (this.loadingPosts) {
			return;
		}

		this.loadingPosts = true;
		this.exploreService.getPosts(POSTS_PAGE_SIZE, this.postsToken)
			.pipe(finalize(() => {
				this.loadingPosts = false;
				this.cdr.detectChanges();
			}))
			.subscribe({
				next: res => {
					this.posts = [...this.posts, ...res.posts];
					this.postsToken = res.token;
				},
				error: err => this.snackbarService.err(err)
			});
	}

	toggleFavourite(post: PostModel) {
		const prevFavourite = post.isFavourite;
		post.isFavourite = !post.isFavourite;

		this.enqueue(() => {
			const command = post.isFavourite
				? this.exploreService.addToFavourites(post.id)
				: this.exploreService.removeFromFavorites(post.id)

			
			return command.pipe(catchError((err: HttpErrorResponse) => {
				if ([401, 403].includes(err.status)) {
					post.isFavourite = false;
				} else {
					post.isFavourite = prevFavourite;
				}
				this.cdr.detectChanges();
				return throwError(() => err);
			}));
		});
	}

	hoveredRatings = new Map<number, number>();

    onStarHover(post: PostModel, rating: number) {
        this.hoveredRatings.set(post.id, rating);
    }

    onStarLeave(post: PostModel) {
        this.hoveredRatings.delete(post.id);
    }

    getStarWidth(post: PostModel): number {
        const hover = this.hoveredRatings.get(post.id);
        
        if (hover !== undefined) {
            return (hover / 5) * 100;
        }
        
        if (post.userRating != null) {
            return (post.userRating / 5) * 100;
        }
        
        return (post.rating / 5) * 100;
    }

	getStarColorClass(post: PostModel): string {
		if (this.hoveredRatings.has(post.id)) {
			return 'stars-hover';
		}
		
		if (post.userRating != null) {
			return 'stars-user-rated';
		}

		return 'stars-average';
	}

	ratePost(post: PostModel, rating: number) {
		const prevRating = post.rating;
		post.userRating = rating;

		this.enqueue(() => {		
			return this.exploreService.ratePost(post.id, rating)
				.pipe(catchError((err: HttpErrorResponse) => {
					if ([401, 403].includes(err.status)) {
						post.userRating = null;
					} else {
						post.userRating = prevRating;
					}
					this.cdr.detectChanges();
					return throwError(() => err);
				}));
		});
	}

	private enqueue<T>(command: () => Observable<T>) {
		this.commandQueue$.next(command);
	}
}
