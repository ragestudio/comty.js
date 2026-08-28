import BaseModel from "../../classes/BaseModel"

import Channels from "./channels"
import Ack from "./ack"
import Dm from "./dm"

export class ChatsModel extends BaseModel {
	channels = Channels
	dm = Dm
	ack = Ack
}

export default new ChatsModel()
