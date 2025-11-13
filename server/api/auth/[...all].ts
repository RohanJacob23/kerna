import { auth } from "~~/shared/utils/auth"; // path to your auth file

export default defineEventHandler((event) => {
	return auth.handler(toWebRequest(event));
});
