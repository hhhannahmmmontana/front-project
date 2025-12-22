
export default interface PostModel {
    id: number,
    content: string,
    date: Date,
    author: string | null,
    rating: number,
    ratingAmount: number,
    userRating: number | null,
    isFavourite: boolean,
    tags: string[]
}