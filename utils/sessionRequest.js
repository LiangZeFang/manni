
function NetRequest({url, data, dataType, success, fail, complete, method = "POST"}) {
    // wx.setStorageSync('xxxxxx', 'dddddd')

    var session_id = wx.getStorageSync('laravel_session');//本地取存储的sessionID
    if (session_id != "" && session_id != null) {
        var header = { 'content-type': 'application/json', 'Cookie': 'laravel_session=' + session_id }
    } else {
        var header = { 'content-type': 'application/json' }
    }
    console.log(header);
    // url = Server + url;
    wx.request({
        url: url,
        data: data,
        dataType: dataType,
        header: header,
        method: method,
        success: function(res){
            if (!session_id || session_id == undefined) {
                wx.setStorageSync('laravel_session', res.data.session_id) //如果本地没有就说明第一次请求 把返回的session id 存入本地
            }
            let data = res.data
            res['statusCode'] === 200 ? success(data) : fail(res)
        },
        fail: fail,
        complete: complete
    })
}

module.exports = {
    request: NetRequest
}