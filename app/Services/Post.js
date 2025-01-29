import axiosInstance from "./interceptor";

const Post_Service = {
    getPosts: () => axiosInstance.get('')
    .then((response) => {
        return Array.isArray(response.data) ? response.data : response.data.posts || []
    })
    .catch((error) => {
        return [];
    }),

    getPostById: (id) => axiosInstance.get(``)
    .then((respone) => {
        return respone.data || null
    })
    .catch((error) => {
        return null;
    })
}
export default Post_Service