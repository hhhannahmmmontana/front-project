import { ChangeDetectorRef, Component, HostListener, Input } from "@angular/core";
import { finalize, Observable, Subscription } from "rxjs";
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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CreateComponent } from "../create/create.component";
import GetPostsResponse from "../../responses/get-posts.response";

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
        CreateComponent,
        RouterLink,
        CommonModule
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
        debugger

		if (this.postsToken != null && scrollTop + clientHeight >= height - 100) {
			this.loadPosts();
		}
	}

    icons = {
		faStarSolid: faStarSolid,
		faStarRegular: faStarRegular,
		faCaretDown: faCaretDown
	}

    sub = new Subscription();
    currentUser!: UserModel | null;
    loadingPosts = false;
    postsToken: string | null = null;
	posts: PostModel[] = [];
    dropdownedPost: PostModel | null = null;

    ngOnInit() {
        this.sub.add(this.userService.currentUser$.subscribe({
            next: user => {
                this.currentUser = user;
            },
            error: err => {
                this.currentUser = null;
            }
        }));

        this.sub.add(this.route.queryParams.subscribe(params => {
            const newSearch = params['q'] ?? null;
            const newTag = params['tag'] ?? null;
            const newFavourites = params['favourites'] === 'true';

            if (newSearch !== this.search || newTag != this.tag || newFavourites != this.onlyFavourites) {
                this.search = newSearch;
                this.tag = newTag;
                this.onlyFavourites = newFavourites;
            }
            this.clearPosts();
            this.loadPosts();
        }));
    }

    private clearPosts() {
        this.dropdownedPost = null;
        this.postsToken = null;
        this.posts = [];
    }

    get authorized(): boolean {
        return this.currentUser != null;
    }

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        public snackbarService: SnackbarService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

	loadPosts() {
		if (this.loadingPosts) {
			return;
		}

		this.loadingPosts = true;
        let f: Observable<GetPostsResponse>;
        if (this.search) {
            f = this.exploreService.searchPosts(
                this.search,
                this.postsToken
            );
        } else if (this.tag) {
            f = this.exploreService.getPostsByTag(
                this.tag,
                this.postsToken
            );
        } else if (this.onlyFavourites === true) {
            f = this.exploreService.getFavourites(
                this.postsToken
            );
        } else {
            f = this.exploreService.getPosts(this.postsToken);
        }

		f.pipe(finalize(() => {
            this.loadingPosts = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (res: GetPostsResponse) => {
                debugger
                this.posts = [...this.posts, ...res.value];
                this.postsToken = res.nextToken;
            },
            error: err => this.snackbarService.err(err)
        });
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