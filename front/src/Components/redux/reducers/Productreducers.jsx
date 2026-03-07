const products = [];

export const getProductsReducers = (state = { products }, action) => {
    switch (action.type) {
        case "SUCCESS_GET_PRODUCTS":
            return {
                products: action.payload.data || (Array.isArray(action.payload) ? action.payload : []),
                pagination: {
                    totalItems: action.payload.total || 0,
                    totalPages: action.payload.total_pages || 1,
                    currentPage: action.payload.page || 1,
                    limit: action.payload.limit || 10
                }
            }
        case "FAIL_GET_PRODUCTS":
            return { error: action.payload }
        default: return state
    }
}