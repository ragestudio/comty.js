export type AddonOperationReference = {
	id: string | undefined
	fn: (...args: any[]) => any
}

export default class AddonsManager {
	addons = new Map<string, any>()

	register(name: string, addon: any) {
		this.addons.set(name, addon)
	}

	get(name: string) {
		return this.addons.get(name)
	}

	getByOperation(operation: string): AddonOperationReference[] {
		return Array.from(this.addons.values())
			.filter((addon) => addon[operation])
			.map((addon) => ({
				id: addon.constructor.id,
				fn: addon[operation],
			}))
	}
}
