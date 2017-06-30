/*!
 * template - v2.0.0
 * https://github.com/hexson/template
 * hexson 2017
 */

;(function(global){
  'use strict';

  /*!
   * @name    template
   * @param   {String}  模板ID
   * @param   {Object}  模板数据
   * @return  {String}  渲染好的HTML字符串
   */
  var template = function(id, data){
    if (_cache.hasOwnProperty(id)) return _cache[id](data);
    var str = document.getElementById(id).innerHTML;
    _cache[id] = template.render(str);
    return _cache[id](data);
  };


  template.version = '2.0.0';
  template.startTag = '{{';
  template.endTag = '}}';


  var isArray = Array.isArray || function(obj){
    return ({}).toString.call(obj) === '[object Array]';
  };


  /*!
   * @name    trim
   * @param   {String}   字符串
   * @return  {String}   删除头尾空格的字符串
   */
  var trim = template.trim = function(string){
    return String(string).replace(/^\s+/, '').replace(/\s+$/, '');
  };


  /*!
   * @name    each
   * @param   {Object}    数组或者对象
   * @param   {Function}  遍历变量的回调函数
   */
  var each = template.each = function(data, callback){
    var i;
    if (isArray(data)){
      for (i = 0; i < data.length; i++){
        callback.call(data, data[i], i, data);
      }
    }else {
      for (i in data){
        callback.call(data, data[i], i);
      }
    }
  };


  var escapeMap = {
    '<': '&#60;',
    '>': '&#62;',
    '"': '&#34;',
    "'": '&#39;',
    '&': '&#38;'
  };

  /*!
   * @name    each
   * @param   {String}  模板字符串
   * @return  {String}  被转码的模板字符串
   */
  var escapeHTML = template.escapeHTML = function(content){
    return String(content).replace(/&(?![\w#]+;)|[<'">]/g, function($1){
      return escapeMap[$1];
    })
  }


  /*!
   * @name    filter
   * @param   {String}    管道函数名称
   * @param   {Function}  管道函数
   */
  var filter = template.filter = function(name, fn){
    filter[name] = fn;
  };


  var _cache = template.cache = {};


  /*!
   * @name    render
   * @param   {String}     模板字符串
   * @return  {Function}   处理后的渲染模板函数
   */
  var render = template.render = function(str){
    var sTag = template.startTag;
    var eTag = template.endTag;
    var $RECHAT = new RegExp(sTag + '([^' + eTag + ']+)?' + eTag, 'g');
    var preCode = { $each: 'template.each,' };
    var tempCode = '$out=[];';
    str = str.replace(/<!--.*-->/g, '');
    each(str.split(sTag), function(code){
      code = code.split(eTag);
      var $0 = code[0];
      var $1 = code[1];
      if (code.length === 1){
        tempCode += html($0);
      }else {
        tempCode += getValue($0);
        tempCode += $1 ? html($1) : '';
      }
    });
    tempCode += 'return $out.join("")';
    var preCodes = 'var ';
    each(preCode, function(v, k){
      preCodes += k + '=' + v;
    });
    var $code = preCodes + tempCode;
    

    function html(code){
      return push("'" + code.replace(/('|\\)/g, '\\$1') + "'");
    }


    function push(code){
      return '$out.push(' + code.replace(/\n/g, '').replace(/\r/g, '') + ');';
    }


    function setValue(code, unshift, pipe){
      code = code.match(/['"]?[$_a-zA-Z][$_a-zA-Z0-9]*['"]?/g);
      if (unshift){
        each(code || [], function(v){
          if (/^[$_a-zA-Z]/.test(v)) preCode[v] = 'template.' + (pipe ? pipe + '.' : '') + v.replace('$', '') + ','
        });
      }else {
        each(code || [], function(v){
          if (/^[$_a-zA-Z]/.test(v)) preCode[v] = '$data.' + v + ','
        });
      }
    }


    function getValue(code){
      code = trim(code);
      var $loc = /^\/?(if|else|each)$|^\/?(if|else|each)[^\S]\s*.*$/;
      if ($loc.test(code)){
        var $rc = code.match(/\/?(if|else|each)/)[0];
        switch ($rc){
          case 'if':
            code = code.replace($rc, '');
            setValue(code);
            return $rc + '(' + code + '){';
            break;
          case 'else':
            var rc = code.match(/^else\s+if/);
            code = rc ? code.replace(rc[0], '') : '';
            setValue(code);
            return '}' + (rc ? (rc[0] + '(' + code + '){') : $rc + '{');
            break;
          case 'each':
            var $code = trim(code.replace($rc, '')).split(/\s+/), $v = $code[3];
            if ($v) {
              $code[3] = $code[2];
              $code[2] = $v;
            }
            var $temp = $code[1] === 'as' ? ($rc + '(' + $code[0] + ',function(' + $code.splice(2) + '){') : ($rc + '(' + $code[0] + ',function($value,$index,$obj){');
            setValue($code[0]);
            return '$' + $temp;
            break;
          case '/if':
          case '/else':
            return '}';
            break;
          case '/each':
            return '});';
            break;
          default:
            return '';
            break;
        }
      }else if (/^.*\|.*/.test(code)){
        code = code.split('|');
        var re = /\s*[$_a-zA-Z0-9]+\s*:?/;
        var func = code[1] ? '$' + trim(code[1].match(re)[0].replace(':', '')) : '';
        var args = code[1] ? code[1].replace(re, '') : '';
        args = args ? args.split(',') : [];
        setValue(func, true, 'filter');
        each(args, function(v){
          setValue(v);
        });
        return push(func + '(' + code[0] + (args.length ? ',' + args.join(',') : '') + ')');
      }else {
        setValue(code);
        return push(code);
      }
    }


    var Render = new Function("$data", $code);
    return Render;
  };


  // AMD && CMD
  if (typeof define === 'function'){
    define(function(){
      return template;
    })
  }else if (typeof module !== 'undefined'){
    module.exports = template;
  }
  global.template = template;
})(window || global);