import BaseEndpoint from "../../core/endpoint/BaseEndpoint"

import Channels from "./channels"
import Ack from "./ack"
import Dm from "./dm"

export class ChatsModel extends BaseEndpoint {
	channels = Channels
	dm = Dm
	ack = Ack
}

export default new ChatsModel()
