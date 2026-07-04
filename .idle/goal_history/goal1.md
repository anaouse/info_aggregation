# 个人资产快照系统 - 后端设计说明

## 背景与目的
这是一个个人使用的资产记录工具,每月手动录入一次资产快照(现金、股票、
加密货币等)。核心诉求是:

1. **资产类型不固定**——这个月有股票,下个月可能清仓;这个月没有加密货币,
   明年可能新增。资产类型的种类和数量会随时间自由变化。
2. **使用者只有我自己**,数据量极小(一年最多 12 条快照记录),不需要
   支持多用户、不需要高并发、也不需要复杂的报表统计能力。
3. **希望前端能自由添加/删除资产类型**,不希望每次新增一种资产就要改
   数据库表结构、加字段、写迁移脚本。

## 最终方案:单表 + TEXT(JSON)字段存储明细
考虑到数据量小、单用户、不需要 SQL 层面对具体资产类型做聚合统计,
选择用一个 TEXT 字段存 JSON 数组来存放"资产类型-金额"这种动态键值对,
而不是拆成 EAV(实体-属性-值)三表结构。EAV 方案更规范、更适合多用户
或需要复杂统计的场景,但对我这种个人小工具来说是过度设计。

### 表结构(SQLite)

```sql
CREATE TABLE assets_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assets_snapshot_date TEXT NOT NULL UNIQUE,   -- 格式 'YYYY-MM-01',每月一条,唯一约束防止重复录入
  assets TEXT NOT NULL,                  -- JSON 数组: [{"name": "现金", "amount": 12000}, ...]
  created_at TEXT DEFAULT (datetime('now')), -- 遵守已有表的UTC格式
  updated_at TEXT DEFAULT (datetime('now'))
);
```

`assets` 字段内容示例:
```json
[
  { "name": "现金", "amount": 12000 },
  { "name": "中国东航A股票", "amount": 300 },
  { "name": "BTC", "amount": 3 }
]
```

### 字段设计要点
- `assets_snapshot_date` 加 `UNIQUE` 约束:一个月只能有一条快照,重复保存时
  走"更新"逻辑(`INSERT ... ON CONFLICT DO UPDATE` 或先查后写)。
- `assets` 存 JSON 数组而不是 JSON 对象(`{"现金": 12000}`),是为了保留
  顺序、方便以后扩展单条资产的元信息(比如备注、币种),对象形式不好
  加扩展字段。
- 校验(名称不为空、不重复、金额是数字)放在**前端和后端应用层**做,
  不指望 SQLite 的 TEXT 字段本身做结构校验。

## 对应的 API 设计
- `POST /api/assets_snapshots` — 新建或更新某月快照（这里我不确定已有的新建和更新是不是一起的你看看）:
```json
  { "date": "2026-07-01", "assets": [{ "name": "现金", "amount": 12000 }] }
```
- `GET /api/assets_snapshots` — 返回整个数据库数据，反正个人数据，每个月记录一次数据量不大


在 migrations 里面通过日志新建表

```
{
  "date": "2026-07-01",
  "assets": [
    { "name": "现金", "amount": 12000 },
    { "name": "BTC", "amount": 3 }
  ]
}
```
