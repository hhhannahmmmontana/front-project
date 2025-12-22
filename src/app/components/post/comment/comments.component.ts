import { ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import CommentModel from "../../../models/comment.model";
import PostModel from "../../../models/post.model";
import { finalize, Subscription } from "rxjs";
import ExploreService from "../../../services/explore.service";
import { SnackbarService } from "../../../services/snackbar.service";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";

const COMMENT_PAGE_SIZE = 3;

@Component({
    selector: "app-comments",
    imports: [MatProgressSpinner, FormsModule, DatePipe],
    templateUrl: "./comments.component.html",
    styleUrl: "./comments.component.scss"
})
export class CommentsComponent implements OnDestroy {
    @Input() post!: PostModel;
    loadingComments: boolean = false;
    token: string | null = null;
    comments: CommentModel[] = [];
    draft = '';
    sub = new Subscription();
    sendingComment = false;

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        public snackbarService: SnackbarService
    ) { }

    ngOnInit() {
        this.updateComments();
    }

    updateComments() {
		if (this.loadingComments) return;

		this.loadingComments = true;
		this.sub.add(this.exploreService.getPostComments(
				this.post.id,
				COMMENT_PAGE_SIZE,
				this.token
			)
			.pipe(finalize(() => {
				this.loadingComments = false;
				this.cdr.detectChanges();
			}))
			.subscribe({
				next: response => {
					this.comments = [...response.comments, ...this.comments];
					this.token = response.token;
				},
				error: err => this.snackbarService.err(err)
			}));
	}

	sendComment() {
		if (this.sendingComment) {
			return;
		}
		this.sendingComment = true;

		this.exploreService.commentPost(this.post.id, this.draft)
			.pipe(finalize(() => {
				this.sendingComment = false;
				this.cdr.detectChanges();
			}))
			.subscribe({
				next: (comment: CommentModel) => {
					this.draft = '';
					this.comments.push(comment);
				},
				error: err => this.snackbarService.err(err)
			})
	}

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}