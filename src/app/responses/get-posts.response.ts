import PostModel from "../models/post.model";

export default interface GetPostsResponse {
    value: PostModel[],
    token: string | null
}