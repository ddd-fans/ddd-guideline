# 值对象

## POJO

以联系信息举例：

```kotlin
class ContactInfo(
  val name: String,
  val mobile: String
)
```

这样就实现了一个不可变的值对象。因为有命名参数的存在，构造函数参数太长也不会导致难用。使用方式如下：

```kotlin
val contactInfo = ContactInfo(mobile = "12312341234", name = "张三")
```

## data class

还可以使用 `data class` 如下，

```kotlin
data class ContactInfo(
  val name: String,
  val mobile: String
)
```

自动获得默认的 `equals` `hashcode` `toString` 函数的实现，还提供析构赋值能力，如下：

```kotlin
val (name, mobile) = contactInfo
```
