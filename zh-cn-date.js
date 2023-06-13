

// 时间转换函数(参数传入，时间格式，或者空值,除时间格式外，都视为空值)
// 支持格式YYYY-MM-DD hh:mm:ss YYYY年MM月DD日hh时mm分ss秒
function getdate(date) {
    // 时间处理对象数组
    var formatList = [
        {
            value: 'W',//周
            key: 'Day',//时间函数名称
            index: 1,
            text: "周",
            format: ['一', '二', '三', '四', '五', '六', '日']
        },
        {
            value: 'Y',//年
            key: 'FullYear',//时间函数名称
            index: 4,
            text: "年",
            format: "YYYY",
            replace: "-",
            reg: "^\[0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}$"

        },
        {
            value: 'M',//单位
            key: 'Month',//时间函数名称
            index: 2,
            text: "月",
            format: "YYYY-MM",
            replace: "-"
        },
        {
            value: 'D',//单位
            key: 'Date',//时间函数名称
            index: 2,
            text: "日",
            format: "YYYY-MM-DD",
            replace: " "

        },
        {
            value: 'h',//单位
            key: 'Hours',//时间函数名称
            index: 2,
            text: "时",
            format: "YYYY-MM-DD hh",
            replace: ":"

        },
        {
            value: 'm',//单位
            key: 'Minutes',//时间函数名称
            index: 2,
            text: "分",
            format: "YYYY-MM-DD hh:mm",
            replace: ":"
        },
        {
            value: 's',//单位
            key: 'Seconds',//时间函数名称
            index: 2,
            text: "秒",
            format: "YYYY-MM-DD hh:mm:ss",
            replace: ":"
        },
        {
            value: 'stamp',//单位
            key: 'Time',//时间函数名称
            index: 13,
            text: "时间戳"
        },

    ]
    // 判断传入的值是否存在，如果存在转换时间戳，默认只会补年份
    if (date) {
        let nowday = setdatedata()
        // 匹配,进行转换
        formatList.forEach((item) => {
            // 替换值
            if (date.indexOf(item.text) > -1) {
                date = date.replace(item.text, item.replace)
            }
            // 正则判断查找到时替换时间格式
            var index = date.search(item.reg)
            if (item.reg && index === -1) {
                date = nowday[item.value] + "-" + date
            }
        })
    }

    // 格式化当前时间对象(默认加载全部参数)
    function setdatedata(dateday) {
        // 格式错误，当天日期
        if (new Date(dateday) == 'Invalid Date' || !dateday) {
            dateday = new Date()
        }
        var data = {}
        // 遍历时间函数，把有用的数据存入对象中
        formatList.forEach((item, index) => {
            var value = new Date(dateday)["get" + item.key]()

            // 天数需要补一
            if (index === 2) value++
            // 小于10转化位数
            if (value < 10 && index > 1) value = "0" + value
            // 周需要把0转化成7
            if (item.value === "W") {
                if (value === 0) value = 7;
                data.w = "周" + item.format[value - 1]
            }
            // 同步数据
            data[item.value] = value
        })
        data.Date = new Date(dateday)
        return data
    }
    // 获取当前时间对象
    let datejson = setdatedata(date)
    // 默认返回以-分割的时间函数(时间格式)
    datejson.__proto__.format = function (str) {
        // 查找当前传入字段是否符合查询条件，格式不完整默认补位
        var obj = formatList.find(item => item.format === str || item.value === str)
        if (!obj) {
            str = "YYYY-MM-DD hh:mm:ss"
        } else {
            str = obj.format
        }
        // 遍历时间函数，把有用的数据存入对象中
        formatList.forEach((item) => {
            // 获取要替换的事件函数
            str = str.replace(item.value.repeat(item.index), this[item.value])
        })
        return str
    }
    // 时间的加减
    datejson.__proto__.sum = function (num, type) {
        // 取出当前值，进位计算
        if (this[type]) {
            // 月份需要减一
            if (type === 'M') {
                num--
                // 周需要转换成7天
            } else if (type === 'W') {
                num = num * 7
                type = "D"
            }
            // 判断当前计算的是什么
            var data = formatList.find(item => item.value === type)
            // 计算时间
            var value = this.Date["set" + data.key](this[type] / 1 + num)
            // 同步当前时间
            this.Date = new Date(value)
        }
        return setdatedata(this.Date)
    }
    // 返回一段时间范围内的所有时间(最小单位是天)
    datejson.__proto__.frametime = function (start, end, type) {
        // 类型默认为天
        if (!type) type = 'D'
        // 开始时间
        let startdate = setdatedata(start).stamp
        // 结束时间
        let enddate = setdatedata(end).stamp
        // 如果时间顺序为反向，旋转顺序
        if (startdate > enddate) {
            startdate = setdatedata(end).stamp
            enddate = setdatedata(start).stamp

        }
        var list = []
        // 计算时间差然后进行遍历
        for (let j = 0; j <= Math.abs(startdate - enddate); j += 86400000) {
            let str = setdatedata(startdate + j).format(type)
            if (list.findIndex(em => em.format(type) === str) === -1) {
                list.push(setdatedata(startdate + j))
            }
        }
        return list
    }
    // 返回当前时间下的拓展周函数
    datejson.__proto__.weekInfo = function () {
        // 获取今年有多少天
        var startyear = this.format("Y") + "-01-01"
        var endyear = this.format("Y") + "-12-31"
        // 获取天数数组
        var yearlist = this.frametime(startyear, endyear)
        // 查找数组中第一个周日,之后的每7天存入一个数组
        var firstweek = yearlist.findIndex(em => em.W === 7)
        // 计算出一年中的周数组
        var yearWeek = []
        yearlist.forEach((item, index) => {
            var key = Math.ceil((index - firstweek) / 7)
            if (!yearWeek[key]) {
                yearWeek[key] = [item]
            } else {
                yearWeek[key].push(item)
            }
            // 按年说法中的第几周
            if (item.format("D") === this.format("D")) {
                // 当前年下的周
                this.YW = key + 1
                // 计算开始周
                this.SW = item.sum(-(item.W - 1), 'D')
                // 计算结束周
                this.EW = item.sum(7 - item.W, 'D')
            }
        })
        // 计算出一月中的周数组
        // 获取今年有多少天
        var startweek = this.format("M") + "-01"
        var endweek = setdatedata(startweek).sum(1, "M").sum(-1, "D").format("D")
        // 获取天数数组
        var weeklist = this.frametime(startweek, endweek)
        var monthWeek = []
        // 提前出月数组
        weeklist.forEach((item, index) => {
            var key = Math.ceil((index - firstweek) / 7)
            if (!monthWeek[key]) {
                monthWeek[key] = [item]
            } else {
                monthWeek[key].push(item)
            }
            // 按年说法中的第几周
            if (item.format("D") === this.format("D")) {
                // 当前年下的周
                this.MW = key + 1
            }
        })
        return this
    }
    // 返回格式化的时间对象
    return datejson
}
