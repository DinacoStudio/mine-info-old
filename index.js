const fs = require('fs')
const colors = require('colors/safe');
const needle = require('needle')

class MineInfo {
    #api = [
        {
            "sample": "api.mcsrvstat.us",
            "host": "https://api.mcsrvstat.us",
            "api": "https://api.mcsrvstat.us/2/",
        },
        {
            "sample": "api.mcstatus.io",
            "host": "https://mcstatus.io/",
            "api": "https://api.mcstatus.io/v2/status/java/",
        },
        {
            "sample": "eu.mc-api.net",
            "host": "https://eu.mc-api.net/v3/server/ping/",
            "api": "https://eu.mc-api.net/v3/server/ping/",
        },
        {
            "sample": "api.minetools.eu",
            "host": "https://api.minetools.eu/ping/",
            "api": "https://api.minetools.eu/ping/"
        },
        {
            "sample": "mcstatus.snowdev.com.br",
            "host": "https://mcstatus.snowdev.com.br",
            "api": "https://mcstatus.snowdev.com.br/api/query/v3/"
        },
        {
            "sample": "mcapi.xdefcon.com",
            "host": "https://mcapi.xdefcon.com/",
            "api": "https://mcapi.xdefcon.com/server/"
        },
        {
            "sample": "mcapi.us",
            "host": "https://dinaco.ds1nc.ru",
            "api": "https://mcapi.us/server/status?ip="
        },
        {
            "sample": "dinaco.ds1nc.ru",
            "host": "https://dinaco.ds1nc.ru",
            "api": "https://dinaco.ds1nc.ru/mine/json.php?host="
        }
    ]
    #aliveApi = {}
    #logging = true
    #ping_log = false
    #api_log = false
    /**
     * @param {Boolean} logging  Сохранение логов в файл log.txt
     *  @param {Boolean} api_log Логи от api
     * @param {Boolean} ping_log Логи от ping
     */
    constructor(logging = false, api_log = false, ping_log = false) {
        this.#logging = logging
        this.#api_log = api_log
        this.#ping_log = ping_log
    }
    /**
     * @param {Array} arr 
     */
    #Truphy(arr) {
        const notruphy = [null, 0, undefined, '', NaN, false, "127.0.0.1", "Connect to"]
        let finded = arr.find(e => !notruphy.includes(e));
        return finded ? finded : null
    }
    /**
     * @param {string} url 
     */
    #get = (url) => {
        return new Promise(async (resolve, reject) => {
            needle('get', url, {}, { json: true, response_timeout: 15_000 })
                .then(data => {
                    let body = data.raw.toString();
                    resolve({ body: JSON.parse(body) })
                })
                .catch(e => reject(e))
        })
    }
    /**
     * @param {string} url
     */
    #isAlive = (url) => {
        return new Promise((resolve, reject) => {
            needle.get(url, (e, r) => {
                if (e) {
                    reject({ alive: false, error: e.message })
                } else {
                    resolve({
                        alive: r.statusCode === 200,
                        status: r.statusCode,
                        url: url
                    })
                }
            })
        })
    }
    /**
     * 
     * @param {string} address Ip адрес сервера
     * @param {number} port Порт сервера
     * @description Получение формированного объекта состоящего из самых важных данных о сервере
     * @returns {Promise} 
     */
    async getInfo(address, port) {
        /**
         * Получение списка api которые проходят ping
         */

        if (!address.trim()) throw new Error("IP нихуя нету")

        this.#ping_log && console.time(colors.green("ping"))
        /**
         * Ебаный ping api
         */
        for (let api_object of this.#api) {
            (await this.#isAlive(api_object.host)
                .catch(e => console.log(e))
            ).alive ? this.#aliveApi[api_object.sample] = api_object : null
        }
        this.#ping_log && console.timeEnd(colors.green("ping"))

        if (!Object.keys(this.#aliveApi).length) throw new Error("Ошибка нету доступа ни к одной api")

        let response = {}
        this.#api_log && console.time(colors.green("api"))

        /**
         * Дохуя API
         */
        this.#aliveApi["api.mcsrvstat.us"] && (response.mcsrvstat = (await this.#get(`${this.#aliveApi["api.mcsrvstat.us"].api}${address}${port ? `:${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с api.mcsrvstat.us"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["eu.mc-api.net"] && (response.mcapi = (await this.#get(`${this.#aliveApi["eu.mc-api.net"].api}${address}${port ? `:${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с eu.mc-api.net"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["mcapi.us"] && (response.mcapius = (await this.#get(`${this.#aliveApi["mcapi.us"].api}${address}${port ? `&${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с mcapi.us"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["api.mcstatus.io"] && (response.mcstatus = (await this.#get(`${this.#aliveApi["api.mcstatus.io"].api}${address}${port ? `:${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с api.mcstatus.io"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["api.minetools.eu"] && (response.minetools = (await this.#get(`${this.#aliveApi["api.minetools.eu"].api}${address}${port ? `/${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с api.minetools.eu"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["mcstatus.snowdev.com.br"] && (response.snowdev = (await this.#get(`${this.#aliveApi["mcstatus.snowdev.com.br"].api}${address}${port ? `:${port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с mcstatus.snowdev.com.br"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#aliveApi["mcapi.xdefcon.com"] && (response.xdefcon = (await this.#get(`${this.#aliveApi["mcapi.xdefcon.com"].api}${address}${port ? `:${port}` : ""}/full/json`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с mcapi.xdefcon.com"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        let temp_port = this.#Truphy([response?.mcapi?.dns?.port, response?.mcstatus?.port, response?.mcsrvstat?.port]);
        this.#aliveApi["dinaco.ds1nc.ru"] && (response.mine = (await this.#get(`${this.#aliveApi["dinaco.ds1nc.ru"].api}${address}${temp_port ? `&port=${temp_port}` : ""}`).catch((e) => {
            console.warn(colors.red("Невозможно получить данные с dinaco.ds1nc.ru"));
            this.#logging && fs.appendFileSync("log.txt", e.toString() + '\n');
        }))?.body)
        this.#api_log && console.timeEnd(colors.green("api"))



        /**
         * Парсинг залупы
         */
        const { mcapi, mcsrvstat, mcstatus, minetools, snowdev, xdefcon, mcapius, mine } = response

        const online = this.#Truphy(
            [
                mcapi?.online,
                mcsrvstat?.debug?.ping,
                mcstatus?.online,
                snowdev?.online,
                xdefcon?.serverStatus === 'online',
                mcapius?.online,
                mine.status === 'Online'
            ]);

        const version = {
            name: this.#Truphy(
                [
                    mcapi?.version?.name,
                    mcstatus?.version?.name_clean,
                    `${mcsrvstat?.software} ${mcsrvstat?.version}`,
                    minetools?.version?.name,
                    snowdev?.version,
                    xdefcon?.version,
                    mcapius?.server?.name,
                    mine?.version?.version
                ]),
            protocol: this.#Truphy(
                [
                    mcsrvstat?.protocol,
                    mcapi?.version?.protocol,
                    mcstatus?.version?.protocol,
                    minetools?.version?.protocol,
                    mcapius?.server?.protocol,
                    mine?.version?.protocol
                ]),
            software: this.#Truphy([mcsrvstat?.software, mcstatus?.software])
        };
        const motd = this.#Truphy(
            [
                mcsrvstat?.motd?.clean,
                mcstatus?.motd?.clean,
                minetools?.description,
                snowdev?.motd,
                xdefcon?.motd?.text,
                mcapius?.motd,
                mine?.motd?.clean?.extra?.reduce((prev, next) => { return { text: prev.text + next.text } }).text
            ])

        const players = {
            online: this.#Truphy(
                [
                    mcsrvstat?.players?.online,
                    mcapi?.players?.online,
                    mcstatus?.players?.online,
                    minetools?.players?.online,
                    snowdev?.players_online,
                    xdefcon?.players?.now,
                    mine?.players?.online
                ]),
            max: this.#Truphy(
                [
                    mcsrvstat?.players?.max,
                    mcapi?.players?.max,
                    mcstatus?.players?.max,
                    minetools?.players?.max,
                    snowdev?.max_players,
                    xdefcon?.maxplayers,
                    xdefcon?.players?.max,
                    mine?.players?.max
                ]),
            list: this.#Truphy(
                [
                    mcsrvstat?.players?.list,
                    mcapi?.players?.sample,
                    mcstatus?.players?.list,
                    minetools?.players?.sample,
                    xdefcon?.players?.sample
                ])
        }
        const favIcon = this.#Truphy(
            [
                mcsrvstat?.icon,
                mcapi?.favicon_base64,
                mcstatus?.icon, minetools?.favicon
            ])

        const hostInfo = {
            ip: this.#Truphy(
                [
                    mcsrvstat?.ip,
                    mcapi?.dns?.ip,
                    mcstatus?.host
                ]),
            port: this.#Truphy(
                [
                    mcapi?.dns?.port,
                    mcstatus?.port,
                    mcsrvstat?.port,
                ])
        };

        const modInfo = {
            type: this.#Truphy(
                [
                    mcapi?.modinfo?.type, null
                ]),
            mods: this.#Truphy(
                [
                    mcapi?.modinfo?.modList,
                    mcstatus?.mods,
                    null
                ])
        };

        return (mcsrvstat?.debug?.ping || mcapi?.online || mcstatus?.online) ? {
            online: online,
            version: version,
            motd: motd,
            players: players,
            favIcon: favIcon,
            hostInfo: hostInfo,
            modInfo: modInfo
        } : {
            online: online,
            hostInfo: hostInfo,
        }
    }
}



module.exports = { MineInfo }