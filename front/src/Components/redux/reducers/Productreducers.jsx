const products = [];

export const getProductsReducers = (state = { products }, action) => {
    switch (action.type) {
        case "SUCCESS_GET_PRODUCTS":
            return {
                products: action.payload.products || (Array.isArray(action.payload) ? action.payload : []),
                pagination: action.payload.pagination || null
            }
        case "FAIL_GET_PRODUCTS":
            return { error: action.payload }
        default: return state
    }
}