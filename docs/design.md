# 信息源数据结构

```
{
  "source_name": "xxx", // str
  "url": "https://xxx" // str
}
```

# sqlite数据库设计

## info_aggregation.sqlite 数据库

放到后端的 ./data 下，后端运行先检查文件，如果不存在就先创建数据库，并且也要检查内部表是否存在，待会增删查改不会检查表是否存在

### info_sources 表

- id， 自增主键
- source_name，string
- url，string，UNIQUE
- create_at, string, UTC时间的 ISO 8601 格式字符串 2024-01-15 08:30:00

全部字段都不能为空

首次建表时把之前的 5 条 mock 数据插入

一个 database.go 出来专门管 SQLite，main.go只负责路由

### predictions 表

业务：一长串文字我可以随着时间发展记录新内容，一个预言是否完成的状态显示

- id， 自增主键
- text，string
- done，int，0表示这个预言没有完成，1表示这个预言已经完成，即出现结果了
- updated_at, string, UTC时间的 ISO 8601 格式字符串 2024-01-15 08:30:00
- created_at, string, UTC时间的 ISO 8601 格式字符串 2024-01-15 08:30:00

后端接口：

get /api/predictions：所有数据的所有字段

post /api/predictions：
- 前端估计到时候我会更新text，done，然后通过id来锁定那条唯一数据，updated_at就是后端自己生成时间跟着更新

比如：
```json
{
  "id":"xx",
  "text":"xxx"
}
```

```json
{
  "id":"xx",
  "done":1
}
```

- 但是也新创建一条数据的时候，这个时候前端肯定就只传一个text过来，id，done，created_at,updated_at都是后端自己默认，这里问题就是如何区分新建的数据和更新数据的请求？

前端界面：

新的3个组件AddPredictionBar，PredictionItem，PredictionsList

新的1个页面，PredictionsPage：
- 从上到下排列
- Header（这个写到 App.tsx 里面了默认自带）
- 有一个类似 AddSourceBar 的 AddPredictionBar，它只有一个输入栏和添加按钮
- 下方展示PredictionsList展示从后端得到的PredictionItem
  - 每个item左边根据done情况显示一个红灯或者绿灯，已经有结果的使用绿灯，还在进行的使用红灯，中间显示text，固定高度，文字太多显示scroll bar，就是最普通的输入栏，显示text即可，不考虑markdown，然后右边两个按钮，一个是更新text按钮（点击后直接把中间输入栏的内容发送到后端，不用判断是否有变化），一个是更新状态按钮（点击后这一条prediction的done就把toggle状态传给后端），两个按钮都是绿色的
