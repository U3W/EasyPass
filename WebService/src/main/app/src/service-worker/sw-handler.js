
/**
 * Handler for the Service Worker of EasyPass.
 */


export function register() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                swLogger('Registered', registration);
            })
            .catch(function(error) {
                swLoggerError('Registration failed', error);
            });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister().then(r => {
                    if (r) {
                        swLogger('Unregistered', registration)
                    } else  {
                        swLoggerError('Registration failed', registration);
                    }
                })
            }
        })
    }
}


export function swLogger(header, ...infos) {
    const swStyle = [
        `background: salmon`,
        `border-radius: 0.5em`,
        `color: white`,
        `font-weight: bold`,
        `padding: 2px 0.5em`,
    ];
    console.group('%cservice-worker%c ' + header, swStyle.join(';'), '');
    infos.map(info => console.log(info));
    console.groupEnd();
}

export function swLoggerError(header, ...infos) {
    const swStyle = [
        `background: red`,
        `border-radius: 0.5em`,
        `color: white`,
        `font-weight: bold`,
        `padding: 2px 0.5em`,
    ];
    console.group('%cservice-worker%c ' + header, swStyle.join(';'), '');
    infos.map(info => console.error(info));
    console.groupEnd();
}