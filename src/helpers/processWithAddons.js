export default async function processAddons({
	operation,
	initialData,
	fnArguments,
	normalizeAddonResult,
}) {
	const addons = __comty_shared_state.addons.getByOperation(operation)

	let processedData = initialData

	if (typeof fnArguments === "undefined") {
		fnArguments = []
	}

	for (const addon of addons) {
		try {
			const addonResult = await addon.fn(...fnArguments)

			processedData = normalizeAddonResult({
				operation,
				currentData: processedData,
				addonResult,
			})
		} catch (error) {
			console.error(`Error in [${operation}] addon:`, error)
		}
	}

	return processedData
}
