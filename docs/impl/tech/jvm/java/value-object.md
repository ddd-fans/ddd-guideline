# 值对象

## POJO

以联系信息举例：

```java
public class ContactInfo {
  private String name;

  private String mobile;

  public void setName(String name) {
    this.name = name;
  }

  public void setMobile(String mobile) {
    this.mobile = mobile;
  }

  public String getName() {
    return this.name;
  }

  public String getMobile() {
    return this.mobile;
  }
}
```

上面的 POJO 可以用来代表联系信息值对象。要创建一个新的值对象，代码如下：

```java
var contactInfo = new ContactInfo();
contactInfo.setName("张三");
contactInfo.setMobile("12345678901");
```

## lombok + POJO

`getter` `setter` 看着很啰嗦，借助于 `project lombok`，可以以一种妥协的方式改进一下，如下

```java
@Getter
@Setter
public class ContactInfo {
  private String name;

  private String mobile;
}
```

为什么不直接使用裸的对象字段，如下：

```java
public class ContactInfo {
  public String name;

  public String mobile;
}
```

因为这样不符合 `java bean` 规范，历史上有很多框架都依赖 java bean 规范。

## 不可变 POJO

值对象应该是不可变对象，但是上面的写法明显是可变的，通过不提供 `setter` 可以做到不可变。比如：

```java
public class ContactInfo {
  private final String name;

  private final String mobile;

  public ContactInfo(String name, String mobile) {
    this.name = name;
    this.mobile = mobile;
  }

  public String getName() {
    return this.name;
  }

  public String getMobile() {
    return this.mobile;
  }
}
```

上面这种写法，是 java 里最标准的实现值对象的方式，也是我推荐的方式。当字段较多时，构造函数的参数列表太长，调用时必须正取顺序输入参数，非常不好用，对此，java 并没有好的办法来解决。

## Builder 模式

通过采用 `Builder` 模式，可以近似达到效果。代码如下：

```java
public class ContactInfo {
  private String name;

  private String mobile;

  public void setName(String name) {
    this.name = name;
  }

  public void setMobile(String mobile) {
    this.mobile = mobile;
  }

  public String getName() {
    return this.name;
  }

  public String getMobile() {
    return this.mobile;
  }

  public static Builder builder() {
    return new Builder();
  }

  public static class Builder {
    private String name;

    private String mobile;

    public Builder name(String name) {
      this.name = name;
      return this;
    }

    public Builder mobile(String mobile) {
      this.mobile = mobile;
      return this;
    }

    public ContactInfo build() {
      return new ContactInfo(this.name, this.mobile);
    }
  }
}

var contactInfo = ContactInfo.builder()
  .name("张三").mobile("12345678901")
  .build();
```

## lombok + builder

实践中还是使用妥协产物 `project lombok` 吧，如下：

```java
@Builder
public class ContactInfo {
  private String name;

  private String mobile;
}
```

以上的 `builder` 方式是 `java` 能做到的最好的程度了，但是还存在一个缺点，缺少编译期检查能力，只能做到运行期检查。比如：

```java
var contactInfo = ContactInfo.builder()
  .name("张三")
  .build();
```

上面代码中，没有设置 `mobile` 属性，但是代码照样编译通过。

## Record class

如果你使用较新的 `java` 语言版本，可以使用 `record class` 简化定义值对象，如下：

```java
public record ContactInfo(
  String name,
  String mobile
)
```

减少了 `getter` `setter` 的声明，但是它不符合 `bean` 规范，依旧没有解决当构造函数参数过多时，很难使用的问题。 实践中，只有字段少的对象适用，字段多的时候，还不如用 `lombok + builder`。
