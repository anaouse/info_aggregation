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
