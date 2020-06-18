const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", link = "") => {
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, (link && !body ? link : body));
        log('==============📣系统通知📣==============');
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    },
        write = (key, val) => {
            if (isSurge) return $persistentStore.write(key, val);
            if (isQuanX) return $prefs.setValueForKey(key, val);
        };
    const request = (method, params, callback) => {
        if (typeof params == "string") {
            params = { url: params };
        }
        const options = {
            url: params.url,
            body: params.data
        };
        method = method.toUpperCase();
        if (isSurge) {
            if (params.header) {
                options.header = params.header;
            }
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, response => { callback(response, null) });
        }
        if (isQuanX) {
            options.method = method;
            if (params.header) {
                options.headers = params.header;
            }
            if (options.method == "GET" && typeof options == "string") {
                options = {
                    url: options
                };
            }
            $task.fetch(options).then(response => {
                callback(response, null)
            }, reason => {
                callback(null, reason.error)
            });
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();


// 数据来源：https://github.com/NateScarlet/holiday-cn
// https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2020.json
const cnHoliday = {
    "2020": [{"name":"端午节","date":"2020-06-25","isOffDay":true},{"name":"端午节","date":"2020-06-26","isOffDay":true},{"name":"端午节","date":"2020-06-27","isOffDay":true},{"name":"端午节","date":"2020-06-28","isOffDay":false},{"name":"国庆节、中秋节","date":"2020-09-27","isOffDay":false},{"name":"国庆节、中秋节","date":"2020-10-01","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-02","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-03","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-04","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-05","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-06","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-07","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-08","isOffDay":true},{"name":"国庆节、中秋节","date":"2020-10-10","isOffDay":false}]
};
let isOffDay = false;

function CompareDate(d1, d2) {
    return ((new Date(d1.replace(/-0?/g, "\/"))) > (new Date(d2.replace(/-0?/g, "\/"))));
}

function getToday() {
    const date = new Date();
    const month = date.getMonth(),
        day = date.getDate(),
        week = date.getDay();
    isOffDay = week == 6 || !week;
    return date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
}

const today = getToday();
const holiday = cnHoliday[today.substring(0, 4)];

for (const key in holiday) {
    if (CompareDate(holiday[key]["date"], today)) {
        break;
    }
    if (holiday[key]["date"] == today) {
        isOffDay = holiday[key]["isOffDay"];
        break;
    }
}

function showRemind() {
    const corpId = "ding307c0c3ff8b707a435c2f4657eb6378f",
        link = "dingtalk://dingtalkclient/page/link?url=https%3A%2F%2Fattend.dingtalk.com%2Fattend%2Findex.html%3FcorpId%3D",
        node = (new Date()).getHours() > 12 ? "下班" : "上班";
    $hammer.alert("钉钉", node + "打卡了么？", "", link + corpId);
}

$hammer.log("===work checkin remind===")
$hammer.log(today, isOffDay)
$hammer.log("===work checkin remind===")
isOffDay || showRemind();