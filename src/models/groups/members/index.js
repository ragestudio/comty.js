import getGroupMembersMethod from "./methods/getGroupMembers"
import getGroupMemberMethod from "./methods/getGroupMember"
import removeGroupMemberMethod from "./methods/removeGroupMember"
import getGroupConnectionsMethod from "./methods/getGroupMembersConnections"

export default class GroupMembers {
	static list = getGroupMembersMethod
	static get = getGroupMemberMethod
	static remove = removeGroupMemberMethod
	static connections = getGroupConnectionsMethod
}
