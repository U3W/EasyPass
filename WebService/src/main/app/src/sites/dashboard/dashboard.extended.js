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
    const cmd = e.data[0];
    const data = e.data[1];
    switch (cmd) {
        case 'allEntries':
            this.loadEntries(data);
            break;
        case 'savePassword':
            this.copy("", dashboardAlerts.showAddedPass, data.ok);
            this.dismissAddPass();
            break;
        case 'updatePassword':
            this.copy("", dashboardAlerts.showEditedPass, true);
            this.resetPass();
            break;
        case 'deletePassword':
            this.showDeletePopUp(dashboardAlerts.showDeletePassAlert, data.ok);
            break;
        case 'getPassword':
            this.setState({
                passwordCache: data.passwd,
                passwordCacheID: data._id,
                show: true
            });
            break;
        case 'getPasswordForUpdate':
            this.setState({
                passwordCache: data.passwd,
                passwordCacheID: data._id
            });
            break;
        case 'getPasswordToClipboard':
            this.clipboardCopy(data.passwd);
            this.setState({
                showCopyAlert: true,
                alertState: "success",
            }, () => {
                this.dismissCopy("showCopyAlert");
            });
            break;
        case 'getPasswordAndRedirect':
            this.clipboardCopy(data.passwd);
            function correctUrl(url) {
                let out = url;
                if (!( url.includes("http://") || url.includes("https://") )) {
                    out = "https://" + url;
                }
                return out;
            }
            window.open(correctUrl(data.url), "_blank");
            break;
        case 'saveCategory':
            this.copy("", dashboardAlerts.showAddedCat, data.ok);
            this.dismissAddCat();
            break;
        case 'updateCategory':
            this.copy("", dashboardAlerts.showEditedCat, data.ok);
            this.dismissEditCat();
            break;
        case 'deleteCategories':
            // ToDo call Kacpers method
            /**
            this.setState({
                currentCatDelete: id,
            });*/
            let success = true;
            for (let i = 0; i < data.length; i++) {
                if (data[i].ok === false) {
                    success = false;
                    break;
                }
            }
            this.showDeletePopUp(dashboardAlerts.showDeleteCatAlert, success);
            this.dismissDeleteCat();
            break;
    }

}

/**
 * Saves a edited group the group
 */
export function editGroup( id, ref, name, userGroupList) {
    // ToDO @Kacper
    // needs to be put in workerCall
    this.setState({
        showEditedGroup: true,
        alertState: "success",
    }, () => {
        this.dismissCopy(dashboardAlerts.showEditedGroup);
    });
}

/**
 * Adds a group
 */
export function addGroup(name, userGroupList) {
    // ToDO @Kacper
    // needs to be put in workerCall
    this.setState({
        showAddedGroup: true,
        alertState: "success",
    },() => {
        this.dismissCopy(dashboardAlerts.showAddedGroup);
    });
}
/**
 * Adds a new password entry.
 */
export function addPass(user, passwd, url, title, tags, catID, groupID) {
    if ( groupID !== undefined ) {
        // add password to group
        // ToDO @Kacper
    }
    else {
        // add password to private passwords
        const tabID = this.state.tabselected;
        this.props.worker.postMessage(['savePassword',
            {type: 'passwd', user: user, passwd: passwd, url: url, title: title, tags: tags, tabID: tabID, catID: catID, }]);
    }

}

/**
 * Updates a password entry.
 */
export function saveEdit(id, rev, groupId, userNew, passwdNew, urlNew, titleNew, tagsNew, catNew) {
    // if groupId === null => priv pass
    const tabID = this.state.tabselected;
    console.log("saveEdit " + id + ":" + rev);
    console.log("saveEdit " + catNew);
    this.props.worker.postMessage(['updatePassword',
        {_id: id, _rev: rev, type: 'passwd',
            user: userNew, passwd: passwdNew, url: urlNew, title: titleNew, tags: tagsNew, tabID: tabID, catID: catNew,  }]);
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
    this.props.worker.postMessage(['getPassword', {_id: id, _rev: rev}])
}

/**
 * Returns a password that matches the id.
 * When no entry is found, undefined will be returned.
 * Difference to `getPass`: show will no be set to true.
 */
export function getPassForUpdate(id, rev) {
    this.props.worker.postMessage(['getPasswordForUpdate', {_id: id, _rev: rev}])
}

/**
 * Copies the latest cached password of a password entry to the users clipboard.
 */
export function copyPass(id, rev) {
    this.props.worker.postMessage(['getPasswordToClipboard', {_id: id, _rev: rev}]);
}

export function goToPage(url, id, rev) {
    this.props.worker.postMessage(['getPasswordAndRedirect', {_id: id, _rev: rev, url: url}]);
}

/**
 * Resets everything that has something to do in the password cache.
 */
export function resetPass() {
    this.setState({
        passwordCache: undefined,
        passwordCacheID: undefined,
        show: false
    });
}

/**
 * Recovers and deleted password or category entry.
 */
export function undoDelete(which, id) {
    switch (which) {
        case dashboardAlerts.showDeleteCatAlert:
            console.log("undo delete: ", id);
            this.props.worker.postMessage(['undoDeleteCategories', id]);
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
        case dashboardAlerts.showDeleteGroup:
            //this.props.worker.postMessage(['undoDeleteGroup', {_id: id}]);
            this.setState({
                showDeleteGroup: false,
            });
            break;
    }
}

/**
 * Adds a new category entry.
 */
export function addCat(name, description) {
    const tabID = this.state.tabselected;
    this.props.worker.postMessage(['saveCategory',
        {type: 'cat', name: name, desc: description, tabID: tabID }]);
}

/**
 * Updates a category entry.
 */
export function updateCat(id, rev, nameNew, descriptionNew) {
    const tabID = this.state.tabselected;
    this.props.worker.postMessage(['updateCategory',
        {_id: id, _rev: rev, type: 'cat', name: nameNew, desc: descriptionNew, tabID: tabID}]);

}

/**
 * Removes multiple categories that are passed as an array of ids and revisions.
 */
export function deleteCats(entries) {
    this.setState({
        currentCatDelete: entries,
    });
    for ( let i = 0; i < entries.length; i++ ) {
        if ( entries[i]._id === this.state.catselected ) {
            this.setState({
                catselected: "0"
            });
            break;
        }
    }
    this.props.worker.postMessage(['deleteCategories', entries]);
}

/**
 * Simple sleep function.
 */
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}