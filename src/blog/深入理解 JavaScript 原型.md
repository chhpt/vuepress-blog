---
title: 深入理解 JavaScript 原型
date: 2017-11-14
type: post
blog: true
excerpt: 原型，作为前端开发者，或多或少都有听说。你可能一直想了解它，但是由于各种原因还没有了解，现在就跟随我来一起探索它吧。本文将由浅入深，一点一点揭开 JavaScript 原型的神秘面纱。（需要了解基本的 JavaScript 对象知识）
tags:
    - VuePress
---

原型，作为前端开发者，或多或少都有听说。你可能一直想了解它，但是由于各种原因还没有了解，现在就跟随我来一起探索它吧。本文将由浅入深，一点一点揭开 JavaScript 原型的神秘面纱。（需要了解基本的 JavaScript 对象知识）

源代码：[GitHub](https://github.com/chhpt/JavaScript-Exploration/tree/master/prototype_and_prototype_chain)

## 原型

### 1. 原型是什么？

在我们深入探索之前，当然要先了解原型是什么了，不然一切都无从谈起。谈起原型，那得先从对象说起，且让我们慢慢说起。

我们都知道，JavaScript 是一门基于对象的脚本语言，但是它却没有类的概念，所以 JavaScript 中的对象和基于类的语言（如 Java）中的对象有所不同。JavaScript 中的对象是无序属性的集合，其属性可以包含基本值，对象或者函数，听起来更像是键值对的集合，事实上也比较类似。有了对象，按理说得有继承，不然对象之间没有任何联系，也就真沦为键值对的集合了。那没有类的 JavaScript 是怎么实现继承的呢？

我们知道，在 JavaScript 中可以使用构造函数语法（通过 new 调用的函数通常被称为构造函数）来创建一个新的对象，像下面这样：

``` JavaScript
// 构造函数，无返回值
function Person(name) {
  this.name = name;
}
// 通过 new 新建一个对象
var person = new Person('Mike');
```

这和一般面向对象编程语言中创建对象（Java 或 C++）的语法很类似，只不过是一种简化的设计，`new` 后面跟的不是类，而是构造函数。这里的构造函数可以看做是一种类型，就像面向对象编程语言中的类，但是这样创建的对象除了属性一样外，并没有其他的任何联系，对象之间无法共享属性和方法。每当我们新建一个对象时，都会方法和属性分配一块新的内存，这是极大的资源浪费。考虑到这一点，JavaScript 的设计者 Brendan Eich 决定为构造函数设置一个属性。这个属性指向一个对象，所有实例对象需要共享的属性和方法，都放在这个对象里面，那些不需要共享的属性和方法，就放在构造函数里面。实例对象一旦创建，将自动引用这个对象的属性和方法。也就是说，实例对象的属性和方法，分成两种，一种是本地的，不共享的，另一种是引用的，共享的。这个对象就是原型（prototype）对象，简称为原型。

我们通过函数声明或函数表达式创建的函数都有一个 prototype（原型）属性，这个属性是一个指针，指向一个对象，这个对象就是调用构造函数而创建的对象实例的原型。**特别的，在 ECMA-262 规范中，通过 Function.prototype.bind 创建的函数没有prototype属性**。原型可以包含所有实例共享的属性和方法，也就是说只要是原型有的属性和方法，通过调用构造函数而生成的对象实例都会拥有这些属性和方法。看下面的代码：

``` JavaScript
function Person(name) {
  this.name = name;
}

Person.prototype.age = '20';
Person.prototype.sayName = function() {
  console.log(this.name);
}

var person1 = new Person('Jack');
var person2 = new Person('Mike');

person1.sayName(); // Jack
person2.sayName(); // Mike
console.log(person1.age); // 20
console.log(person2.age); // 20
```

这段代码中我们声明了一个 `Person` 函数，并在这个函数的原型上添加了 `age` 属性和 `sayName` 方法，然后生成了两个对象实例 `person1` 和 `person2`，这两个实例分别拥有自己的属性 `name` 和原型的属性 `age` 以及方法 `sayName`。所有的实例对象共享原型对象的属性和方法，那么看起来，原型对象就像是类，我们就可以用原型来实现继承了。

### 2. constructor 与 [[Prototype]]

我们知道每个函数都有一个 prototype 属性，指向函数的原型，因此当我们拿到一个函数的时候，就可以确定函数的原型。反之，如果给我们一个函数的原型，我们怎么知道这个原型是属于哪个函数的呢？这就要说说原型的 constructor 属性了：

>在默认情况下，所有原型对象都会自动获得一个 constructor （构造函数）属性，这个属性包含一个指向 prototype 属性所在函数的指针。

也就是说每个原型都有都有一个 constructor 属性，指向了原型所在的函数，拿前面的例子来说 Person.prototype.constructor 指向 Person。下面是构造函数和原型的关系说明图：

![](https://user-gold-cdn.xitu.io/2017/11/14/15fb87e414fdfc08?w=1378&h=514&f=png&s=69237)

继续，让我们说说 `[[prototype]]`。

当我们调用构造函数创建一个新的实例（新的对象）之后，比如上面例子中的 `person1`，实例的内部会包含一个指针（内部属性），指向构造函数的原型。ECMA-262 第 5 版中管这个指针叫[[Prototype]]。我们可与更新函数和原型的关系图：

![](https://user-gold-cdn.xitu.io/2017/11/14/15fb87e414f54951?w=1370&h=938&f=png&s=121320)

不过在脚本中没有标准的方式访问 [[Prototype]] ， 但在 Firefox、Safari 和 Chrome 中可以通过 `__proto__`属性访问。而在其他实现中，这个属性对脚本则是完全不可见的。不过，要明确的真正重要的一点就是，这个连接存在于实例与构造函数的原型对象之间，而不是存在于实例与构造函数之间。

在 VSCode 中开启调试模式，我们可以看到这些关系：

![](https://user-gold-cdn.xitu.io/2017/11/14/15fb87e416e2c295?w=826&h=1198&f=png&s=206402)

从上图中我们可以看到 `Person` 的 `prototype` 属性和 `person1` 的 `__proto__` 属性是完全一致的，`Person.prototype` 包含了一个 `constructor` 属性，指向了 `Person` 函数。这些可以很好的印证我们上面所说的构造函数、原型、`constructor` 以及 `__proto__` 之间的关系。

### 3. 对象实例与原型

了解完构造函数，原型，对象实例之间的关系后，下面我们来深入探讨一下对象和原型之间的关系。

#### 1. 判断对象实例和原型之间的关系

因为我们无法直接访问实例对象的 `__proto__` 属性，所以当我们想要确定一个对象实例和某个原型之间是否存在关系时，可能会有些困难，好在我们有一些方法可以判断。

我们可以通过 `isPrototypeOf()` 方法判断某个原型和对象实例是否存在关系，或者，我们也可以使用 ES5 新增的方法 `Object.getPrototypeOf()` 获取一个对象实例 `__proto__` 属性的值。看下面的例子：

``` JavaScript
console.log(Person.prototype.isPrototypeOf(person1)); // true
console.log(Object.getPrototypeOf(person1) == Person.prototype); // true
```

#### 2. 对象实例属性和方法的获取

每当代码读取某个对象的某个属性时，都会执行一次搜索，目标是具有给定名字的属性。搜索首先从对象实例本身开始。如果在实例对象中找到了具有给定名字的属性，则返回该属性的值。如果没有找到，则继续搜索 `__proto__` 指针指向的原型对象，在原型对象中查找具有给定名字的属性，如果在原型对象中找到了这个属性，则返回该属性的值。如果还找不到，就会接着查找原型的原型，直到最顶层为止。这正是多个对象实例共享原型所保存的属性和方法的基本原理。

虽然可以通过对象实例访问保存在原型中的值，但却不能通过对象实例重写原型中的值。我们在实例中添加的一个属性，会屏蔽原型中的同名的可写属性，如果属性是只读的，严格模式下会触发错误，非严格模式下则无法屏蔽。另外，通过 `hasOwnProperty` 方法能判断对象实例中是否存在某个属性（不能判断对象原型中是否存在该属性）。来看下面的例子：

``` JavaScript
function Person() {}

Person.prototype.name = 'Nicholas';
Person.prototype.age = 29;
Person.prototype.job = 'Software Engineer';
Person.prototype.sayName = function () {
  console.log(this.name);
};

var person1 = new Person();
var person2 = new Person();

// 设置 phone 属性为不可写
Object.defineProperty(person1, 'phone', {
  writable: false,
  value: '100'
});

// 新增一个访问器属性 address
Object.defineProperty(person1, 'address', {
  set: function(value) {
    console.log('set');
    address = value;
  },
  get: function() {
    return address;
  }
});

// 注意，此处不能用 name，因为函数本身存在 name 属性
console.log(person1.hasOwnProperty('age')); // false
console.log(Person.hasOwnProperty('age')); // false

person1.name = 'Greg';
console.log(person1.hasOwnProperty('name')); // true
console.log(person1.name); //'Greg'——来自实例
console.log(person2.name); //'Nicholas'——来自原型

person1.phone = '123'; // 严格模式下报错
person1.address = 'china hua'; // 调用 set 方法，输出 'set'
console.log(person1.address); // 'china hua'
console.log(person1.phone); // 100
```

#### 3. in 操作符

有两种方式使用 in 操作符：

- 单独使用
   >在单独使用时，in 操作符会在通过对象能够访问给定属性时返回 true，无论该属性存在于实例中还是原型中。

- for-in 循环中使用。
   >在使用 for-in 循环时，返回的是所有能够通过对象访问的、可枚举的（enumerated）属性，其中既包括存在于实例中的属性， 也包括存在于原型中的属性。如果需要获取所有的属性（包括不可枚举的属性），可以使用 Object.getOwnPropertyNames() 方法。

看下面的例子：

``` JavaScript
function Person(){
  this.name = 'Mike';
}

Person.prototype.age = 29;
Person.prototype.job = 'Software Engineer';
Person.prototype.sayName = function(){ console.log(this.name); };

var person = new Person();

for(var item in person) {
  console.log(item); // name age job sayName
}

console.log('name' in person); // true - 来自实例
console.log('age' in person); //  true - 来自原型
```

#### 4. 原型的动态性

由于在对象中查找属性的过程是一次搜索，而实例与原型之间的连接只不过是一个指针，而非一个副本，因此我们对原型对象所做的任何修改都能够立即从实例上反映出来——即使是先创建了实例后修改原型也照样如此：

``` JavaScript
var person = new Person();

Person.prototype.sayHi = function(){ console.log("hi"); };
person.sayHi(); // "hi"
```

上面的代码中，先创建了 `Person` 的一个实例，并将其保存在 `person` 中。然后，下一条语句在 `Person.prototype` 中添加了一个方法 `sayHi()`。即使 `person` 实例是在添加新方法之前创建的，但它仍然可以访问这个新方法。在调用这个方法时，首先会查找 `person` 实例中是否有这个方法，发现没有，然后到 `person` 的原型对象中查找，原型中存在这个方法，查找结束。；

但是下面这种代码所得到的结果就完全不一样了：

``` JavaScript
function Person() {}

var person = new Person();

Person.prototype = {
  constructor: Person,
  name: "Nicholas",
  age: 29,
  job: "Software Engineer",
  sayName: function () {
    console.log(this.name);
  }
};

person.sayName(); // error
```

仔细观察上面的代码，我们直接用对象字面量语法给 `Person.prototype` 赋值，这似乎没有什么问题。但是我们要知道字面量语法会生成一个新的对象，也就是说这里的 `Person.prototype` 是一个新的对象，和 `person` 的 `__proto__` 属性不再有任何关系了。此时，我们再尝试调用 `sayName` 方法就会报错，因为 `person` 的 `__proto__` 属性指向的还是原来的原型对象，而原来的原型对象上并没有 `sayName` 方法，所以就会报错。

## 原型链

### 1. 原型的原型

在前面的例子，我们是直接在原型上添加属性和方法，或者用一个新的对象赋值给原型，那么如果我们让原型对象等于另一个类型的实例，结果会怎样呢？

``` JavaScript
function Person() {
  this.age = '20';
}

Person.prototype.weight = '120';

function Engineer() {
  this.work = 'Front-End';
}

Engineer.prototype = new Person(); // 此时 Engineer.prototype 没有 constructor 属性
Engineer.prototype.constructor = Engineer;

Engineer.prototype.getAge = function() {
  console.log(this.age);
}

var person = new Person();
var engineer = new Engineer();

console.log(person.age); // 20
engineer.getAge(); // 20
console.log(engineer.weight); // 120
console.log(Engineer.prototype.__proto__ == Person.prototype); // true
```

在上面代码中，有两个构造函数 `Person` 和 `Engineer`，可以看做是两个类型，`Engineer` 的原型是 `Person` 的一个实例，**也就是说 `Engineer` 的原型指向了 `Person` 的原型**（注意上面的最后一行代码）。然后我们分别新建一个 `Person` 和 `Engineer` 的实例对象，可以看到 `engineer` 实例对象能够访问到 `Person` 的 `age` 和 `weight` 属性，这很好理解：`Engineer` 的原型是 `Person` 的实例对象，`Person` 的实例对象包含了 `age` 属性，而 `weight` 属性是 `Person` 原型对象的属性，`Person` 的实例对象自然可以访问原型中的属性，同理，`Engineer` 的实例对象 `engineer` 也能访问 `Engineer` 原型上的属性，间接的也能访问 `Person` 原型的属性。

看起来关系有些复杂，不要紧，我们用一张图片来解释这些关系：

![](https://user-gold-cdn.xitu.io/2017/11/14/15fb87e414d534ef?w=1362&h=1536&f=png&s=222883)

是不是一下就很清楚了，顺着图中红色的线，`engineer` 实例对象可以顺利的获取 `Person` 实例的属性以及 `Person` 原型的属性。至此，已经铺垫的差不多了，我们理解了原型的原型之后，也就很容易理解原型链了。

### 2. 原型链

原型链其实不难理解，上图中的红色线组成的链就可以称之为原型链，只不过这是一个不完整的原型链。我们可以这样定义原型链：
>原型对象可以包含一个指向另一个原型（原型2）的指针，相应地，另一个原型（原型2）中也可以包含着一个指向对应构造函数（原型2 的构造函数）的指针。假如另一个原型（原型2）又是另一个类型（原型3 的构造函数）的实例，那么上述关系依然成立，如此层层递进，就构成了实例与原型的链条。这就是所谓原型链的基本概念。

结合上面的图，这个概念不难理解。上面的图中只有两个原型，那么当有更多的原型之后，这个红色的线理论上可以无限延伸，也就构成了原型链。

通过实现原型链，本质上扩展了前面提到过的原型搜索机制：当以读取模式访问一个实例的属性时，首先会在实例中搜索该属性。如果没有找到该属性，则会继续搜索实例的原型。在通过原型链实现继承的情况下，搜索过程就得以沿着原型链继续向上。在找不到属性或方法的情况下，搜索过程总是要一环一环地前行到原型链末端才会停下来。

那么原型链的末端又是什么呢？我们要知道，所有函数的 `默认原型` 都是 Object 的实例，因此默认原型都会包含一个内部指针，指向 `Object.prototype`。我们可以在上面代码的尾部加上一行代码进行验证：

``` JavaScript
console.log(Person.prototype.__proto__ == Object.prototype); // true
```

那 `Object.prototype` 的原型又是什么呢，不可能没有终点啊？聪明的小伙伴可能已经猜到了，没错，就是 `null`，null 表示此处不应该有值，也就是终点了。我们可以在 Chrome 的控制台或 Node 中验证一下：

``` JavaScript
console.log(Object.prototype.__proto__); // null
```

我们更新一下关系图：

![](https://user-gold-cdn.xitu.io/2017/11/14/15fb87e41507798b?w=2054&h=1454&f=png&s=316686)

至此，一切已经很清楚了，下面我们来说说原型链的用处。

## 继承

继承是面向对象语言中的一个很常见的概念，在阅读前面代码的过程中，我们其实已经实现了简单的继承关系，细心的小伙伴可能已经发现了。在 JavaScript 中，实现继承主要是依靠原型链来实现的。

### 1. 原型链实现

一个简的基于原型链的继承实现看起来是这样的：

``` JavaScript
// 父类型
function Super(){
    this.flag = 'super';
}

Super.prototype.getFlag = function(){
    return this.flag;
}
// 子类型
function Sub(){
    this.subFlag = 'sub';
}
// 实现继承
Sub.prototype = new Super();
Sub.prototype.getSubFlag = function(){
    return this.subFlag;
}

var instance = new Sub();

console.log(instance.subFlag); // sub
console.log(instance.flag); // super
```

原型链虽然很强大，可以实现继承，但是会存在一些问题：

1. **引用类型的原型属性**会被所有实例共享。
   在通过原型链来实现继承时，引用类型的属性被会所有实例共享，一旦一个实例修改了引用类型的值，会立刻反应到其他实例上。由于基本类型不是共享的，所以彼此不会影响。

2. 创建子类型的实例时，不能向父类型的构造函数传递参数。
   实际上，应该说是没有办法在不影响所有对象实例的情况下，给父类型的构造函数传递参数，我们传递的参数会成为所有实例的属性。

基于上面两个问题，实践中很少单独使用原型链实现继承。

### 2. 借用构造函数

为了解决上面出现的问题，出现了一种叫做 `借用构造函数的技术`。这种技术的基本思想很简单：`apply()` 或 `call()` 方法，在子类型构造函数的内部调用父类型的构造函数，使得子类型拥有父类型的属性和方法。

``` JavaScript
function Super(properties){
  this.properties = [].concat(properties);
  this.colors = ['red', 'blue', 'green'];
}

function Sub(properties){
  // 继承了 Super，传递参数，互不影响
  Super.apply(this, properties);
}

var instance1 = new Sub(['instance1']);
instance1.colors.push('black');
console.log(instance1.colors); // 'red, blue, green, black'
console.log(instance1.properties[0]); // 'instance1'

var instance2 = new Sub();
console.log(instance2.colors); // 'red, blue, green'
console.log(instance2.properties[0]); // 'undefined'
```

借用构造函数的确可以解决上面提到的两个问题，实例间不会共享属性，也可以向父类型传递参数，但是这种方法任然存在一些问题：子类型无法继承父类型原型中的属性。我们只在子类型的构造函数中调用了父类型的构造函数，没有做其他的，子类型和父类型的原型也就没有任何联系。考虑到这个问题，借用构造函数的技术也是很少单独使用的。

### 3. 组合继承

上面两个方法能够互补彼此的不足之处，我们把这两个方法结合起来，就能比较完美的解决问题了，这就是组合继承。其背后的思路是使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。这样，既通过在原型上定义方法实现了函数复用，又能够保证每个实例都有它自己的属性，从而发挥二者之长。看一个简单的实现：

``` JavaScript
function Super(properties){
  this.properties = [].concat(properties);
  this.colors = ['red', 'blue', 'green'];
}

Super.prototype.log = function() {
  console.log(this.properties[0]);
}

function Sub(properties){
  // 继承了 Super，传递参数，互不影响
  Super.apply(this, properties);
}
// 继承了父类型的原型
Sub.prototype = new Super();
// isPrototypeOf() 和 instance 能正常使用
Sub.prototype.constructor = Sub;

var instance1 = new Sub(['instance1']);
instance1.colors.push('black');
console.log(instance1.colors); // 'red,blue,green,black'
instance1.log(); // 'instance1'

var instance2 = new Sub();
console.log(instance2.colors); // 'red,blue,green'
instance2.log(); // 'undefined'
```

组合继承避免了原型链和借用构造函数的缺陷，融合了它们的优点，是 JavaScript 中最常用的继承模式。组合继承看起来很不错，但是也有它的缺点：无论什么情况下，组合继承都会调用两次父类型的构造函数：一次是在创建子类型原型的时候，另一次是在子类型构造函数内部。

### 4. 寄生组合式继承

为了解决上面组合继承的问题，一种新的继承方式出现了-寄生组合继承，可以说是 JavaScript 中继承最理想的解决方案。

``` JavaScript
// 用于继承的函数
function inheritPrototype(child, parent) {
  var F = function () {}
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructor = child;
}
// 父类型
function Super(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

Super.prototype.sayName = function () {
  console.log(this.name);
};
// 子类型
function Sub(name, age) {
  // 继承基本属性和方法
  SuperType.call(this, name);
  this.age = age;
}

// 继承原型上的属性和方法
inheritPrototype(Sub, Spuer);

Sub.prototype.log = function () {
  console.log(this.age);
};
```

所谓寄生组合式继承，即通过借用构造函数来继承属性，通过借用临时构造函数来继承原型。其背后的基本思路是：不必为了指定子类型的原型而调用父类型的构造函数，我们所需要的无非就是父类型原型的一个副本而已。

### 参考

1. 《JavaScript 高级程序设计》
2. [Javascript继承机制的设计思想](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)
