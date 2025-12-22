import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError, timer } from "rxjs";
import { delay, mergeMap, tap } from "rxjs/operators";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import UserService from "./user.service";
import UserModel from "../models/user.model";
import GetPostsResponse from "../responses/get-posts.response";
import GetCommentsResponse from "../responses/get-comments.response";
import { POST_CONTENTS, COMMENT_CONTENTS, TAGS } from "./mock.data";
import CreatePostRequest from "../requests/create-post.request";

@Injectable({ providedIn: 'root' })
class ExploreService {

    private posts: PostModel[] = [];
    private comments = new Map<number, CommentModel[]>();
    postIdCounter = 1;
    commentIdCounter = 1;
    private currentUser: UserModel | null = null;

    constructor(
        private httpClient: HttpClient,
        private userService: UserService
    ) {
        this.userService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        this.generatePosts();
    }

    getPosts(
        pageSize: number,
        token: string | null,
        tag: string | null,
        search: string | null,
        onlyFavourites: boolean
    ): Observable<GetPostsResponse> {
        const offset = token ? Number(token) : 0;
        const posts = this.posts.slice(offset, offset + pageSize);
        const nextOffset = offset + posts.length;

        return of({
            posts,
            token: nextOffset < this.posts.length ? String(nextOffset) : null
        }).pipe(delay(3000));
    }

    getPostComments(
        postId: number,
        pageSize: number,
        token: string | null
    ): Observable<GetCommentsResponse> {
        debugger
        const offset = token ? Number(token) : 0;
        const all = this.comments.get(postId) ?? [];
        const comments = all.slice(offset, offset + pageSize).reverse();
        const nextOffset = offset + comments.length;

        return of({
            comments,
            token: nextOffset < all.length ? String(nextOffset) : null
        }).pipe(delay(500));
    }

    ratePost(postId: number, rating: number): Observable<void> {
        return timer(1000).pipe(
            mergeMap(() => this.checkIfAuthorizedOrThrow())
        );
    }

    commentPost(postId: number, content: string): Observable<CommentModel> {
        const model = {
            id: ++this.commentIdCounter,
            content: content,
            author: this.currentUser?.username ?? null,
            date: new Date()
        };

        this.comments.set(postId, [model, ...(this.comments.get(postId) ?? [])])

        return of(model).pipe(
            delay(1000)
        );
    }

    addToFavourites(postId: number): Observable<void> {
        return timer(1000).pipe(
            mergeMap(() => this.checkIfAuthorizedOrThrow())
        );
    }

    removeFromFavorites(postId: number): Observable<void> {
        return timer(1000).pipe(
            mergeMap(() => this.checkIfAuthorizedOrThrow())
        );
    }

    create(createRequest: CreatePostRequest): Observable<PostModel> {
        return of({
            id: ++this.postIdCounter,
            content: createRequest.text,
            date: new Date(),
            author: this.currentUser?.username ?? null,
            rating: 0,
            ratingAmount: 0,
            userRating: 0,
            isFavourite: false,
            tags: createRequest.tags
        }).pipe(delay(1000));
    }

    private checkIfAuthorizedOrThrow() {
        if (this.currentUser) {
            return of(void 0);
        }

        return throwError(() => new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            error: {
                message: 'Invalid credentials'
            }
        }));
    }

    private generatePosts() {
        const contents = POST_CONTENTS;

        for (const text of contents.slice(0, 10)) {
            const id = this.postIdCounter++;

            this.posts.push({
                id,
                content: text,
                date: new Date(Date.now() - Math.random() * 1e10),
                author: Math.random() > 0.2 ? `user${Math.ceil(Math.random() * 10)}` : null,
                rating: Math.ceil(Math.random() * 80 + 20) / 20,
                ratingAmount: Math.ceil(Math.random() * 100),
                userRating: null,
                isFavourite: false,
                tags: this.generateTags()
            });

            const comments: CommentModel[] = [];
            const count = 3 + Math.floor(Math.random() * 12);

            for (let i = 0; i < count; i++) {
                comments.push({
                    id: this.commentIdCounter++,
                    content: COMMENT_CONTENTS[Math.floor(Math.random() * COMMENT_CONTENTS.length)],
                    author: Math.random() > 0.3 ? `user${Math.ceil(Math.random() * 20)}` : null,
                    date: new Date(Date.now() - Math.random() * 1e10)
                });
            }

            this.comments.set(id, comments);
        }
    }

    private generateTags(): Set<string> {
        const count = 1 + Math.floor(Math.random() * 4);
        const shuffled = [...TAGS].sort(() => 0.5 - Math.random());
        return new Set(shuffled.slice(0, count));
    }
}

export default ExploreService;
