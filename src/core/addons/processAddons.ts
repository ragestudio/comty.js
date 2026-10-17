import client from "../client"

export type ProcessAddonsContext = {
	operation: string
	currentData: any
	addonResult: any
}

export type ProcessAddonsParams = {
	operation: string
	initialData: any
	fnArguments?: any[]
	normalizeAddonResult: (context: ProcessAddonsContext) => any
}

export default async function processAddons({
	operation,
	initialData,
	fnArguments = [],
	normalizeAddonResult,
}: ProcessAddonsParams) {
	const addons = client.addons.getByOperation(operation)

	let processedData = initialData

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
