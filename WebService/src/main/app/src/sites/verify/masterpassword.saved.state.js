import {masterpasswordConst} from "./masterpassword.enum";


class MasterpasswordState {

    getRadioState() {
        if ( localStorage.getItem(masterpasswordConst.radioSelected) === null ) {
            return "file";
        }
        return localStorage.getItem(masterpasswordConst.radioSelected);
    }

}


export default new MasterpasswordState;