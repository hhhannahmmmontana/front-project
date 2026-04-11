import { Component, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges } from "@angular/core";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
@Component({
	selector: 'app-menu',
	imports: [FaIconComponent],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnChanges {
    icons = {
        faCross: faXmark
    }
    @Input() closable = false;
    @Input() isShowed = false;
    @Output() onClose = new EventEmitter<void>();

    constructor(
        private renderer: Renderer2
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isShowed']) {
            if (this.isShowed) {
                this.renderer.addClass(document.body, 'no-scroll');
            } else {
                this.renderer.removeClass(document.body, 'no-scroll');
            }
        }
    }

    close() {
        this.onClose.emit();
    }
}