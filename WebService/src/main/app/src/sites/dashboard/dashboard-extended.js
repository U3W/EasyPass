import {dashboardAlerts} from "./const/dashboard.enum";

/**
 * Functions that add more functionality to the `Dashboard` component.
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
    // TODO @Seb Omit _isMounted more gracefully
    //  isMounted is bad style and should be now used
    if(this._isMounted) {
        console.log('Saved entries: ' + this.state.entries.entries);
        console.log('Saved categories: ' + this.state.entries.categories);
        const cmd = e.data[0];
        const data = e.data[1];
        console.log("WORKERCALL");
        console.log(cmd);
        console.log(data);
        switch (cmd) {
            case 'allEntries':
                //console.log("wow");
                this.state.entries.loadData(data);
                this.refresh();
                break;
            case 'saveEntry':
                this.copy("", dashboardAlerts.showAddedPass, data.ok);
                this.dismissAddPass();
                break;
            case 'saveCategory':
                this.copy("", dashboardAlerts.showAddedCat, data.ok);
                this.dismissAddCat();
                break;
        }
    }
}