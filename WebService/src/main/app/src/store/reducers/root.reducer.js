import {combineReducers} from "redux"
import authReducer from "./auth.reducer"
import saveReducer from "./save.reducer"

const rootReducer = combineReducers({
    auth: authReducer,
    save: saveReducer
});

export default rootReducer