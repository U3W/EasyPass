import {combineReducers} from "redux"
import authReducer from "./auth.reducer"
import verifyReducer from "./verify.reducer"
import saveReducer from "./save.reducer"

const rootReducer = combineReducers({
    auth: authReducer,
    verify: verifyReducer,
    save: saveReducer
});

export default rootReducer