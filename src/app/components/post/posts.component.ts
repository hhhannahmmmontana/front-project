import { ChangeDetectorRef, Component, HostListener, Input } from "@angular/core";
import { finalize, Subscription } from "rxjs";
import ExploreService from "../../services/explore.service";
import { SnackbarService } from "../../services/snackbar.service";
import PostModel from "../../models/post.model";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule, DatePipe } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { faCaretDown, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { CommentsComponent } from "./comment/comments.component";
import { RatingComponent } from "./rating/rating.component";
import UserService from "../../services/user.service";
import UserModel from "../../models/user.model";
import { Router } from "@angular/router";
import { CreateComponent } from "../create/create.component";

const POSTS_PAGE_SIZE = 9;

@Component({
    selector: "app-posts",
    imports: [
        FontAwesomeModule,
        DatePipe,
        MatProgressSpinner,
        CommentsComponent,
        RatingComponent,
        CommonModule,
        CreateComponent
    ],
    templateUrl: "./posts.component.html",
    styleUrl: "./posts.component.scss"
})
export class PostsComponent {
    @Input() tag: string | null = null;
    @Input() search: string | null = null;
    @Input() onlyFavourites: boolean = false;

    @HostListener('window:scroll', [])
  	onWindowScroll() {
    	const height = document.documentElement.scrollHeight;
    	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    	const clientHeight = document.documentElement.clientHeight;

		if (this.postsToken != null && scrollTop + clientHeight >= height - 100) {
			this.loadPosts();
		}
	}

    icons = {
		faStarSolid: faStarSolid,
		faStarRegular: faStarRegular,
		faCaretDown: faCaretDown
	}

    currentUser!: UserModel | null;

    ngOnInit() {
        this.loadPosts();
        this.userService.currentUser$.subscribe({
            next: user => {
                this.currentUser = user;
            },
            error: err => {
                this.currentUser = null;
            }
        })
    }

    loadingPosts = false;
    sub = new Subscription();
    postsToken: string | null = null;
	posts: PostModel[] = [];
    dropdownedPost: PostModel | null = null;

    get authorized(): boolean {
        return this.currentUser != null;
    }

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        public snackbarService: SnackbarService,
        private userService: UserService,
        private router: Router
    ) { }

	loadPosts() {
		if (this.loadingPosts) {
			return;
		}

		this.loadingPosts = true;
		this.sub.add(this.exploreService.getPosts(
                POSTS_PAGE_SIZE,
                this.postsToken,
                this.tag,
                this.search,
                this.onlyFavourites
            ).pipe(finalize(() => {
				this.loadingPosts = false;
				this.cdr.detectChanges();
			}))
			.subscribe({
				next: res => {
					this.posts = [...this.posts, ...res.posts];
					this.postsToken = res.token;
				},
				error: err => this.snackbarService.err(err)
			}));
	}

	toggleFavourite(post: PostModel) {
        if (!this.authorized) {
            this.router.navigateByUrl('/register');
            return;
        }

		const prevFavourite = post.isFavourite;
		post.isFavourite = !post.isFavourite;

		const command = post.isFavourite
				? this.exploreService.addToFavourites(post.id)
				: this.exploreService.removeFromFavorites(post.id)

			
        this.sub.add(command
            .pipe(finalize(() => this.cdr.detectChanges()))
            .subscribe({
                error: err => {
                    if ([401, 403].includes(err.status)) {
                        post.isFavourite = false;
                    } else {
                        post.isFavourite = prevFavourite;
                    }
                    this.cdr.detectChanges();
                    this.snackbarService.err(err);
                }
            }));
	}

    setDropdown(post: PostModel) {
        if (this.dropdownedPost == post) {
            this.dropdownedPost = null;
            return;
        }
		this.dropdownedPost = post;
	}

    addPost(postModel: PostModel) {
        this.posts = [postModel, ...this.posts];
    }
}