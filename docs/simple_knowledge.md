# 项目一句话隐性知识

- 我新入门node.js生态，这是一个react/vite，使用tsx编写的信息源聚合工具，我写着来练习react以及typescript
- `@` 别名指向 `./src`，引用时写 `@/foo` 即可，不要写成 `@/src/foo`
- `source.tsx` 只负责单条数据渲染，容器组件 `App.tsx` 负责数据持有和组合
- css 统一放在 `src/css/` 下，然后在 `main.tsx` 中全部引用
