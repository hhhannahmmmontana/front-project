import PostModel from "../models/post.model";

export default interface GetPostsResponse {
    posts: PostModel[],
    token: string | null
}