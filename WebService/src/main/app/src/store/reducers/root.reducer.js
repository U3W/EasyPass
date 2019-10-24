import {combineReducers} from "redux"
import authReducer from "./auth.reducer"
import verifyReducer from "./verify.reducer"

const rootReducer = combineReducers({
    auth: authReducer,
    verify: verifyReducer
});

export default rootReducer