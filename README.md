# json-operator
change and modify jsonFile.



### todoList

- TODO: 1、增加导出出口   ☑
- TODO: 2、增加JSON文件单独的读取和写入接口
- TODO: 3、增加JSON文件内容清空流程的事物回滚
- TODO: 4、增加单元测试
- TODO: 5、增加字符输入安全检查
- TODO: 6、考虑增加批量操作减少fs.open次数


### use

<pre name="code" class="javascript">
const jsonOperator = require('json-operator');

jsonOperator('../package.json', ['version'], '0.2.0').then(function(info) {  
  console.log(info);  
}, function(err) {  
  console.log(err);  
})
</pre>
