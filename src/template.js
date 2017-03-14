;(function(win){
  'use strict';

  var template = function(source, options){
    var ele = document.getElementById(source);
    var tpl = ele && ele.innerHTML || source;
    if (options.constructor !== Object) throw new Error('The second argument is not a Object');
    return render(tpl, options);
  };

  template.version = '1.0.1';

  var trim = template.trim = function(str){
    return str && str.toString ? str.toString().replace(/^\s+/, '').replace(/\s+$/, '') : str;
  };

  var jsonStringify = template.jsonStringify = function(v){
    var stringify = '';
    var curval;
    if (v === 'null') return String(v);
    switch(typeof v){
      case 'number':
      case 'boolean':
        return String(v);
      case 'string':
        return '"' + v + '"';
      case 'undefined':
      case 'function':
        return undefined;
    }
    if (v.constructor === Array){
      stringify += '[';
      for (var i = 0; i < v.length - 1; i++){
        curval = jsonStringify(v[i]);
        stringify += (curval === undefined ? null : curval) + ',';
      }
      stringify += jsonStringify(v[i]) + ']';
      return stringify;
    }else if (v.constructor === Object){
      stringify += '{';
      for (var i in v){
        if (v.hasOwnProperty(i)){
          curval = jsonStringify(v[i]);
          if (curval !== undefined){
            stringify += '"' + i + '":' + curval + ',';
          }
        }
      }
      stringify = stringify.slice(0, -1) + '}';
      return stringify;
    }else if (v.constructor === Date){
      return '"' + (v.toJSON ? v.toJSON() : v.toString()) + '"';
    }else if (v.constructor === RegExp){
      return '{}';
    }
  };

  var tplSetting = template.tplSetting = {
    openIdentify: '{{',
    closeIdentify: '}}'
  };

  var each = template.each = function(data, callback){
    var i, l;
    if (data.constructor === Array){
      for (i = 0, l = data.length; i < l; i++){
        callback.call(data, data[i], i, data);
      }
    }else {
      for (i in data){
        callback.call(data, data[i], i);
      }
    }
  };

  var filter = template.filter = function(name, fn){
    filter[name] = fn;
  };

  var render = template.render = function(tpl, data){
    var re = new RegExp(tplSetting.openIdentify + '([^' + tplSetting.closeIdentify + ']+)?' + tplSetting.closeIdentify, 'g');
    var reExpEach = /(^\s?(for|each))(.*)?/g;
    var reExpIf = /(^\s?(if|else))(.*)?/g;
    var reExpEnd = /(^\s?(\/if|\/else))(.*)?/g;
    var reExpEachEnd = /(^\s?(\/for|\/each))(.*)?/g;
    var reAtt = /[a-zA-Z0-9$_]([a-zA-Z0-9$_]+)?/g;
    var reExpNotNum = /^[a-zA-Z$_]([a-zA-Z0-9$_]+)?/;
    var match;
    var code = 'var r = [];\n';
    var cursor = 0;
    each(data, function(v, k){
      if (reExpNotNum.test(k)) code += 'var ' + k + ' = ' + jsonStringify(v) + ';\n';
    });
    var add = function(line, attr){
      if (attr && line.match(reExpEach)){
        var arr = line.match(reAtt);
        var defaultAs = arr[2] == 'as' || arr[2] == 'of';
        code += 'each(' + arr[1] + ',' + 'function($value, $index){\n';
        code += 'var $key = $index;\n';
        if (defaultAs && arr[3] && reExpNotNum.test(arr[3])) code += 'var ' + arr[3] + ' = $value;\n';
        else throw new Error('The each function as $value cannot begin with Numbers');
        if (defaultAs && arr[4] && reExpNotNum.test(arr[4])) code += 'var ' + arr[4] + ' = $index;\n';
        else throw new Error('The each function as $index cannot begin with Numbers');
        return;
      }
      if (attr && line.match(reExpIf)){
        var arr = line.match(/(\s?else\s+if|\s?if|\s?else|([\s\S]+))/g);
        code += /^\s?else/.test(arr[0]) ? '}\n' : '';
        code += arr[1] ? (arr[0] + '(' + arr[1] + ')') : arr[0];
        code += '{\n';
        return;
      }
      if (attr && line.match(reExpEachEnd)){
        code += '});\n';
        return;
      }
      if (attr && line.match(reExpEnd)){
        code += '}\n';
        return;
      }
      var Ltpl = attr ? line : ('"' + line.replace(/"/g, '\\"') + '"');
      if (Ltpl.indexOf('|') > 0){
        var tplPipe = Ltpl.split('|');
        var pipeArr = tplPipe[1].match(/([\s?\$_a-zA-Z0-9]+\:|(.+)?)/g);
        var pipeFnName = trim(pipeArr[0].replace(':', ''));
        if (typeof filter[pipeFnName] !== 'function') throw new Error('The ' + pipeFnName + ' is not a function');
        Ltpl = filter[pipeFnName] + '(' + tplPipe[0] + ',' + pipeArr[1] + ')';
      }
      code += 'r.push(' + Ltpl + ');\n';
    };
    while(match = re.exec(tpl)){
      var appendStr = tpl.slice(cursor, match.index);
      if (appendStr.length) add(appendStr);
      var attr = trim(match[1]);
      add(attr, true);
      cursor = match.index + match[0].length;
    }
    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return r.join("");';
    return new Function('each', code.replace(/[\r\n\t]/g, ''))(each);
  };

  if (typeof define === 'function') {
    define(function() {
      return template;
    });
  }else if (typeof exports !== 'undefined') {
    module.exports = template;
  }else {
    win.template = template;
  }
})(this);