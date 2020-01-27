import {dashboardAlerts} from "./const/dashboard.enum";

/**
 * Extends functionality of the `Dashboard` component.
 * This class is used specifically for logic operations.
 *
 * In order to use them, then need to be bound in the `Dashboard component`
 * like `this.[someFunc] = [importAlias].[someFunc].bind(this);`.
 */

/**
 * React to messages send from the Web Worker
 * @param e Message received from Web Worker
 */
export function workerCall( e ) {
    console.log('Saved entries: ' + this.state.entries.entries);
    console.log('Saved categories: ' + this.state.entries.categories);
    const cmd = e.data[0];
    const data = e.data[1];
    console.log("WORKERCALL");
    console.log(cmd);
    console.log(data);
    switch (cmd) {
        case 'allEntries':
            this.loadEntries(data);
            break;
        case 'savePassword':
            this.copy("", dashboardAlerts.showAddedPass, data.ok);
            this.dismissAddPass();
            break;
        case 'deletePassword':
            this.showDeletePopUp(dashboardAlerts.showDeletePassAlert, data.ok);
            break;
        case 'getPassword':
            this.setState({
                passwordCache: data.passwd,
                passwordCacheID: data._id
            });
            console.log("PASSWORD IS " + data);
            break;
        case 'saveCategory':
            this.copy("", dashboardAlerts.showAddedCat, data.ok);
            this.dismissAddCat();
            break;
    }

}

/**
 * Adds a new password entry.
 */
export function addPass(user, passwd, url, title, tags, catID) {
    const tabID = this.state.tabselected;
    this.props.worker.postMessage(['savePassword',
        {type: 'passwd', user: user, passwd: passwd, url: url, title: title, tags: tags, tabID: tabID, catID: catID, }]);
}

/**
 * Removes a password entry by id and revision.
 */
export function deletePass(id, rev) {
    this.setState({
        currentPassDelete: id,
    });
    this.props.worker.postMessage(['deletePassword', {_id: id, _rev: rev}]);
}

/**
 * Returns a password that matches the id.
 * When no entry is found, undefined will be returned.
 */
export function getPass(id, rev) {
    // TODO Mockobjekt getPassword
    //return this.state.mock.getPassword(id);
    //return this.state.entries.getEntry(id);
    this.props.worker.postMessage(['getPassword', {_id: id, _rev: rev}])
}

/**
 * Copies the latest cached password of a password entry to the users clipboard.
 */
export async function copyPass() {
    while (this.state.passwordCache === undefined) {
        await sleep(50);
    }
    console.log("copypass: " + this.state.passwordCache);
    // Todo call Kacpers Method
    // Popup starten
    this.setState({
        showCopyAlert: true,
        alertState: "success",
    });
    this.dismissCopy("showCopyAlert");

    this.clipboardCopy(this.state.passwordCache);
}

/**
 * Resets the password cache.
 */
export function resetPassCache() {
    this.setState({
        passwordCache: undefined
    });
}

export function setPassCacheID(id) {
    this.setState({
        passwordCacheID: id
    });
}


/**
 * Recovers and deleted password or category entry.
 */
export function undoDelete( which, id ) {
    // TODO Enable stop delete
    switch (which) {
        case dashboardAlerts.showDeleteCatAlert:
            // ToDo call Kacpers  with id

            this.setState({
                showDeleteCatAlert: false,
            });
            break;
        case dashboardAlerts.showDeletePassAlert:
            this.props.worker.postMessage(['undoDeletePassword', {_id: id}]);
            this.setState({
                showDeletePassAlert: false,
            });
            break;
    }
}

/**
 * Simple sleep function.
 */
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}