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