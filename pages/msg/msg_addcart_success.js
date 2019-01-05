Page({
    gocart: function(){
        wx.switchTab({
            url: '/pages/shopcart/shopcart'
        })
    },
    goindex: function(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }
});