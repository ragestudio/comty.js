import getGroupChannelsMethod from "./methods/getGroupChannels"
import getGroupChannelMethod from "./methods/getGroupChannel"
import createChannelMethod from "./methods/createChannel"
import modifyChannelMethod from "./methods/modifyChannel"
import deleteChannelMethod from "./methods/deleteChannel"
import changeChannelsOrderMethod from "./methods/changeChannelsOrder"
import disconnectUserMethod from "./methods/disconnectUser"

export default class GroupChannels {
	static list = getGroupChannelsMethod
	static get = getGroupChannelMethod
	static create = createChannelMethod
	static order = changeChannelsOrderMethod

	static channel = {
		modify: modifyChannelMethod,
		delete: deleteChannelMethod,
		disconnectUser: disconnectUserMethod,
	}
}
