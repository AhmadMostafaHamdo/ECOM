import { axiosInstance } from "../../../api";

export const getProducts = (category = "", searchTerm = "") => async (dispatch) => {
    try {
        const response = await axiosInstance.get("/getproducts", {
            params: {
                category,
                search: searchTerm
            }
        });

        dispatch({ type: "SUCCESS_GET_PRODUCTS", payload: response.data });
    } catch (error) {
        dispatch({ type: "FAIL_GET_PRODUCTS", payload: error.response?.data });
    }
}
