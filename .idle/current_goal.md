好，然后我们来写前端，我的设计是三个components

第一个 AssetsList (容器组件,持有状态和提交逻辑)
  ├── 输入这条snapshot的日期，默认是这个月1号
  ├── 第二个 AssetItem × N (展示组件,每条资产一行)
  ├── "添加资产类型" 按钮  
  ├─ "确认保存" 按钮
  └── 底部展示历史assets数据

一个AssetsPage

遵循已有的前端文件架构以及css写法
