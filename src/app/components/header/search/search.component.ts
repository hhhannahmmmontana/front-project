import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchModel from "./search.model";

@Component({
    selector: "app-search",
    imports: [FormsModule, FontAwesomeModule],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchComponent),
            multi: true
        }
    ]
})
export default class SearchComponent {
    @Input() id: number | null = null;
    @Input() model!: SearchModel;
    icons = { faSearch: faSearch };

    ngOnInit() {
        if (this.model) {
            this.model.init();
        }
    }

    ngOnDestroy() {
        if (this.model) {
            this.model.destroy();
        }
    }

    searchOnInput() {
        this.model.onInput();
    }

    searchOnFocus() {
        this.model.onFocus();
    }

    searchOnBlur() {
        this.model.onBlur();
    }

    search() {
        this.model.search();
    }
}
