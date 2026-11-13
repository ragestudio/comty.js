import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"

export class InventoryModel extends BaseEndpoint {
	/**
	 * List the inventory of a user. Use "self" (default) for the current user.
	 */
	@Definition(
		(
			user_id: string = "self",
			options: { kind?: string; include_orphaned?: boolean } = {},
		) => ({
			method: "GET",
			url: `/users/${user_id}/inventory`,
			params: options,
		}),
	)
	list!: (
		user_id?: string,
		options?: { kind?: string; include_orphaned?: boolean },
	) => Promise<{ items: any[] }>

	/**
	 * Grant an inventory item to a user. Requires admin permissions.
	 */
	@Definition(
		(
			user_id: string,
			payload: {
				kind: string
				item_id: string
				source?: string
				metadata?: Record<string, any>
			},
		) => ({
			method: "POST",
			url: `/users/${user_id}/inventory`,
			data: payload,
		}),
	)
	grant!: (user_id: string, payload: any) => Promise<any>

	/**
	 * Revoke an inventory item from a user. Requires admin permissions.
	 */
	@Definition((user_id: string, kind: string, item_id: string) => ({
		method: "DELETE",
		url: `/users/${user_id}/inventory/${kind}/${item_id}`,
	}))
	revoke!: (user_id: string, kind: string, item_id: string) => Promise<any>

	/**
	 * Redeem a code for the current user.
	 */
	@Definition((code: string) => ({
		method: "POST",
		url: "/redeem",
		data: { code },
	}))
	redeem!: (code: string) => Promise<any>

	/**
	 * Preview a redeem code before redeeming it.
	 */
	@Definition((code: string) => ({
		method: "POST",
		url: "/redeem/preview",
		data: { code },
	}))
	preview!: (code: string) => Promise<any>

	/**
	 * Create a redeem code. Requires admin permissions.
	 */
	@Definition((payload: any) => ({
		method: "POST",
		url: "/codes",
		data: payload,
	}))
	createCode!: (payload: any) => Promise<any>

	/**
	 * List redeem codes. Requires admin permissions.
	 */
	@Definition(
		(
			options: {
				limit?: number
				offset?: number
				enabled?: boolean
			} = {},
		) => ({
			method: "GET",
			url: "/codes",
			params: options,
		}),
	)
	listCodes!: (options?: {
		limit?: number
		offset?: number
		enabled?: boolean
	}) => Promise<any[]>

	/**
	 * Retrieve a redeem code. Requires admin permissions.
	 */
	@Definition((code_id: string) => ({
		method: "GET",
		url: `/codes/${code_id}`,
	}))
	getCode!: (code_id: string) => Promise<any>

	/**
	 * Disable a redeem code. Requires admin permissions.
	 */
	@Definition((code_id: string) => ({
		method: "DELETE",
		url: `/codes/${code_id}`,
	}))
	disableCode!: (code_id: string) => Promise<any>

	/**
	 * List the redemptions of a code. Requires admin permissions.
	 */
	@Definition(
		(
			code_id: string,
			options: { limit?: number; offset?: number } = {},
		) => ({
			method: "GET",
			url: `/codes/${code_id}/redemptions`,
			params: options,
		}),
	)
	getRedemptions!: (
		code_id: string,
		options?: { limit?: number; offset?: number },
	) => Promise<any[]>
}

export default new InventoryModel()
