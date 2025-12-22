import CommentModel from "../models/comment.model";

export default interface GetCommentsResponse {
    comments: CommentModel[],
    token: string | null
}