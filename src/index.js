/**
 * @Author: Erwin
 * @Date:   2018-08-27 21-08-84
 * @Last modified by:   Erwin
 * @Last modified time: 2018-08-30 20-08-27
 */
'use strict'

const fs = require('fs');


const util = {
  /**
   * 获取字符串的UTF-8编码字节长度
   * @method lengthUTF8
   * @param  {[type]}   inputStr
   * @return {[type]}
   */
  lengthUTF8: inputStr => {
    if (inputStr.length < 17) {
      return true;
    }
    var i = 0;
    var totalLength = 0;
    /* 计算utf-8编码情况下的字符串长度 */
    for (i = 0; i < inputStr.length; i++) {
      if (inputStr.charCodeAt(i) <= parseInt("0x7F")) {
        totalLength += 1;
      } else if (inputStr.charCodeAt(i) <= parseInt("0x7FF")) {
        totalLength += 2;
      } else if (inputStr.charCodeAt(i) <= parseInt("0xFFFF")) {
        totalLength += 3;
      } else if (inputStr.charCodeAt(i) <= parseInt("0x1FFFFF")) {
        totalLength += 4;
      } else if (inputStr.charCodeAt(i) <= parseInt("0x3FFFFFF")) {
        totalLength += 5;
      } else {
        totalLength += 6;
      }
    }
    return totalLength;
  },
  changeVal: ({
    target,
    cVal,
    data
  }) => {
    let evalStr = 'data';
    for (let loc of target) {
      evalStr += '.' + loc;
    }
    eval(evalStr + '=cVal');
    return data;
  }
};




/**
 * 写入JSON文件内容
 * @method
 * @param  {[type]} fd
 * @param  {[type]} content
 * @param  {[type]} callBack
 * @return {[type]}
 */
const writeFileContent = (fd, content, callBack) => {
  // console.log('将要写入的内容：', content.length, lengthUTF8(content));;
  var buffer = new Buffer(content);
  //写入JSON文件内容
  fs.write(fd, buffer, 0, util.lengthUTF8(content), 0, (err, written, bufferStream) => {
    if (err) {
      console.log('写入文件失败');
      console.error(err);
      return;
    } else {
      console.log('写入文件成功', bufferStream.toString());
      // 写入JSON文件成功回调
      callBack();
    }
  });
}


/**
 * 读取JSON文件内容
 * @method readFileContent
 * @param  {[type]}        fd
 * @param  {[type]}        buffer
 * @param  {[type]}        size
 * @param  {[type]}        changeInfo
 * @param  {[type]}        callBack
 * @return {[type]}
 */
const readFileContent = (fd, buffer, size, changeInfo, callBack) => {
  fs.read(fd, buffer, 0, size, 0, (err, bytesRead, contentBuffer) => {
    if (err) {
      throw err;
    } else {
      let jsonData = JSON.parse(contentBuffer.slice(0, bytesRead).toString());
      // 改变指定位置JSON数据
      jsonData = util.changeVal({ ...changeInfo,
        data: jsonData
      });
      callBack(fd, jsonData);
    }
  });
};




/**
 * main
 * @method
 * @param  {[type]} fileLoc 目标文件位置
 * @param  {[type]} target  目标属性位置，['zhangsan','name'] -> jsonFile.zhangsan.name
 * @param  {[type]} cVal    目标属性将要改的值
 * @return {[type]}
 */
module.exports = function(fileLoc, target, cVal) {
  return new Promise(
    function(resolve, reject) {


      /**
       * 开始文件操作
       * @type {String}
       */
      fs.open(fileLoc, 'r+', (err, fd) => {
        if (err) throw err;
        fs.fstat(fd, (err, stat) => {
          if (err) {
            reject(err);
            throw err;
          };
          console.log('stat:', stat.size);
          // 初始化buffer对象的内存空间
          let buffer = new Buffer(stat.size);

          const readParam = [fd, buffer, stat.size, {
            'target': target,
            'cVal': cVal
          }];
          // 读取JSON文件内容
          readFileContent(...readParam, function(readFd, jsonData) {

            // 清空JSON文件内容
            fs.ftruncate(fd, 0, (err) => {
              if (err) {
                reject(err);
                throw err;
              };
            });

            // 写入JSON文件内容
            writeFileContent(readFd, JSON.stringify(jsonData, null, '\t'), () => {
              // 关闭文件描述符
              fs.close(fd, (err) => {
                if (err) {
                  reject(err);
                  throw err;
                };
                resolve('success');
              });
            });
          })

        });
      });


    }
  );
}