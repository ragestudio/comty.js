export default (base, obj) => {
	const validGroups = Object.keys(obj).filter(
		(key) => Array.isArray(obj[key]?.items) && obj[key].items.length > 0,
	)

	return validGroups.reduce(
		(acc, group) => {
			if (!acc[group]) {
				acc[group] = { items: [], total_items: 0 }
			}

			acc[group].items = [...acc[group].items, ...obj[group].items]
			acc[group].total_items += obj[group].total_items || 0
			return acc
		},
		{ ...base },
	)
}
