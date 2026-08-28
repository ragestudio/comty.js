export default class AddonsManager {
	addons = new Map()

	register(name, addon) {
		this.addons.set(name, addon)
	}

	get(name) {
		return this.addons.get(name)
	}

	// search all addons registered, and find all addons that has a addon[operation] function
	getByOperation(operation) {
		return Array.from(this.addons.values())
			.filter((addon) => addon[operation])
			.map((addon) => {
				return {
					id: addon.constructor.id,
					fn: addon[operation],
				}
			})
	}
}
