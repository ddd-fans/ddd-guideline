# 实现仓储

## 整存整取

### 什么是仓储对聚合的整存整取？

在领域模块内，从仓储内获取到的聚合，是完整可用的。没存储一个聚合的时候，仓储对象都要保证将这个聚合的信息完成的保存，下次可以完整的取出。

### 为什么要对聚合整存整取？

聚合是一个整体，在语义上不存在存取部分。在编写代码时，我们也不期望用户根据代码上下文判断当前获取的聚合的哪部分能用哪部分不能用，或者哪部分被改动过要被存储。
这样才能让领域模块内部更专注于如何解决领域问题，而不是技术上如何存取这个聚合。

```kotlin
interface DogRepository {
  // 整取
  fun findDogById(id: DogId): Dog

  // 建模的时候确定 DogHead 是 Dog 的一部分，不是一个独立的聚合，因此不能单独取出 DogHead
  fun findDogHeadById(id: DogId): DogHead

  // 整存
  fun save(dog: Dog)

  // 建模的时候确定 DogHead 是 Dog 的一部分，不是一个独立的聚合，因此不能单独存储 DogHead
  fun saveDogHead(id: DogId, head: DogHead)
}
```

### 聚合整存整取成为性能瓶颈怎么办？

有两个办法：

- 不改变模型的前提下技术优化
  - 获取聚合时，通过延迟加载等减少载入数据量，按需载入
  - 保存聚合时，采用脏数据检查等办法，增量更新
- 修改模型，拆分聚合

## 可以按照 id 外的属性查询聚合吗？

可以。除了常规的按照 id 查询聚合，还可以根据需要，按照别的属性查询，比如 `findByName` `findByCode` 等。

## 如何实现仓储？

建模的时候确定了有哪些聚合，也就确定了会有哪些仓储，因为大部分情况下每个一个聚合都隐含会有一个仓储负责它的仓储工作。在领域模块内，仓储一般都被定义成接口类型（或者别的语言里的抽象类型），因为一般情况下仓储的具体实现都是和实现技术相关，而和问题域无关的，换句话说，领域模块不需要知道聚合是如何存入仓储如何从仓储中取出的。我们在领域模块之外去实现仓储接口，实现仓储的功能。

只要能实现仓储接口的功能，怎么实现都可以，没有太多限制。以下列出几种实现方式，但不是唯一的方式。

### 全量查询和更新
每次查询都把聚合内所有状态都从数据库中载入，组装成聚合对象。每次保存聚合，都根据对象的数据生成全量更新数据库的sql，覆盖数据库所有数据。

缺点是：
* 如果聚合状态数据太大，每次又只更新其中一小部分，却要全量更新，导致数据库性能下降
* 如果聚合状态数据太大，每次载入聚合要查询数据库中所有数据，导致数据库性能下降
* 如果在同一个数据库事务中，多次载入聚合到内存，每次都生成新的对象，对象间没有关联，导致在内存中计算时，看不到前面的变更，引发bug
* 如果没有一个好用的sql框架，生成sql的工作量比较大

如果聚合不是很大，上述缺点被缩小，那么这种方式一般都可以采用


### 借助于ORM来管理聚合
在这种方式下，聚合根本身被通过ORM映射到数据库中，仓储的实现也变得很简单，即通过ORM提供的API去载入和保存更新聚合根即可。只要允许使用orm，大部情况下，这种方法都是最好的。

注意：
* 要求聚合本身能够被ORM直接映射到数据库。这和ORM本身的映射能力及聚合内状态数据的复杂性有关系
* 不要让数据库表结构设计污染了聚合。思路不要被ORM带偏，比如：因为表有关联，那么对应的聚合就也要有关联


### 手动实现部分ORM功能
如果不能用ORM，从建模角度看，聚合也不适合再被拆分更小，又希望改进性能，那就只能手动实现部分ORM的功能。为了实现这些功能，我们又不期望污染领域模块里的聚合类，可以通过在领域模块外对聚合类子类化的方式来增强它。
比如在领域模块内有聚合和仓储：
```kotlin
interface Book {
  fun read()
}

abstract class BookImpl : Book {

  // 这个 content 是一个很长的字符串，期望延迟加载
  abstract protected fun getContent(): String

  override fun read() {
    // 这里正常使用状态去完成业务逻辑
    println(getContent())
  }
}

interface BookRepository {
  fun loadbyId(id: BooId): Book
}
```

