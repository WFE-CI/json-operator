/**
 * @Author: Erwin
 * @Date:   2018-08-27 21-08-84
 * @Last modified by:   erwin
 * @Last modified time: 2018-08-28 22-08-37
 */
// todoList
// TODO: 1、增加导出出口
// TODO: 2、增加JSON文件单独的读取和写入接口，并考虑尽量减少fs.open次数
// TODO: 3、增加JSON文件内容清空流程的事物回滚
// TODO: 4、增加单元测试


const fs = require('fs');

/**
 * 获取字符串的UTF-8编码字节长度
 * @method lengthUTF8
 * @param  {[type]}   inputStr
 * @return {[type]}
 */
function lengthUTF8(inputStr) {
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
}

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
  fs.write(fd, buffer, 0, lengthUTF8(content), 0, (err, written, bufferStream) => {
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
 * @param  {[type]}        callBack
 * @return {[type]}
 */
const readFileContent = (fd, buffer, size, callBack) => {
  fs.read(fd, buffer, 0, size, 0, (err, bytesRead, contentBuffer) => {
    if (err) {
      throw err;
    } else {
      let jsonData = JSON.parse(contentBuffer.slice(0, bytesRead).toString());

      jsonData.version = '1.24.0-test';
      callBack(fd, jsonData);
    }
  });
};


/**
 * 开始文件操作
 * @type {String}
 */
fs.open('package.json', 'r+', (err, fd) => {
  if (err) throw err;
  fs.fstat(fd, (err, stat) => {
    if (err) throw err;
    console.log('stat:', stat.size);
    // 初始化buffer对象的内存空间
    let buffer = new Buffer(stat.size);

    // 读取JSON文件内容
    readFileContent(fd, buffer, stat.size, function(readFd, jsonData) {

      // 清空JSON文件内容
      fs.ftruncate(fd, 0, (err) => {
        if (err) throw err;
      });

      // 写入JSON文件内容
      writeFileContent(readFd, JSON.stringify(jsonData, null, '\t'), () => {
        // 关闭文件描述符
        fs.close(fd, (err) => {
          if (err) throw err;
        });
      });
    })

  });
});