import BaseModel from "../../classes/BaseModel"

import * as v from "valibot"
import { Definition } from "../../decorators/Definition"
import { Validate } from "../../decorators/Validate"

export class NfcModel extends BaseModel {
	/**
	 * Activate NFC card
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "card_id is required")))
	@Definition((card_id) => ({
		method: "POST",
		url: `/nfc/${card_id}/activate`,
	}))
	activate: (card_id: string) => Promise<any>
}

export default new NfcModel()
