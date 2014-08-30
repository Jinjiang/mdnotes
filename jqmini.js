/// jQuery mini ///

function $(selector) {
    return document.querySelectorAll(selector);
}
function $1(selector) {
    return document.querySelector(selector);
}
function $new(tag) {
    return document.createElement(tag);
}
function $each(arr, handler) {
    Array.prototype.forEach.call(arr, handler);
}


