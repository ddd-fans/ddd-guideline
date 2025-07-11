# 聚合

建模的时候，已经明确了聚合承担的责任。实现的时候只要把这些功能通过聚合实现好，就可以了。

## 如何实现单例的聚合？

和普通的聚合写法一样。仓储提供一个函数可以不提供 id 就查询出聚合；或者设定一个常量定义这个单例聚合的 id。

## 如何生成聚合 ID？

不推荐保存聚合的时候由数据去生成聚合 id。经常出现这样一种情况：聚合保存之前，就要把这个聚合的 id 传递给别的对象去使用。如果聚合 id 是在保存到数据库的时候由数据库去生成的，那么聚合在一创建好，就要立刻去存储一次，以便于获取数据库生成的 id。这种方法虽然可行，但这个多余的保存操作，纯粹是为了技术的妥协。

建议专门定义一个接口，用来生成 id，然后在领域模块之外去实现生成 id 的算法。这样显示的表达生成 id，比隐式的保存聚合要好得多。

生成聚合 id 的算法有很多，根据具体场景去选择即可，比如：

- 数据库序列
  - 优点：易实现，全局有序，空间占用小，绝大部分场景下适用
  - 缺点：需要数据库支持，性能受限于数据库
- redis 计数
  - 优点：更高性能，生成简单，全局有序，空间占用小
  - 缺点：为了应对 redis 可能的故障场景，需要持久化和初始化机制，实现复杂
- 雪花算法
  - 优点：比 redis 计数还要高的生成性能，算法简单，空间占用小，基本有序
  - 缺点：管理 worker node id 略显麻烦，基于时钟算法，需要依赖时间同步
- UUIDv4
  - 优点：简单，生成性能高于 redis
  - 缺点：占用空间大，有安全隐患，无序
- UUIDv7
  - 优点：简单，极高生成性能，基本有序
  - 缺点：占用空间大，依赖时钟同步

建议大部分场景下选择数据库序列，大部分情况下生成聚合 id 不需要那么高的性能，数据库序列足够用了。当数据库不支持的时候，建议采用 uuidv7。

## 为什么要给聚合定义一个接口？

为了：

- 显式定义聚合具有哪些功能
- 像大部分对象隐藏聚合的内部实现。除了少部分需要实例化聚合的对象，其它对象只看到聚合的接口。
- 只要保持接口不变，将来更容易去重构聚合的实现

## 可以把聚合当成数据库表的映射类吗？

如何对聚合侵入不大的话，可以。但是要注意，我们是先设计好了聚合，然后恰好把它当成数据库表的映射类，而不是设计好了数据库表，然后把它当成聚合。

如果为了实现这种映射，要在聚合里写入大量技术实现相关的代码，那这种方式就不可接受了。

## 聚合的函数只能处理命令吗？

不是只能处理命令。聚合就是普通的对象，它当然可以提供不是直接处理命令的函数。在领域模块里，任何对象调用这些函数，聚合都要完整的完成这些函数所代表的业务功能（聚合状态的变更、发出领域事件、和其它对象的协作等）。

## 领域事件必须暂存到聚合里吗？

不是。
将领域事件暂存到聚合内，聚合持久化完成的时候才把这些领域事件投递出去，这确实一种简便的实现投递领域事件的方式。但这并不是唯一的方式，根据需要，你还可以把参与命令执行的所有领域事件都暂存到一个队列，而不是每个聚合一个队列。

## 聚合只能操作自己的字段？

是的。字段是对象内部的状态数据，服务于对象的功能，需要被隐藏。任何对象都应该只能操作自己的字段，都不能看到别的对象的字段，更不能操作别的对象的字段。

## 聚合不能调用别的聚合的方法吗？

当然可以。聚合就是普通的对象，对象必须通过调用别的对象的方法（给别的对象发消息）来协作，实现功能。两个聚合对象间要相互协作是很自然的事情。

## 可以继承别的聚合吗？

继承代表的是含义是“是”，一个聚合继承别的聚合，说明这聚合“是”别的聚合，那这两个聚合就是一个聚合。因此不存在一个聚合继承另外一个聚合。只有可能存在，一个聚合的接口，有多重具体的实现。这种情况下，聚合对外的功能是一样的，只是不同业务情况下，有着不同的具体实现。

## 写代码的时候发现聚合内功能复杂，又不想拆分聚合怎么办？

和普通面向对象编程一样，再定义一个对象来承担部分功能，让后聚合根可以把这部分功能委托给它。

## 领域模块外可以使用聚合吗？

可以使用只读功能，它无副作用。如果要实现业务变更，还是得通过命令。

## 聚合可以放查询用的冗余字段吗？

如果使用了 CQRS，冗余为了查询的冗余字段的功能由读模型实现，聚合就不用再重复去实现这个功能了。
如果没有使用 CQRS，聚合为了实现读模型的功能，就得去加入这些冗余字段。建议使用 CQRS。
