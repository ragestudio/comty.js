import User from "../index"

export default async () => {
	return await User.updateData({
		public_name: null,
	})
}
