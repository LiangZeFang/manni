function handle(e, num) {
    var dataset = e.currentTarget.dataset;
    var componentId = dataset.componentId;
    var disabled = dataset.disabled;
    var quantity = +dataset.quantity;
    var min = dataset.min;
    var max = dataset.max;
    var pkey = dataset.pkey;
    if (disabled) return null;
    callback.call(this, pkey, componentId, quantity + num, min, max);
}

function callback(pkey, componentId, quantity, min, max) {
    quantity = +quantity;
    if(quantity < min)
        quantity = min;
    if(quantity > max)
        quantity = max;
    var e = {
        componentId, quantity, min, max, pkey
    };
    console.info('[zan:quantity:change]', e);
    if (this.handleZanQuantityChange) {
        this.handleZanQuantityChange(e);
    } else {
        console.warn('页面缺少 handleZanQuantityChange 回调函数');
    }
}
var Quantity = {
    _handleZanQuantityMinus(e) {
        handle.call(this, e, -1);
    }, _handleZanQuantityPlus(e) {
        handle.call(this, e, +1);
    }, _handleZanQuantityBlur(e) {
        var dataset = e.currentTarget.dataset;
        var componentId = dataset.componentId;
        var max = +dataset.max;
        var min = +dataset.min;
        var value = e.detail.value;
        var pkey = dataset.pkey;
        if (!value) {
            setTimeout(() => {
                callback.call(this, pkey, componentId, dataset.min, dataset.min, dataset.max);
            }, 16);
            callback.call(this, pkey, componentId, value, dataset.min, dataset.max);
            return '' + value;
        }
        value = +value;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        callback.call(this, pkey, componentId, value, dataset.min, dataset.max);
        return '' + value;
    }
};


module.exports = Quantity;