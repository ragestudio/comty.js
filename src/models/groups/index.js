import getMyGroupsMethod from "./methods/getMyGroups"

import getGroupMethod from "./methods/getGroup"
import createGroupMethod from "./methods/createGroup"
import modifyGroupMethod from "./methods/modifyGroup"
import deleteGroupMethod from "./methods/deleteGroup"

import getGroupMembersMethod from "./methods/getGroupMembers"
import getGroupChannelsMethod from "./methods/getGroupChannels"

import getGroupChannelMethod from "./methods/getGroupChannel"
import createChannelMethod from "./methods/createChannel"
import modifyChannelMethod from "./methods/modifyChannel"
import deleteChannelMethod from "./methods/deleteChannel"

import getSoundpadItem from "./methods/getSoundpadItems"

import getGroupRTCState from "./methods/getGroupRTCState"

export default class GroupsModel {
	static getMy = getMyGroupsMethod

	static create = createGroupMethod
	static get = getGroupMethod
	static modify = modifyGroupMethod
	static delete = deleteGroupMethod

	static members = {
		list: getGroupMembersMethod,
		//get: getGroupMemberMethod,
		//add: addGroupMembersMethod,
		//remove: removeGroupMembersMethod,
	}

	static channels = {
		list: getGroupChannelsMethod,
		get: getGroupChannelMethod,
		create: createChannelMethod,
		modify: modifyChannelMethod,
		delete: deleteChannelMethod,
	}

	static soundpad = {
		getItems: getSoundpadItem,
		getItem: null,
	}

	static rtc = {
		getGroupState: getGroupRTCState,
	}
}
