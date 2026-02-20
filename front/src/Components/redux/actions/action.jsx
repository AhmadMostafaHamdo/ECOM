
import { apiUrl } from "../../../api";

export const getProducts = (category = "", searchTerm = "") => async (dispatch) => {
    try {
        const url = new URL(apiUrl("/getproducts"));
        if (category) url.searchParams.append("category", category);
        if (searchTerm) url.searchParams.append("search", searchTerm);

        const data = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const res = await data.json();
        dispatch({ type: "SUCCESS_GET_PRODUCTS", payload: res });
    } catch (error) {
        dispatch({ type: "FAIL_GET_PRODUCTS", payload: error.response });
    }
}
