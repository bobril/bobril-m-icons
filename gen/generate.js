var fs = require("fs");
var path = require("path");
var svgs = Object.create(null);
function humanize(str) {
    var frags = str.split('_');
    for (var i = 1; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    if (/^[0-9]/.test(frags[0]))
        frags[0] = '_' + frags[0];
    return frags.join('');
}
function svgCircle(cx, cy, r) {
    return "M" + (cx - r).toString() + " " + cy.toString() + "A" + r.toString() + " " + r.toString() + " 0 1 0 " + (cx + r).toString() + " " + cy.toString()
        + "A" + r.toString() + " " + r.toString() + " 0 1 0 " + (cx - r).toString() + " " + cy.toString() + "Z";
}
function recursiveSearch(fspath, dir) {
    var nest = fs.readdirSync(fspath);
    nest.forEach(function (n) {
        var mn = path.join(fspath, n);
        var stats = fs.statSync(mn);
        if (stats.isDirectory()) {
            if (dir.length > 0 && dir[dir.length - 1] == "svg" && n == "design")
                return;
            dir.push(n);
            recursiveSearch(mn, dir);
            dir.pop();
            return;
        }
        if (!stats.isFile())
            return;
        var match = /^ic_(.+)_24px.svg$/.exec(n);
        if (!match)
            return;
        var niceName = humanize(dir[0] + "_" + match[1]);
        var content = fs.readFileSync(mn, 'utf-8');
        content = content.replace(/ fill="[^"]*"/g, "");
        content = content.replace(/ fill-opacity=/g, " opacity=");
        content = content.replace(/<svg[^>]*>/, "");
        content = content.replace(/<\/svg>/, "");
        content = content.replace(/<g>(.*)<\/g>/, "$1");
        var svgPath = [];
        while (content.length > 0) {
            match = /^<path d=\"([^\"]+)\"\/>/g.exec(content);
            if (match) {
                svgPath.push(1, match[1]);
                content = content.substr(match[0].length);
                continue;
            }
            match = /^<path opacity=\"([^\"]+)\" d=\"([^\"]+)\"\/>/g.exec(content);
            if (match) {
                svgPath.push(parseFloat(match[1]), match[2]);
                content = content.substr(match[0].length);
                continue;
            }
            match = /^<path d=\"([^\"]+)\" opacity=\"([^\"]+)\"\/>/g.exec(content);
            if (match) {
                svgPath.push(parseFloat(match[2]), match[1]);
                content = content.substr(match[0].length);
                continue;
            }
            match = /^<circle cx=\"([^\"]+)\" cy=\"([^\"]+)\" r=\"([^\"]+)\"\/>/g.exec(content);
            if (match) {
                svgPath.push(1, svgCircle(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])));
                content = content.substr(match[0].length);
                continue;
            }
            console.log(mn);
            console.log(content);
            return;
        }
        for (var i = 2; i < svgPath.length; i += 2) {
            if (svgPath[i - 2] == svgPath[i]) {
                svgPath[i - 1] += svgPath[i + 1];
                svgPath.splice(i, 2);
                i -= 2;
            }
        }
        if (svgPath.length === 2 && svgPath[0] === 1) {
            svgs[niceName] = svgPath[1];
        }
        else {
            svgs[niceName] = svgPath;
        }
    });
}
recursiveSearch("../node_modules/material-design-icons", []);
var out = fs.readFileSync('begin.ts', 'utf-8');
var keys = Object.keys(svgs);
keys.sort();
for (var i = 0; i < keys.length; i++) {
    out += 'export const ' + keys[i] + ' = f';
    var svgPath = svgs[keys[i]];
    if (typeof svgPath !== 'string') {
        out += "2";
    }
    out += "(" + JSON.stringify(svgPath) + ");\n";
}
fs.writeFileSync('../index.ts', out);
