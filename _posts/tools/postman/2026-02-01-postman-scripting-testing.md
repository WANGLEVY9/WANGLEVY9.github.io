---
title: "Postman 学习笔记：脚本、断言与数据驱动"
date: 2026-02-01 10:22:00 +08:00
categories: [Tools, Postman]
tags: [postman, testing, scripts, assertions, data]
image: /assets/img/og-cover.svg
---

> 学习笔记：Postman 的 pre-request/tests 脚本、断言模式、数据驱动、可复用组件与鲁棒性治理，带实战片段与排障清单，5000 词以上。

## 0. 生命周期与心智模型
- pre-request：请求发送前执行，常用于签名、token 刷新、变量校验。
- Tests：收到响应后执行，做断言、提取变量、控制流程。
- Runner/Newman：按文件夹顺序执行；`postman.setNextRequest` 可跳转；`pm.variables` 贯穿一次运行。
- 作用域回顾：Local > Data > Environment > Collection > Global，脚本里读写要明确作用域。

## 1. pm.* API 速查与惯用法
- 请求对象：`pm.request`，可读写 headers/body/url；
- 响应对象：`pm.response`，`json()`/`text()`/`code`/`headers`；
- 变量：`pm.variables.get/set`（遵守优先级），或显式 `pm.environment/collectionVariables`；
- 控制流：`postman.setNextRequest(name)`；
- 断言：`pm.expect`（ChaiJS）；
- 日志：`console.log`，`console.table`。
- 定时：无原生等待，可用 `setTimeout`（注意同步行为）或轮询接口。

## 2. 组织方式与可维护性
- 集合级脚本：放公共函数（签名、trace-id），避免重复。
- 文件级/请求级脚本：针对特定接口的准备与断言。
- 外部文件：可将 JS 片段放在环境/全局变量中 `common_js`，在 pre-request 里 `eval`；需注意安全。
- 模块化建议：
  - 公共函数隔离到一个对象 `pm.globals.set('utils', ...)`；
  - 在请求中 `const utils = eval(pm.globals.get('utils'));`。

## 3. 断言模式大全
- 基础断言：
  ```javascript
  pm.test('状态码 200', () => pm.response.to.have.status(200));
  pm.test('耗时 < 800ms', () => pm.expect(pm.response.responseTime).below(800));
  ```
- JSON 断言：
  ```javascript
  const data = pm.response.json();
  pm.test('业务成功', () => pm.expect(data.code).to.eql(0));
  pm.test('有 id', () => pm.expect(data.data).to.have.property('id'));
  ```
- Schema 校验（ajv）：
  ```javascript
  const Ajv = require('ajv');
  const ajv = new Ajv({allErrors:true, removeAdditional:'failing'});
  const schema = pm.collectionVariables.get('user_schema');
  const valid = ajv.validate(JSON.parse(schema), pm.response.json());
  pm.test('Schema 校验', () => pm.expect(valid, ajv.errorsText()).to.be.true);
  ```
- 部分字段忽略：
  - 删除动态字段后再比对：`delete obj.timestamp;`；
  - 或在 schema 中 `additionalProperties: true` 并标记 required。
- Header 断言：
  ```javascript
  pm.test('trace-id 存在', () => pm.response.headers.has('x-trace-id'));
  ```
- 排序/列表断言：对数组排序再比较；检查唯一性。
- 幂等性断言：连续两次请求结果相同，或返回 304/409 合理。

## 4. 数据驱动与矩阵
- 数据文件：CSV/JSON，字段名即变量名；
- 跑法：Runner 选择 data file；Newman `-d data.csv`；
- 用例矩阵：在 CSV 里组合 `case_name, input, expected_code`；
- 失败重跑：
  ```javascript
  let retry = pm.variables.get('retry') || 0;
  if(pm.response.code >=500 && retry<1){
    pm.variables.set('retry', retry+1);
    postman.setNextRequest(pm.info.requestName);
  } else {
    pm.variables.unset('retry');
  }
  ```
- 筛选：Runner 可按文件夹；Newman 用 `--folder`；
- 标记：在 Tests 里 `pm.test('case:' + pm.iterationData.get('case_name'), ...)`，报告可见。

## 5. 可复用组件与函数库
- 随机/生成：uuid、手机号、邮箱、日期；
  ```javascript
  const utils = {
    uuid: () => pm.variables.replaceIn('{{$uuid}}'),
    email: () => `user+${Date.now()}@example.com`,
    phone: () => '1' + Math.floor(Math.random()*1e10).toString().padStart(10,'0')
  };
  pm.globals.set('utils', `(${utils.toString()})()`);
  ```
- 加解密/签名：放在 collection 级；
- 公共断言函数：
  ```javascript
  const assertOk = (resp) => {
    pm.expect(resp.code).to.eql(0);
  };
  ```
- Visualizer 组件：把响应渲染成表格/图表用于肉眼检查。

## 6. 链式调用与状态管理
- 提取变量：
  ```javascript
  const json = pm.response.json();
  pm.environment.set('user_id', json.data.id);
  ```
