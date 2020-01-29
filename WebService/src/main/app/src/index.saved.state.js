import dashboardState from "./sites/dashboard/dashboard.saved.state";
import {dashboardConst} from "./sites/dashboard/const/dashboard.enum";

export const indexConst = {
    loadingState: "001",
};
export default class indexState {
    static setLoadingState( state ) {
        localStorage.setItem(indexConst.loadingState, state);
    }
    static getLoadingState() {
        if ( JSON.parse(localStorage.getItem(indexConst.loadingState)) === null )
        {
            return undefined;
        }
        if ( !JSON.parse(localStorage.getItem(indexConst.loadingState)) ) {
            return false;

        }
        return undefined;

    }
}
