import {dashboardAlerts} from "./const/dashboard.enum";

/**
 * Extends functionality of the `Dashboard` component.
 * This class is used specifically for logic operations.
 *
 * In order to use them, then need to be bound in the `Dashboard component`
 * like `this.[someFunc] = [importAlias].[someFunc].bind(this);`.
 */

export function baum () {
    console.log("BAUMI!!!");
    console.log(this.state);
}


/**
 * Updates the whole component.
 */
export function refresh() {
    this.setState({});
}


export function workerInit( e ) {
    const success = e.data === 'initDone';
    if (success) {
        this.props.worker.removeEventListener("message", this.workerInit);
        this.props.worker.addEventListener("message", this.workerCall);
        /**this.setState({
                workerInitialized: true
            }, () => this.props.worker.postMessage('initAck'));*/
        this.props.workerIsInitialized();
        this.props.worker.postMessage('initAck');
    }
}

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
        case 'saveCategory':
            this.copy("", dashboardAlerts.showAddedCat, data.ok);
            this.dismissAddCat();
            break;
    }

}

export function addPass(user, passwd, url, title, tags, catID) {
    const tabID = this.state.tabselected;
    this.props.worker.postMessage(['savePassword',
        {type: 'passwd', user: user, passwd: passwd, url: url, title: title, tags: tags, tabID: tabID, catID: catID, }]);
}

export function deletePass(id, rev) {
    console.log("DELETE!!!");
    console.log(id);
    console.log(rev);
    this.props.worker.postMessage(['deletePassword', {_id: id, _rev: rev}]);


    // ToDO call Kacpers method
    /**this.state.mock.deletePass(id);



    this.setState({
        currentPassDelete: id,
    });
    this.showDeletePopUp(dashboardAlerts.showDeletePassAlert, true);

    this.render();*/
}