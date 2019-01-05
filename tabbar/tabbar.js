
//初始化数据
function tabbarinit() {
    return [
        {
            "current": 0,
            "pagePath": "/pages/index/index",
            "iconPath": "/images/index.png",
            "selectedIconPath": "/images/indexactive.png",
            "text": "首页"
        },
        {
            "current": 0,
            "pagePath": "/pages/web/web",
            "iconPath": "/images/website.png",
            "selectedIconPath": "/images/websiteactive.png",
            "text": "官网"

        },
        {
            "current": 0,
            "pagePath": "/pages/category/category",
            "iconPath": "/images/message.png",
            "selectedIconPath": "images/messageactive.png",
            "text": "消息"
        },
        {
            "current": 0,
            "pagePath": "/pages/shopcart/shopcart",
            "iconPath": "/images/cart.png",
            "selectedIconPath": "/images/cartactive.png",
            "text": "购物车"
        }
        ,
        {
            "current": 0,
            "pagePath": "/pages/me/me",
            "iconPath": "/images/personal.png",
            "selectedIconPath": "/images/personalactive.png",
            "text": "我的"
        }
    ]

}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
    var that = target;
    var bindData = {};
    var otabbar = tabbarinit();
    otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']//换当前的icon
    otabbar[id]['current'] = 1;
    bindData[bindName] = otabbar
    that.setData({ bindData });
}

module.exports = {
    tabbar: tabbarmain
}