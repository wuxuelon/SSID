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
        ssids: [],
        ssid:'',
        hashedText: '',
        snNumber: 0,
        mac:'',
        tempPairname: '',
        tempPairpwd: '',
        pairname: '',
        pairpwd: '',
        ParentRouterMac: '',
        ChildRouterMac: '',
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
        dialogVisible: false,
        isSingleRouter: true,
        isPairname: false,
        isPairpwd: false,
        isPairInfo: false
        },
    methods: {
        generateRandomSSIDs() {
            if (this.isProis) {
                return 0
            }
            for (let i = 0; i < this.num; i++) {
                this.ssids = []
                let randomString = this.getRandomLetters(3, true)
                let lastCharAscii = randomString.charCodeAt(randomString.length - 1) % 3
                let offsetValue = this.shiftString(lastCharAscii)
                let hashedText = offsetValue + randomString
                let ssid = ''
                this.hashText(hashedText).then(data => {
                    ssid = 'HUAWEI-' + hashedText + data
                    // Vue.set(this.ssids,`ssid${i}`,{"ssid":ssid,"linkType":"primary"})
                    Vue.set(this.ssids, this.ssids.length, {"ssid":ssid,"linkType":"primary"})
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
            this.copyText('ssid-copy', index)
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
        generateString() {
            if (this.isPairname && this.tempPairname.length < 8) {
                this.$message.warning('请输入正确的组网名称')
                this.isPairInfo = false
                return 
            }
            if (this.isPairpwd && this.tempPairpwd.length < 8) {
                this.$message.warning('请输入正确的组网密码')
                this.isPairInfo = false
                return 
            }
            if (!this.isValidMacAddress(this.ParentRouterMac)) {
                this.$message.warning('请输入正确的母路由MAC')
                this.isPairInfo = false
                return 
            }
            if (!this.isValidMacAddress(this.ChildRouterMac)) {
                this.$message.warning('请输入正确的子路由MAC')
                this.isPairInfo = false
                return 
            }
            const length = Math.floor(Math.random() * (16 - 8 + 1)) + 8 // 随机长度8-16
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let pairname = ''
            let pairpwd = ''
            
            // 生成除最后两位外的字符
            for (let i = 0; i < length - 2; i++) {
                pairname += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            
            for (let i = 0; i < 8; i++) {
                pairpwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            // 生成最后两位，确保不包含0或o
            const validLastChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789'
            for (let i = 0; i < 2; i++) {
                pairname += validLastChars.charAt(Math.floor(Math.random() * validLastChars.length))
            }
            if(!this.isPairname) {
                this.pairname = pairname
                this.tempPairname = pairname
            } else {
                this.pairname = this.tempPairname
            }
            if(!this.isPairpwd) {
                this.pairpwd = pairpwd
                this.tempPairpwd = pairpwd
            } else {
                this.pairpwd = this.tempPairpwd
            }
            // this.pairname = pairname
            // this.pairpwd = pairpwd
            this.isPairInfo = true
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
        isValidMacAddress(mac) {
            const macAddressRegex = /^[0-9A-Fa-f]{12}$/
            return macAddressRegex.test(mac)
        },
        async copyText(ref, index) {
            if(ref == 'ssid-copy') {
                ref = ref + index
                await navigator.clipboard.writeText(this.$refs[ref][0].innerText)
            } else {
                await navigator.clipboard.writeText(this.$refs[ref].innerText)
            }
            // await navigator.clipboard.writeText(this.$refs[ref].innerText)
        }
    },
    computed: {
        isProis() {
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
    }
})