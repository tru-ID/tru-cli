import ILogger from './ILogger'
import { IPageNumbers } from '../api/IListResource'

export const displayPagination = function(logger: ILogger, pagination: IPageNumbers, description: string) {
    const startIndex = (pagination.number-1) * pagination.size
    const start = Math.max(1, startIndex)
    const end = (startIndex + pagination.size <= pagination.total_elements?startIndex + pagination.size:pagination.total_elements)
    logger?.info('')
    logger?.info(`${description}: ${start} to ${end} of ${pagination.total_elements}`)
    logger?.info(`Page ${pagination.number} of ${pagination.total_pages}`)
}