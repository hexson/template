# template.js

前端模板输出引擎，不依赖第三方库，大小仅2.42KB，支持 `if` `else` `each`。

版本 [v1.0.0](#v100) [v1.0.1](#v101)

## v1.0.0

[点击下载](//hexson.win/lib/template/1.0.0/template.min.js)

### 栗子

```html
<!-- 引入js文件 -->
<script src="template.min.js"></script>

<!-- html模板 -->
<script id="tpl" type="text/template">
  <h3>Hello, {{ name }}!</h3>
  <p>hobby: {{other.hobby}}</p>
  {{if location == 'hangzhou'}}
    <p>You are in hangzhou.</p>
  {{/if}}
  {{else}}
    <p>You are not in hangzhou.</p>
  {{/else}}
  <p>Your friends:</p>
  <ul>
    {{each friends as val i}}
      <li>{{val}}</li>
    {{/each}}
  </ul>
</script>
```

```javascript
var data = {
  name: "Hexson",
  location: "hangzhou",
  friends: [
    "Tom",
    "David",
    "Mark",
    "Richard",
    "Zack"
  ],
  other: {
    hobby: "music read coding..."
  }
};

/* output html */
document.write(template('tpl', data));
```

![栗子](https://wx2.sinaimg.cn/large/005EkSOcly9fdvu2ymplej30g408w0u0.jpg)

### 补充

```javascript
/*
 * 支持连续判断:
 * {{if true}}
 * ...
 * {{else if false}}
 * ...
 * {{else}}
 * ...
 * {{/else}}
 * 
 */
```

### API

#### template: String id, {Object data}

id即为模板的id，该方法会在内部自动获取模板内容；data为渲染模板时的数据，其类型为object，数据内部可以是任何类型。调用： `template(id, data)`

#### template.render: String tpl, {Object data}

该方法不同于上一个方法，内部不会自动获取模板内容，而是需要将模板字符串直接传入，其他一样。调用： `template.render(tpl, data)`

#### template.trim: String str

该方法会将传入参数的头尾空格去掉，如果是特殊类型，如 `null` 等会直接返回本身。调用： `template.trim(str)`

#### template.jsonStringify: Any value

该方法会将传入的参数进行 `json` 序列化的操作。调用： `template.jsonStringify(value)`

#### template.tplSetting: Options value

##### template.tplSetting.openIdentify: 引擎解析语法开始标识，默认 `{{`

##### template.tplSetting.closeIdentify: 引擎解析语法结束标识，默认 `}}`

## v1.0.1

[点击下载](//hexson.win/lib/template/1.0.1/template.min.js)

新增过滤器输出，解决需要格式化日期输出或者其他定制输出的情况。

### 使用过滤器

```html
<!-- 引入js文件(v1.0.1) -->
<script src="template.min.js"></script>

<!-- html模板 -->
<script id="tpl" type="text/template">
  <p>Date: {{date | formatdate: 'yyyy-MM-dd hh:mm:ss'}}</p>
</script>
```

```javascript
var data = {
  date: 1490233347
};

/* filter => formatdate */
template.filter('formatdate', function(date, format){
  date = new Date((date + '').length != 10 ? +date : date * 1000);
  var map = {
    M: date.getMonth()+1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    S: date.getMilliseconds()
  };
  format = format.replace(/([yMdhmsS])+/g, function(all, m){
    var v = map[m];
    if (v !== undefined && all.length > 1){
      v = '0' + v;
      v = v.substr(v.length - 2);
      return v;
    }else if (m === 'y'){
      return (date.getFullYear() + '').substr(4 - all.length);
    }
    return all;
  });
  return format;
});

/* output html */
document.write(template('tpl', data));
```

### API

#### template.filter: String name, Function filter

该方法接收两个参数，第一个为过滤器名称，第二个为自定义函数，函数内部需返回一个最终的value。调用：

```html
<p>{{string | filterName: args...}}</p>
```

```javascript
template.filter('filterName', function(string, args...){
  /* to do something */
  return string;
});
```

还有很多想法有待去实现，我会尽量抽时间去补充。若您有问题，欢迎Issues，谢谢