new Vue({
    el : '#root',
    data: {
        prodId:'',
        prodIds:[
            {"value": "K1FR","deviceType":"WS5203-20"},
            {"value": "K1GI","deviceType":"YGJN-BE33-20"},
            {"value": "K1GJ","deviceType":"YGJN-BE33-40"}
        ],
        display: ["sn","vss1 ssid","vss1 5gssid","macaddr","wifiareacode","wificountrycode",],
        num: 1, 
        ip: 3,
        ssids:{},
        ssid:'',
        hashedText: '',
        snNumber: 0,
        mac:'',
        macs: [
            "70:66:B9",
            "C4:A1:AE",
            "38:FC:34",
            "3C:F6:92",
            "C0:BF:AC",
            "44:27:2E",
            "08:1A:FD",
            "E8:FF:98",
            "24:15:51",
            "58:95:7E",
            "AC:31:84",
            "50:3F:50",
            "0C:BE:F1",
            "AC:93:6A",
            "38:A4:4B",
            "38:22:F4",
            "A0:42:D1",
            "58:87:9F",
            "50:89:D1",
            "3C:A9:16",
            "9C:56:36",
            "50:4B:9E",
            "04:7A:AE",
            "50:78:B0",
            "E4:07:2B"
        ],
        telnetCheckList: ['SN', 'MAC','default'],
        Customize: [
            {"text": "diag set producttype swid0001\n"},
            {"text": "diag set userpwd admin\n"},
        ],
        textarea: '',
        userOui: '90:F6:44', // 用户输入的OUI
        randomString:'',
        wificountrycode:'',// 国家码
        wificountrycodes: [],// 国家码
        wifiareacode:'',// 区域码
        wifiareacodes : [
            {"value": "ce",
            "wificountrycode": [
                {"value": "russia","country":"俄罗斯"},
                {"value": "germany","country":"德国"},
                {"value": "brazil","country":"巴西"}]
            },
            {"value": "ccc",
            "wificountrycode": [
                {"value": "china","country":"中国"}]
            }
        ],// 区域码
        isSnPrefix: true,
        isUserOui: true,
        isCustomize: false,
        isTelnet: false,
        isMacOffset: false,
        dialogVisible: false
        },
    methods: {
        generateRandomSSIDs() {
            if (this.isProis) {
                return 0
            }
            for (let i = 0; i < this.num; i++) {
                this.ssids = {}
                let randomString = this.getRandomLetters(3, true)
                let lastCharAscii = randomString.charCodeAt(randomString.length - 1) % 3
                let offsetValue = this.shiftString(lastCharAscii)
                let hashedText = offsetValue + randomString
                let ssid = ''
                this.hashText(hashedText).then(data => {
                    ssid = 'HUAWEI-' + hashedText + data
                    Vue.set(this.ssids,`ssid${i}`,{"ssid":ssid,"linkType":"primary"})
                })
            }
        },
        telnet(index, event) {
            if (this.ssids[index].linkType == 'danger') {
                this.$message.warning('已生成Telnet命令，请不要重复点击')
                return 
            }
            if(!this.isSnPrefix) {
                this.generateRandomString()
            }
            if(this.randomString.length != 10){
                this.$message.error('输入的前缀不符合规范，请输入正确格式的前缀')
                return 
            }
            this.generateRandomMac()
            this.ssid = event.target.textContent
            this.snNumber += 1
            this.isTelnet = true
            Vue.set(this.ssids,index, { ...this.ssids[index], linkType: 'danger' })
        },
        generateRandomString() {
            // 生成前两位数字
            const digits = Math.floor(Math.random() * 90) + 10 // 生成1000到9999之间的数字
            // 生成三位字符串（可以是字母或字母加数字）
            const letters = this.getRandomLetters(3, false) // 只生成大写字母
            // 生成后五位数字
            // const moreDigits = Math.floor(Math.random() * 100000) + 1// 生成1到99999之间的数字
            const today = new Date()
            const year = today.getFullYear().toString().substring(2) // 获取年份的后两位
            const month = today.getMonth() + 1 // getMonth() 返回0-11，因此需要加1
            const date = today.getDate().toString().padStart(2, '0')

              // 将月份转换为字母（10月为A，11月为B，12月为C）
            let monthLetter = '';
            if (month === 10) {
                monthLetter = 'A';
            } else if (month === 11) {
                monthLetter = 'B';
            } else if (month === 12) {
                monthLetter = 'C';
            } else {
                // 其他月份保持不变，这里假设不需要转换
                monthLetter = month.toString();
            }
            // 拼接字符串
            this.randomString = digits.toString() + letters + year + monthLetter + date
        },
        getRandomLetters(length, includeNumbers) {
            let result = ''
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const numbers = '0123456789'
            const allCharacters = includeNumbers ? characters + numbers : characters
                for (var i = 0; i < length; i++) {
                    result += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length))
                }
            return result
        },
        async hashText(text) {
            try {
                const encodedText = new TextEncoder().encode(text)
                const hashBuffer = await crypto.subtle.digest('SHA-256', encodedText)
                const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
                this.hashedText = hashHex.toUpperCase().slice(0, 2)
                return hashHex.toUpperCase().slice(0, 2)
            } catch (error) {
                console.error('Error hashing text:', error)
            }
        },
        shiftString(shiftAmount) {
            // 获取后三位字符
            const lastThreeChars = this.prodId.slice(1)
            // console.log(lastThreeChars)
            // 根据位移量X移动字符
            return lastThreeChars.slice(-shiftAmount) + lastThreeChars.slice(0, -shiftAmount)
        },
        generateRandomMac() {
            // 验证用户输入的OUI
            const randomIndex = Math.floor(Math.random() * this.macs.length)
            let macAddress = this.userOui ||  this.macs[randomIndex]
            
            // 生成后三个字节的MAC地址
            for (let i = 0; i < 3; i++) {
                let hex = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
                macAddress += ':' + hex
            }
            
            this.mac = macAddress
        },
        convertToUppercase() {
            let value = this.prodId.toUpperCase()
            if (value.length > 4) {
                value = value.slice(0, 4)
            }
            this.prodId = value
        },
        goToExternalPage() {
            let url = 'http://192.168.' + this.ip + '.1/api/system/deviceinfo?type=wizards'
            window.open(url, '_blank')
            this.dialogVisible = false
        },
        queryWifiareacode(queryString, cb){
            let wifiareacode = this.wifiareacodes
            let results = queryString ? wifiareacode.filter(this.createFilter(queryString)) : wifiareacode
            // 调用 callback 返回建议列表的数据
            cb(results)
        },
        queryWificountrycode(queryString, cb){
            let wificountrycode = this.wificountrycodes
            let results = queryString ? wificountrycode.filter(this.createFilter(queryString)) : wificountrycode
            // 调用 callback 返回建议列表的数据
            cb(results)
        },
        queryProdId(queryString, cb){
            let prodId = this.prodIds
            let results = queryString ? prodId.filter(this.createFilter(queryString)) : prodId
            // 调用 callback 返回建议列表的数据
            cb(results)
        },
        createFilter(queryString) {
            return (restaurant) => {
                return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
            }
        },
        handleSelect(item) {
            this.wificountrycodes = item.wificountrycode
        },
        empty(){
            this.wificountrycodes = []
            this.wificountrycode = ''
        },
        fetchData() {
            const url = 'https://www.kdocs.cn/api/v3/ide/file/cvNy3BfpDDqK/script/V2-CEapF8X5bghtoZuorAuCI/sync_task'
            // 定义请求的参数
            const params = new URLSearchParams({
                sheet_name: "区域码"
            })
            // 将参数添加到URL中
            const urlWithParams = `${url}?${params}`

            const headers = {
                'Content-Type': 'application/json',
                'AirScript-Token': '1kC1D7BPGvrnQuKUcaIYii'
                // 你可以在这里添加更多的请求头
              }

            fetch('urlWithParams', { headers })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(json => {
                console.log(json);
              })
              .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
              });
        }
    },
    computed: {
        isProis(){
            this.ssids = {}
            this.isTelnet = false
            const regex = /^[A-Z0-9]{4}$/
            return !regex.test(this.prodId)
        },
        sn(){
            return this.randomString + this.snNumber.toString().padStart(6, '0')
        },
        formattedContent() {
        // 将换行符替换为 <br> 标签
            return this.textarea.replace(/\n/g, '<br>')
        },
        isWificountrycode() {
            return !this.wificountrycode.length == 0
        },
        isWifiareacode() {
            return !this.wifiareacode.length == 0
        }
    },
    watch: {
        isUserOui(newValue){
            if(newValue){
                this.userOui = this.mac.substring(0, 8)
            } else {
                this.userOui = ''
            }
        },
        isCustomize(newValue){
            if(newValue){
                this.Customize.forEach(item => {
                    this.textarea += item.text
                })
            } else {
                this.textarea = ''
            }
        }
    },
    mounted() {
        this.generateRandomString()
        this.fetchData()
    }
})