在领域模块外，实现仓储的地方：
```kotlin
class MyBook(
  private var contentLoaded: Boolean = false,
  private var content: String = "",
  private val bookDao: BookDao
): BookImpl {

  override fun getContent(): String {
    // 这里实现延迟加载
    return if (contentLoaded) {
      content
    } else {
      content = bookDao.selectContentByBooId(this.id)
      contentLoaded = true
      content
    }
  }
}

class BookRepositoryImpl(
  private val bookDao: BookDao
) : BookRepository {
  override fun loadbyId(id: BooId): Book {
    // 查询的时候，并没有载入content 
    return MyBook(bookDao = bookDao)
  } 
}
```
如果需要延迟加载的属性很多，可以写个工具类，简化上面的样板代码。

可以利用同样的技巧去实现增量更新sql。比如
* 在子类记录某个状态是否修改过，保存时，只生成更新过的字段的sql
* 或者把查询时的数据快照存放到子类中，保存时对状态做比对，只生成差异更新sql

可以在仓储实现的时候，把某个对象的id及对应的聚合实例对象存放到事务上下文中，下次查询的时候，返回同一个对象。
如果你用了特别多这种技巧，强烈建议不如直接采用成熟的ORM框架，可以减少很多开发量，同时也比自己手写的更加强大和可靠。

### 使用ORM但不直接映射聚合
如果使用ORM，但是聚合的状态不能或者不适合直接映射到数据库上，那么可以采用上面类似的子类化的技巧去解决。

领域模块代码：

```kotlin
interface Book {
  fun read()
}

// 这个聚合根没有被直接通过ORM映射
abstract class BookImpl : Book {

  // 这个属性是抽象的，它的读写没有定义
  abstract protected var content: String

  override fun read() {
    // 这里正常使用状态去完成业务逻辑
    println(this.content)
    content = content + ": read at ${LocalDateTime.now()}"
  }

}

interface BookRepository {
  fun loadbyId(id: BooId): Book
}
```

在领域模块外，实现仓储的地方：
```kotlin

// 这是ORM映射对象
@Entity
class BookRecord(
  @Id
  var id: Long,

  var content: String
) {

}
class MyBook(
  // 把映射对象关联到聚合上
  private val bookRecord: BookRecord
): BookImpl {

  // 在这里实现抽象属性，实际是操作了映射对象
  override protected var content = 
    get() = bookRecord.content
    set(value) {
      bookRecord.content = content
    }
}

class BookRepositoryImpl(
  private val entityManager: EntityMananger
) : BookRepository {
  override fun loadbyId(id: BooId): Book {
    val bookRecord = entityManager.load(BookRecord::class.java, id.value)
    return MyBook(bookRecord)
  } 
}
```

### 直接访问数据库
极端情况，所有涉及到状态变更的行为，都在聚合内定义成抽象的，然后在聚合外实现为直接修改数据库。在一次事务中，会出现频繁变更的时候，这种实现方式性能不好。在某些场景下，可能会有用。



领域模块代码：

```kotlin
interface Book {
  fun read()
}

// 这个聚合根没有被直接通过ORM映射
abstract class BookImpl : Book {

  // 这个属性是抽象的，它的读写没有定义
  abstract protected var content: String

  override fun read() {
    // 这里正常使用状态去完成业务逻辑
    println(this.content)
    content = content + ": read at ${LocalDateTime.now()}"
  }

}

interface BookRepository {
  fun loadbyId(id: BooId): Book
}
```

在领域模块外，实现仓储的地方：
```kotlin

class MyBook(
  private val bookDao: BookDao
): BookImpl {

  // 在这里实现抽象属性，实际直接操作数据库
  override protected var content = 
    get() = bookDao.selectContentById(this.id.value) 
    set(value) {
      bookDao.updateContentById(this.id.value)
    }
}

class BookRepositoryImpl(
  private val bookDao: BookDao
) : BookRepository {
  override fun loadbyId(id: BooId): Book {
    return MyBook(bookDao)
  } 
}
```