function handle(e, num) {
    var dataset = e.currentTarget.dataset;
    var componentId = dataset.componentId;
    var disabled = dataset.disabled;
    var quantity = +dataset.quantity;
    var min = dataset.min;
    var max = dataset.max;
    var pid = dataset.pid;
    if (disabled) return null;
    callback.call(this, pid, componentId, quantity + num, min, max);
}

function callback(pid, componentId, quantity, min, max) {
    quantity = +quantity;
    if (quantity < min)
        quantity = min;
    if (quantity > max)
        quantity = max;
    var e = {
        componentId, quantity, min, max, pid
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
        var pid = dataset.pid;
        if (!value) {
            setTimeout(() => {
                callback.call(this, pid, componentId, dataset.min, dataset.min, dataset.max);
            }, 16);
            callback.call(this, pid, componentId, value, dataset.min, dataset.max);
            return '' + value;
        }
        value = +value;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        callback.call(this, pid, componentId, value, dataset.min, dataset.max);
        return '' + value;
    }
};

// 商品购物车数量变更处理
function setShopNum(num, proindex) {
    wx.request({
        url: app.ajaxUrl.server_api_url + 'shopcart/change-num',
        header: { "Authorization": "Bearer " + wx.getStorageSync('server_token') },
        method: 'POST',
        data: { 'num': num, 'key': proindex },
        dataType: 'json',
        success: function (res) {
            if (res.data.error == 0)
                return true;
            else {
                return res.data;
            }
        }
    })
}
// 商品购物车数量变更处理
var QuantityForShopCart = {
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
        if (!value) {
            setTimeout(() => {
                callback.call(this, componentId, min);
            }, 16);
            callback.call(this, componentId, value);
            return '' + value;
        }
        value = +value;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        callback.call(this, componentId, value);
        return '' + value;
    }
};

module.exports = Quantity;