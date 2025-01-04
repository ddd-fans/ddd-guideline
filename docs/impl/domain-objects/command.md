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
