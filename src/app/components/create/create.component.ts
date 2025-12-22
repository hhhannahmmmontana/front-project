import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { finalize, Subscription } from "rxjs";
import CreatePostRequest from "../../requests/create-post.request";
import { SnackbarService } from "../../services/snackbar.service";
import { MenuComponent } from "../menu/menu.component";
import { FormsModule } from "@angular/forms";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ExploreService from "../../services/explore.service";
import PostModel from "../../models/post.model";

@Component({
	selector: 'app-create',
	imports: [MenuComponent, FormsModule, FaIconComponent],
	templateUrl: './create.component.html',
	styleUrl: './create.component.scss'
})
export class CreateComponent implements OnDestroy {
    @Output() onPost = new EventEmitter<PostModel>();

    loaging = false;
    sub = new Subscription();
    currentTag = "";
    createRequest = new CreatePostRequest();
    showCreate = false;

    icons = {
        faXmark: faXmark
    }

    constructor(
        private exploreService: ExploreService,
        private cdr: ChangeDetectorRef,
        private snackbarService: SnackbarService,
    ) { }

    create() {
        const r = this.createRequest;
        this.sub.add(
            this.exploreService
                .create(this.createRequest)
                .pipe(finalize(() => {
                    this.loaging = false;
                    this.cdr.detectChanges();
                }))
                .subscribe({
                    next: post => {
                        this.onPost.emit(post);
                        this.showCreate = false;
                    },
                    error: err => this.snackbarService.err(err)
                })
        )
    }

    addTag() {
        const normalized = this.currentTag
            .toLowerCase()
            .replace(/^#+/, '')
            .trim()
            .replace(/\s+/g, '_');

        if (normalized.length == 0) {
            return;
        }

        this.createRequest.tags.add(normalized);
        this.currentTag = '';
    }

    removeTag(tag: string) {
        this.createRequest.tags.delete(tag);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}