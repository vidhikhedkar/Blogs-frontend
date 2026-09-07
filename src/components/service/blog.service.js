
// ============================================================
// GET ALL BLOGS
// GET /api/blogs
// ============================================================

import api from "./api.service";

export const getAllBlogsService = async () => {
    try {
        const response = await api.get("/api/blogs");

        console.log("Get All Blogs:", response.data);

        return response.data;
    } catch (error) {
        console.error("Get All Blogs Error:", error);

        throw error.response?.data || error;
    }
};


// ============================================================
// GET BLOG BY ID
// GET /api/blogs/:id
// ============================================================

export const getBlogByIdService = async (id) => {
    try {
        const response = await api.get(`/api/blogs/${id}`);

        console.log("Get Blog By ID:", response.data);

        return response.data;
    } catch (error) {
        console.error("Get Blog By ID Error:", error);

        throw error.response?.data || error;
    }
};



export const createBlogService = async (blogData) => {
    try {
        const response = await api.post("/api/blogs", blogData,
            { headers: { "Content-Type": "multipart/form-data", }, });
        console.log("Create Blog:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Create Blog Error:", error);
        throw error.response?.data || error;
    }
};




// UPDATE BLOG
// PUT /api/blogs/:id
// ============================================================

export const updateBlogService = async (id, blogData) => {
    try {
        const response = await api.put(
            `/api/blogs/${id}`,
            blogData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log("Update Blog:", response.data);

        return response.data;
    } catch (error) {
        console.error("Update Blog Error:", error);

        throw error.response?.data || error;
    }
};


// ============================================================
// RESTORE BLOG
// PATCH /api/blogs/:id/restore
// ============================================================

export const restoreBlogService = async (id) => {
    try {
        const response = await api.patch(
            `/api/blogs/${id}/restore`
        );

        console.log("Restore Blog:", response.data);

        return response.data;
    } catch (error) {
        console.error("Restore Blog Error:", error);

        throw error.response?.data || error;
    }
};



export const getTrashBlogsService = async () => {
    try {
        const response = await api.get('/api/blogs/trash');

        console.log('Get Trash Blogs:', response.data);

        return response.data;
    } catch (error) {
        console.error(
            'Get Trash Blogs Error:',
            error
        );

        throw error;
    }
};



// ============================================================
// UPLOAD INLINE IMAGE
// POST /api/blogs/upload-inline-image
// ============================================================

export const uploadInlineImageService = async (imageData) => {
    try {
        const response = await api.post(
            "/api/blogs/upload-inline-image",
            imageData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(
            "Upload Inline Image:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Upload Inline Image Error:",
            error
        );

        throw error.response?.data || error;
    }
};




// ============================================================
// SOFT DELETE BLOG
// DELETE /api/blogs/:id
// ============================================================

export const deleteBlogService = async (id) => {
    try {
        const response = await api.delete(`/api/blogs/${id}`);

        console.log("Delete Blog:", response.data);

        return response.data;
    } catch (error) {
        console.error("Delete Blog Error:", error);

        throw error.response?.data || error;
    }
};



// ============================================================
// PERMANENTLY DELETE BLOG
// DELETE /api/blogs/:id/permanent
// ============================================================

export const permanentlyDeleteBlogService = async (id) => {
    try {
        const response = await api.delete(
            `/api/blogs/${id}/permanent`
        );

        console.log(
            "Permanent Delete Blog:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Permanent Delete Blog Error:",
            error
        );

        throw error.response?.data || error;
    }
};