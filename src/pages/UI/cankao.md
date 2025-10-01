初始化 SDK
安装依赖
在 Web 项目的根目录下，使用 npm 或 yarn 安装所需的包：

npm install @cloudbase/js-sdk --save
初始化和使用 SDK
// 引入 SDK
const app = cloudbase.init({
  env: "huanneng-0g1guqcgf3264f38"
});
const auth = app.auth({
  persistence: "local",
});
await auth.signInAnonymously(); // 或者使用其他登录方式

const models = app.models;
创建单条数据
const { data } = await models.users_tbl.create({
  data: {
      password: "文本",  // 密码
      name: "文本",  // 姓名
      phone_num: 13112345678,  // 手机号
    },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回创建的数据 id
console.log(data);
// { id: "7d8ff72c665eb6c30243b6313aa8539e"}
创建多条数据
const { data } = await models.users_tbl.createMany({
  data: [
    {
        password: "文本",  // 密码
        name: "文本",  // 姓名
        phone_num: 13112345678,  // 手机号
      },
    {
        password: "文本",  // 密码
        name: "文本",  // 姓名
        phone_num: 13112345678,  // 手机号
      },
  ],
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回创建的数据 idList
console.log(data);
// {
//   "idList": [
//     "7d8ff72c665ebe5c02442a1a7b29685e",
//     "7d8ff72c665ebe5c02442a1b77feba4b",
//     "7d8ff72c665ebe5c02442a1c48263dc6",
//     "7d8ff72c665ebe5c02442a1d53c311b0"
//   ]
// }
更新单条数据
  const { data } = await models.users_tbl.update({
  data: {
      password: "文本",  // 密码
      name: "文本",  // 姓名
      phone_num: 13112345678,  // 手机号
    },
  filter: {
    where: {
      $and: [
        {
          _id: {
            $eq: 'xxxx', // 推荐传入_id数据标识进行操作
          },
        },
      ]
    }
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回更新成功的条数
console.log(data);
// { count: 1}
更新多条数据
const { data } = await models.users_tbl.updateMany({
  data: {
      password: "文本",  // 密码
      name: "文本",  // 姓名
      phone_num: 13112345678,  // 手机号
    },
  filter: {
    where: {
      $and: [
        {
          title: {
            $nempty: 1 // 不为空的数据
          }
        }
      ]
    }
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回更新成功的条数
console.log(data);
// {
//   "count": 33
// }
删除单条数据
const { data } = await models.users_tbl.delete({
  filter: {
    where: {
      $and: [
        {
          _id: {
            $eq: 'xxx', // 推荐传入_id数据标识进行操作
          },
        },
      ]
    }
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回删除成功的条数
console.log(data);
// {
//   "count": 1
// }
删除多条数据
const { data } = await models.users_tbl.deleteMany({
  filter: {
    where: {
      $and: [
        {
          title: {
            $eq: 'Hello World👋'
          }
        }
      ]
    }
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

console.log(data);
// 返回删除成功的条数
// {
//   "count": 7
// }
读取单条数据
const { data } = await models.users_tbl.get({
  filter: {
    where: {
      $and: [
        {
          _id: {
            $eq: _id, // 推荐传入_id数据标识进行操作
          },
        },
      ]
    }
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回查询到的数据
console.log(data);
读取多条数据
const { data } = await models.users_tbl.list({
  filter: {
    where: {}
  },
  pageSize: 10, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
  pageNumber: 1, // 第几页
  getCount: true, // 开启用来获取总数
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回查询到的数据列表 records 和 总数 total
console.log(data);
// {
//   "records": [{...},{...}],
//   "total": 51
// }
创建关联数据
const { data } = await models.users_tbl.create({
    data: {
      example: {    // 关联模型标识
        _id: "xxx", // 关联的数据 ID
      },
      xxx: "文章写的很不错😄", // 其它字段
    },
    // envType: pre 体验环境， prod 正式环境
    envType: "pre",
  });

  // 返回写入的数据 _id
  console.log(data);
  // { id: "7d8ff72c665eb6c30243b6313aa8539e"}
查询关联数据
const { data } = await models.users_tbl.list({
  filter: {
    where: {
      example: {    // 关联模型标识
        $eq: "xxx", // 传入数据 ID
      },
    }
  },
  getCount: true, // 是否返回总数
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回查询到的数据和总数
console.log(data);
// {
//  "records": [
//    {
//      "owner": "Anonymous(95fblM7nvPi01yQmYxBvBg)",
//      "createdAt": 1717491698898,
//      "createBy": "Anonymous(95fblM7nvPi01yQmYxBvBg)",
//      "post": "e2764d2d665ecbc9024b058f1d6b33a4",
//      "updateBy": "Anonymous(95fblM7nvPi01yQmYxBvBg)",
//      "_openid": "95fblM7nvPi01yQmYxBvBg",
//      "xxx": "文章写的很不错😄",
//      "_id": "b787f7c3665ed7f20247f85409c36512",
//      "updatedAt": 1717491698898
//    },
//  ],
//  "total": 1
// }
调用 SQL 模板
const { data } = await models.users_tbl.runSqlTemplate({
  templateName: "selectExample", // SQL模板名称
  params: {
    title: "hello", // SQL模板入参
  },
  // envType: pre 体验环境， prod 正式环境
  envType: "pre",
});

// 返回查询到的数据和总数
console.log(data);
预编译模式
预编译模式下使用参数化查询设计，结合静态模板语法和动态运行时参数，以实现灵活的数据交互。允许开发者通过 Mustache 变量绑定语法 {{ }} 直接在 SQL 查询中嵌入静态参数，同时也支持在运行时通过 $runSQL() 方法执行时动态传递参数，可以避免直接拼接字符串导致 SQL 注入的风险。

const result = await models.$runSQL(
  "SELECT * FROM `lcap-wzcs_iuujo7p` WHERE title = {{title}} limit 10",
  {
    title: "hello",
  }
);

console.log(result);
// {"data":{"total":1,"executeResultList":[{"owner":"1739272568342245378","is_published":true,"author_web":"https://qq.com","banner":"cloud://lowcode-0gr8x3i8cd1c6771.6c6f-lowcode-0gr8x3i8cd1c6771-1307578329/weda-uploader/ec687de371d4ad064efd0a424a69e969-logo (1).png","auto_no":"1000","body":"<p>hello world</p>","title":"hello","type":"[\"test\",\"test\"]","author_tel":"18588881111","createdAt":1719475245475,"createBy":"1739272568342245378","read_num":997,"updateBy":"1739272568342245378","_openid":"1739272568342245378","extra":"{}","markdown":"# aa\n\n\n\n","author_email":"a@qq.com","json":"{\"a\":\"1\"}","_id":"9JXU7BWFZJ","region":"北京市","updatedAt":1719475245475}],"backendExecute":"27"},"requestId":"16244844-19fe-4946-8924-d35408ced576"}
原始模式
const result = await models.$runSQLRaw(
  "SELECT * FROM `lcap-wzcs_iuujo7p` WHERE title = 'hello' limit 10"
);

console.log(result);
// {"data":{"total":1,"executeResultList":[{"owner":"1739272568342245378","is_published"