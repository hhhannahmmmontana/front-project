
export default interface PostModel {
    id: number,
    text: string,
    createdAt: Date,
    author: string | null,
    rating: number,
    ratesAmount: number,
    userRating: number | null,
    isFavourite: boolean,
    tags: string[]
}