export default (curr = {}, obj = {}) => {
	return [curr, obj].reduce(
		(acc, source) => {
			if (Array.isArray(source.items)) {
				acc.items.push(...source.items)
			}
			if (Number.isInteger(source.total_items)) {
				acc.total_items += source.total_items
			}
			return acc
		},
		{ items: [], total_items: 0 },
	)
}
