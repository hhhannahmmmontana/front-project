import { Component } from '@angular/core';
import { PostsComponent } from "./post/posts.component";

@Component({
	selector: 'app-explore',
	imports: [PostsComponent],
	templateUrl: './explore.component.html',
	styleUrl: './explore.component.scss'
})
export class ExploreComponent { }