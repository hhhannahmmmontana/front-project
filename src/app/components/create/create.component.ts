import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import CreateService from "../../services/create.service";
import { finalize, Subscription } from "rxjs";
import CreatePostRequest from "../../requests/create-post.request";
import { SnackbarService } from "../../services/snackbar.service";

@Component({
	selector: 'app-create',
	imports: [],
	templateUrl: './create.component.html',
	styleUrl: './create.component.scss'
})
export class CreateComponent implements OnDestroy {
    @Output() onFinish = new EventEmitter<void>();

    loaging = false;
    sub = new Subscription();
    createRequest = new CreatePostRequest();

    constructor(
        private createService: CreateService,
        private cdr: ChangeDetectorRef,
        private snackbarService: SnackbarService
    ) { }

    create() {
        this.sub.add(
            this.createService
                .create(this.createRequest)
                .pipe(finalize(() => {
                    this.loaging = false;
                    this.cdr.detectChanges();
                }))
                .subscribe({
                    next: () => this.onFinish.emit(),
                    error: err => this.snackbarService.err(err)
                })
        )
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}