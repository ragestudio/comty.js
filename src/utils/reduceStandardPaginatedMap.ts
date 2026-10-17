import type { PaginatedResponse } from "../types"

// merge two standard paginated results into a single one
export default function reduceStandardPaginatedMap<T = any>(
	curr: Partial<PaginatedResponse<T>> = {},
	obj: Partial<PaginatedResponse<T>> = {},
): PaginatedResponse<T> {
	return [curr, obj].reduce<PaginatedResponse<T>>(
		(acc, source) => {
			if (Array.isArray(source.items)) {
				acc.items.push(...source.items)
			}

			if (Number.isInteger(source.total_items)) {
				acc.total_items += Number(source.total_items)
			}

			return acc
		},
		{ items: [], total_items: 0, has_more: false },
	)
}
