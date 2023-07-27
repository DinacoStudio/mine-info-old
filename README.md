<a name="MineInfo"></a>

## MineInfo Old
**Kind**: global class

* [MineInfo](#MineInfo)
    * [new MineInfo(logging, api_log, ping_log)](#new_MineInfo_new)
    * [.getInfo(address, port)](#MineInfo+getInfo) ⇒ <code>Promise</code>

<a name="new_MineInfo_new"></a>

### new MineInfo(logging, api_log, ping_log)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| logging | <code>Boolean</code> | <code>false</code> | Сохранение логов в файл log.txt |
| api_log | <code>Boolean</code> | <code>false</code> | Логи от api |
| ping_log | <code>Boolean</code> | <code>false</code> | Логи от ping |

**Example**
```js
const Mine = new MineInfo(true, true, true);
```
<a name="MineInfo+getInfo"></a>

### mineInfo.getInfo(address, port) ⇒ <code>Promise</code>
Получение формированного объекта состоящего из самых важных данных о сервере

**Kind**: instance method of [<code>MineInfo</code>](#MineInfo)

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | Ip адрес сервера |
| port | <code>number</code> | Порт сервера |

**Example**
```js
const Mine = new MineInfo(true, true, true);
Mine.getInfo("MC.Hypixel.net").then(e => console.dir(e));
```
