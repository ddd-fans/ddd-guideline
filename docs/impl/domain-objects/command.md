# 实现命令

## 命令执行过程中可以调用另外一个命令吗？

可以。有的时候，一个命令的功能，可以分解为多个子功能，其中一些功能可以通过重用已有的命令实现，这当然是可以重用的。
类似下面的代码：

```kotlin
class Sub1Cmd
class Sub1CmdHandler

class SubCmd2
class Sub2CmdHandler

class MyCmd
class MyCmdHandler(
  private val sub1CmdHandler: Sub1CmdHandler,
  private val sub2CmdHandler: Sub2CmdHandler
) {
  fun handle(cmd: MyCmd) {
    sum1CmdHandler.handle(makeSub1CmdFromMyCmd(cmd))
    sum2CmdHandler.handle(makeSub2CmdFromMyCmd(cmd))
  }
}
```

## 一个命令可以操作多个聚合吗？

可以。

## 一个命令执行过程中可以发出多个领域事件吗？

可以。

## 怎么实现批量处理？

首先，看如何给命令建模。如果批量处理里的多个处理之间是完全孤立的，批量处理和用户多次操作的效果在业务上完全一样，那么这个时候的“批量处理”，只是一种交互逻辑，并不是领域逻辑，没有必要为这种操作单独建立一个命令。反之，如果这些处理间存在业务约束，和用户一个一个操作是不同的，那么就应该单独建立一个命令来实现“批量处理”，因为不可能通过重用单个处理的命令来实现这个命令。

然后，根据模型来初步选择技术实现方案。如果每个命令只做单个处理，那么在领域模块外通过重复调用命令的方式来实现“批量”；否则，就在领域模块内实现。

最后，如果性能不够用，为了达到性能要求，需要做一些性能优化，比如提前预读取数据做缓存，异步处理以尽快给用户反馈进度，甚至是放弃使用领域模型，而是直接操作数据库。大部分情况下，即使是在外部循环的调用命令来实现批量处理，性能也是够用的。
