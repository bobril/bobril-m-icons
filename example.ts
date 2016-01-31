import * as b from "bobril";
import * as icons from "./index";

let allicons = icons;

let allnames = Object.keys(allicons);

interface IOneIconData {
    name: string;
    factory: (data?: icons.IIconData) => b.IBobrilNode;
}

interface IOneIconCtx extends b.IBobrilCtx {
    data: IOneIconData;
    over: boolean;
}

let oneIcon = b.createComponent<IOneIconData>({
    init(ctx: IOneIconCtx) {
        ctx.over = false;
    },
    render(ctx: IOneIconCtx, me: b.IBobrilNode) {
        me.tag = "div";
        me.style = { display: "inline-block", background: ctx.over ? "#4FC3F7" : "#E3F2FD", width: "25em", padding: 4, margin: 4 };
        me.children = [ctx.data.factory({ color: ctx.over ? "#000" : "#212121" }), " " + ctx.data.name]
    },
    onMouseEnter(ctx: IOneIconCtx) { ctx.over = true; b.invalidate(ctx); },
    onMouseLeave(ctx: IOneIconCtx) { ctx.over = false; b.invalidate(ctx); }
});

b.init(() => {
    return [
        { tag: "h1", children: "Bobril Material Icons" },
        { tag: "a", attrs: { href: "https://www.npmjs.com/package/material-design-icons" }, children: "Original source npm" },
        { tag: "div", children: allnames.map(n => oneIcon({ name: n, factory: allicons[n] })) }
    ]
});
