export interface IListResource {
    _links: IPaginationLinks

    page: IPageNumbers
}

export interface IPaginationLinks {
    first: ILink,
    last: ILink,
    next: ILink,
    prev: ILink,
    self: ILink
}

export interface IPageNumbers {
    size: number,
    total_elements: number,
    total_pages: number,
    number: number
}

export interface ILink {
    href: string
}

export interface IListResourceParameters {
    size?: number,
    page?: number,
    search?: string,
    sort?: string
}