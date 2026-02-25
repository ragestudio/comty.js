import getGroupMembersMethod from "./methods/getGroupMembers"
import getGroupMemberMethod from "./methods/getGroupMember"
import removeGroupMemberMethod from "./methods/removeGroupMember"

export default class GroupMembers {
	static list = getGroupMembersMethod
	static get = getGroupMemberMethod
	static remove = removeGroupMemberMethod
}
