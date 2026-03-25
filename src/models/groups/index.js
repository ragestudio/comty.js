import Members from "./members"
import Channels from "./channels"

import getMyGroupsMethod from "./methods/getMyGroups"
import sortMyGroupsMethod from "./methods/sortGroups"

import getGroupMethod from "./methods/getGroup"
import createGroupMethod from "./methods/createGroup"
import modifyGroupMethod from "./methods/modifyGroup"
import deleteGroupMethod from "./methods/deleteGroup"

import getInviteDataMethod from "./methods/getInviteData"
import getAllInvitesMethod from "./methods/getAllInvites"
import createInviteMethod from "./methods/createInvite"
import joinWithInviteKeyMethod from "./methods/joinWithInviteKey"
import deleteInviteMethod from "./methods/deleteInvite"

import getSoundpadItem from "./methods/getSoundpadItems"

import getGroupRTCState from "./methods/getGroupRTCState"

export default class GroupsModel {
	static getMy = getMyGroupsMethod

	static create = createGroupMethod
	static get = getGroupMethod
	static modify = modifyGroupMethod
	static delete = deleteGroupMethod
	static sort = sortMyGroupsMethod

	static members = Members
	static channels = Channels

	static invites = {
		get: getInviteDataMethod,
		getAll: getAllInvitesMethod,
		create: createInviteMethod,
		join: joinWithInviteKeyMethod,
		delete: deleteInviteMethod,
	}

	static soundpad = {
		getItems: getSoundpadItem,
		getItem: null,
	}

	static rtc = {
		getGroupState: getGroupRTCState,
	}
}
