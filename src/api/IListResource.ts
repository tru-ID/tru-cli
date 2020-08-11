export interface IPaginationLinks {
    _links: {
        first: ILink,
        last: ILink,
        next: ILink,
        prev: ILink,
        self: ILink
    }

    page: {
        size: number,
        total_elements: number,
        total_pages: number,
        number: number
    }
}

export interface ILink {
    href: string
}