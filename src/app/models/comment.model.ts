
export default interface CommentModel {
    id: number,
    text: string,
    username: string | null,
    createdAt: Date
}