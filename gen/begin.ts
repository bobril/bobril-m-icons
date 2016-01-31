import { IBobrilNode, style, styleDef } from "bobril";

export interface IIconData {
    color?: string;
    size?: number;
}

const iconStyle = styleDef({
    display: 'inline-block',
    fill: '#000',
    height: 24,
    width: 24,
    userSelect: 'none',
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1)'
});

function iconCreateFactoryCore(children: IBobrilNode | IBobrilNode[]): (data?: IIconData) => IBobrilNode {
    return (data?: IIconData) => {
        let color = data && data.color;
        let size = data && data.size || 24;
        let res = { tag: "svg", attrs: { viewBox: "0 0 24 24" }, children };
        style(res, iconStyle);
        if (color) style(res, { fill: color });
        if (size !== 24) style(res, { height: size, width: size });
        return res;
    };
}

function f(svgPath: string): (data?: IIconData) => IBobrilNode {
    let ch: IBobrilNode = { tag: "path", attrs: { d: svgPath } };
    return iconCreateFactoryCore(ch);
}

function f2(svgPath: (number | string)[]): (data?: IIconData) => IBobrilNode {
    let ch: IBobrilNode[] = [];
    for (let i = 0; i < svgPath.length; i += 2) {
        if (svgPath[i] !== 1)
            ch.push({ tag: "path", attrs: { opacity: svgPath[i], d: svgPath[i + 1] } });
        else
            ch.push({ tag: "path", attrs: { d: svgPath[i + 1] } });
    }
    return iconCreateFactoryCore(ch);
}