- 控制流：
  - `postman.setNextRequest('下一个请求名')`；
  - 在最后设置 `null` 终止；
  - 注意 Runner 顺序与 `setNextRequest` 组合。
- 幂等与清理：在 Tests 里调用删除接口或标记垃圾数据；避免污染环境。

## 7. 鲁棒性与随机化
- 随机输入：减少“只测快乐路径”；
- 边界值：空字符串、超长、特殊字符、最大数值；
- 异常流：鉴权缺失、字段缺失、越权；
- 重放/重复：验证幂等；
- 容错：当依赖服务不稳定时的降级（断言自定义错误码）。

## 8. 等待与轮询场景
- 长任务：通过 `pm.sendRequest` 轮询：
  ```javascript
  const poll = (attempt=0) => {
    if(attempt>10) return pm.test('超时失败', ()=>{throw new Error('poll timeout')});
    pm.sendRequest(pm.environment.get('base_url')+'/task/status', (err,res)=>{
      if(res.json().status==='done'){
        pm.test('任务完成', ()=> pm.expect(true).to.be.true);
      }else{
        setTimeout(()=>poll(attempt+1), 1000);
      }
    });
  };
  poll();
  ```
- 注意：Postman sandbox 的 setTimeout 是同步阻塞，谨慎使用；更稳妥是拆成两个请求，通过 `setNextRequest`。

## 9. 报告与结果收集
- console：本地调试；
- 自定义对象：收集关键信息，运行结束输出；
  ```javascript
  let bag = pm.collectionVariables.get('bag') || {};
  bag[pm.info.requestName] = {code: pm.response.code, time: pm.response.responseTime};
  pm.collectionVariables.set('bag', bag);
  ```
- Visualizer：展示批量结果；
- Newman 报告：HTML/JUnit，配合 CI 看趋势。

## 10. 性能注意事项
- 脚本耗时：避免复杂计算；
- 数据量：大 CSV 拆分；
- 内存：不要存巨大响应到环境；需要时仅存关键字段；
- 依赖：外部库 (CryptoJS/ajv) 体积有限，必要时压缩。

## 11. 排障清单
- 作用域错：检查取值用的作用域；打印 `pm.variables.toObject()`；
- 未定义变量：pre-request 未运行/顺序不对；
- 异步陷阱：`pm.sendRequest` 回调里抛错才会让测试失败；
- setNextRequest 死循环：确保在合适条件设置 null；
- 断言顺序：先断言响应格式，再做业务断言，避免 `json()` 报错。

## 12. 场景案例：下单→支付→退款（含异常流）
1) 登录获取 token；
2) 创建订单（断言库存、价格正确）；
3) 支付接口（断言支付状态）；
4) 查询订单状态（轮询至已支付）；
5) 退款（断言幂等，多次退款返回相同结果）；
6) 异常流：无 token、越权用户、重复支付。

## 13. 场景案例：多租户隔离
- 数据文件：多租户 token；
- 断言返回的租户 id 与请求一致；
- 检查跨租户访问返回 403。

## 14. 规范化与文档化
- 断言片段库：放在 README 或单独文件，按类型分类（状态码、JSON、Schema）。
- 错误案例库：记录踩坑（时间偏差、签名、编码）与解决办法。
- 评审 checklist：
  - 是否有至少一个业务断言；
  - 是否提取了必要变量；
  - 是否清理了副作用；
  - 是否避免使用 Global 存敏感信息。

## 15. 与其他主题的衔接
- 环境/变量：必填校验写在 pre-request；
- 请求调试：断言与日志结合；
- Newman/CI：脚本必须幂等、数据文件可配置；
- Mock：在 Mock 上跑脚本验证逻辑。

## 16. FAQ
- Q: `pm.sendRequest` 是异步吗？
  - A: 是异步，回调抛错才会计入失败；Tests 结束前异步未完成可能被忽略，建议串联或 setNextRequest。
- Q: 如何复用 JS 模块？
  - A: 放在全局/集合变量作为字符串并 eval；或在 CLI 里用 Newman + 外部脚本（require）。
- Q: setNextRequest 不生效？
  - A: 仅 Runner/Newman 支持；在单次发送中不生效。
- Q: 如何做条件断言？
  - A: if 分支包裹 `pm.test`；或在预期表里配置。

## 17. 行动清单
- 立刻：为集合新增公共前置脚本（变量校验、trace-id）；
- 本周：为关键接口补充 Schema 断言 + 链式变量提取；
- 本月：搭建断言片段库与错误案例库，形成评审清单。

## 18. 自测演练
- 用数据文件跑 5 条用例（正常/缺字段/越权/重复/边界）；
- 每条用例都落到清晰的断言失败原因；
- 报告中有 case_name、耗时、trace-id；
- 副作用全部清理，环境可复跑。

## 19. 小结
- 把脚本当作“可测试、可复用的代码”来管理；
- 先建公共库和断言基线，再补充随机化与异常流；
- 重视作用域、顺序、异步这些易踩坑的点，脚本才会稳定可靠。
