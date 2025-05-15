import FileUploadBrowser from "../../classes/FileUploadBrowser"
import SessionModel from "../session"

export default class Files {
	static get chunkUploadEndpoint() {
		return globalThis.__comty_shared_state.mainOrigin + "/upload/chunk"
	}

	static upload = async (
		file,
		{ service, headers, onError, onProgress, onFinish } = {},
	) => {
		try {
			if (globalThis.isServerMode) {
				throw new Error(
					"File Upload is only supported in the browser. Yet...",
				)
			}

			const result = await new Promise((resolve, reject) => {
				const uploadInstance = new FileUploadBrowser({
					endpoint: Files.chunkUploadEndpoint,
					splitChunkSize: 5 * 1024 * 1024,
					file: file,
					service: service ?? "standard",
					headers: {
						...(headers ?? {}),
						Authorization: `Bearer ${SessionModel.token}`,
					},
				})

				uploadInstance.events.on("error", (data) => {
					reject(data)
				})

				uploadInstance.events.on("finish", (data) => {
					if (typeof onFinish === "function") {
						onFinish(file, data)
					}

					resolve(data)
				})

				uploadInstance.events.on("progress", (data) => {
					if (typeof onProgress === "function") {
						onProgress(file, data)
					}
				})

				uploadInstance.start()
			})

			return result
		} catch (error) {
			if (typeof onError === "function") {
				onError(file, error)
			}

			return null
		}
	}
}
