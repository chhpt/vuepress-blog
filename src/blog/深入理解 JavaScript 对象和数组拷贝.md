---
title: 深入理解 JavaScript 对象和数组拷贝
date: 2017-11-06
type: post
blog: true
excerpt: 本文要解决的问题：为什么会有深拷贝（deep clone）和浅拷贝（shallow clone）的存在，理解 JavaScript 中深拷贝和浅拷贝的区别
tags:
    - JavaScript
---

本文要解决的问题：

- 为什么会有深拷贝（deep clone）和浅拷贝（shallow clone）的存在
- 理解 JavaScript 中深拷贝和浅拷贝的区别
- JavaScript 拷贝对象的注意事项
- JavaScript 拷贝对象和数组的实现方法

部分代码可在这里找到：[Github](https://github.com/chhpt/JavaScript-Exploration/tree/master/shallow_and_deep_copy)。如果发现错误，欢迎指出。

## 一， 理解问题原因所在

JavaScript 中的数据类型可以分为两种：基本类型值（Number, Boolean, String, NULL, Undefined）和引用类型值（Array, Object, Date, RegExp, Function)。 基本类型值指的是简单的数据段，而引用类型值指那些可能由多个值构成的对象。

**基本数据类型是按值访问的**，因为可以直接操作保存在变量中的实际的值。引用类型的值是保存在内存中的对象，与其他语言不同，JavaScript 不允许直接访问内存中的位置，也就是说不能直接操作对象的内存空间。在操作对象时，实际上是在**操作对象的引用**而不是实际的对象。 为此，引用类型的值是按引用访问的。

除了保存的方式不同之外，在从一个变量向另一个变量复制基本类型值和引用类型值时，也存在不同：

- 如果从一个变量向另一个变量复制基本类型的值，会在变量对象上创建一个新值，然后把该值复制到为新变量分配的位置上。
- 当从一个变量向另一个变量复制引用类型的值时，同样也会将存储在变量对象中的值复制一份放到为新变量分配的空间中。不同的是，这个值的副本实际上是一个指针，而这个指针指向存储在堆中的一个对象。复制操作结束后，两个变量实际上将引用同一个对象。因此，改变其中一个变量，就会影响另一个变量。

看下面的代码：

``` JavaScript
// 基本类型值复制
var string1 = 'base type';
var string2 = string1;

// 引用类型值复制
var object1 = {a: 1};
var object2 = object1;
```

下图可以表示两种类型的变量的复制结果：

![](https://user-gold-cdn.xitu.io/2017/11/6/5371f42a5337a26b55143e59fe9faa64)

至此，我们应该理解：在 JavaScript 中直接复制对象实际上是对引用的复制，会导致两个变量引用同一个对象，对任一变量的修改都会反映到另一个变量上，这是一切问题的原因所在。

## 二， 深拷贝和浅拷贝的区别

理解了 JavaScript 中拷贝对象的问题后，我们就可以讲讲深拷贝和浅拷贝的区别了。考虑这种情况，你需要复制一个对象，这个对象的某个属性还是一个对象，比如这样：

```JavaScript
var object1 = {
  a: 1,
  obj: {
    b: 'string'
  }
}
```
### 浅拷贝

`浅拷贝`存在两种情况：

- 直接拷贝对象，也就是拷贝引用，两个变量`object1` 和 `object2` 之间还是会相互影响。
- 只是简单的拷贝对象的第一层属性，基本类型值不再相互影响，但是对其内部的引用类型值，拷贝的任然是是其引用，内部的引用类型值还是会相互影响。

```JavaScript
// 最简单的浅拷贝
var object2 = object1;

// 拷贝第一层属性
function shallowClone(source) {
    if (!source || typeof source !== 'object') {
        return;
    }
    var targetObj = source.constructor === Array ? [] : {};
    for (var keys in source) {
        if (source.hasOwnProperty(keys)) {
            // 简单的拷贝属性
            targetObj[keys] = source[keys];
        }
    }
    return targetObj;
}

var object3 = shallowClone(object1);
// 改变原对象的属性
object1.a = 2;
object1.obj.b = 'newString';
// 比较
console.log(object2.a); // 2
console.log(object2.obj.b); // 'newString'
console.log(object3.a); // 1
console.log(object3.obj.b); // 'newString'
```

浅拷贝存在许多问题，需要我们注意：

- 只能拷贝可枚举的属性。
- 所生成的`拷贝对象`的原型与`原对象`的原型不同，拷贝对象只是 Object 的一个实例。
- 原对象从它的原型继承的属性也会被拷贝到新对象中，就像是原对象的属性一样，无法区分。
- 属性的描述符（descriptor）无法被复制，一个只读的属性在拷贝对象中可能会是可写的。
- 如果属性是对象的话，原对象的属性会与拷贝对象的属性会指向一个对象，会彼此影响。

不能理解这些概念？可以看看下面的代码：

```JavaScript
function Parent() {
  this.name = 'parent';
  this.a = 1;
}
function Child() {
  this.name = 'child';
  this.b = 2;
}

Child.prototype = new Parent();
var child1 = new Child();
// 更改 child1 的 name 属性的描述符
Object.defineProperty(child1, 'name', {
  writable: false,
  value: 'Mike'
});
// 拷贝对象
var child2 = shallowClone(child1);

// Object {value: "Nicholas", writable: false, enumerable: true, configurable: true}
console.log(Object.getOwnPropertyDescriptor(child1, 'name'));

// 这里新对象的 name 属性的描述符已经发生了变化
// Object {value: "Nicholas", writable: true, enumerable: true, configurable: true}
console.log(Object.getOwnPropertyDescriptor(child2, 'name'));

child1.name = 'newName'; // 严格模式下报错
child2.name = 'newName'; // 可以赋值
console.log(child1.name); //  Mike
console.log(child2.name); // newName
```

上面的代码通过构造函数 `Child` 构造一个对象 `child1`，这个对象的原型是 `Parent`。并且修改了 `child1` 的 `name` 属性的描述符，设置 `writable` 为 `false`，也就是这个属性不能再被修改。如果要直接给 `child1.name` 赋值，在严格模式下会报错，在非严格模式则会赋值失败（但不会报错）。

我们调用前面提到的浅拷贝函数 `shallowClone` 来拷贝 `child1` 对象，生成了新的对象 `child2`，输出 `child2` 的 `name` 属性的描述符，我们可以发现 `child2` 的 `name` 属性的描述符与 `child1` 已经不一样了（变成了可写的）。在 VSCode 中开启调试模式，查看 `child1` 和 `child2` 的原型，我们也会发现它们的原型也是不同的：

![](https://user-gold-cdn.xitu.io/2017/11/6/b02cea00b497468e7a411fbee8c15169)


`child1` 的原型是 `Parent`，而 `child2` 的原型则是 `Object`。

通过上面的例子和简短的说明，我们可以大致理解浅拷贝存在的一些问题，在实际使用过程中也能有自己的判断。

### 深拷贝

`深拷贝`就是将对象的属性递归的拷贝到一个新的对象上，两个对象有不同的地址，不同的引用，也包括对象里的对象属性（如 object1 中的 obj 属性），两个变量之间完全独立。

### 没有银弹 - 根据实际需求
既然浅拷贝有那么多问题，我们为什么还要说浅拷贝？一来是深拷贝的完美实现不那么容易（甚至不存在），而且可能存在性能问题，二来是有些时候的确不需要深拷贝，那么我们也就没必要纠结于与深拷贝和浅拷贝了，没有必要跟自己过不去不是？

一句话：根据自己的实际需选择不同的方法。

## 三， 实现对象和数组浅拷贝
### 对象浅拷贝
前面已经介绍了对象的两种浅拷贝方式，这里就不做说明了。下面介绍其他的几种方式
#### 1. 使用 Object.assign 方法
`Object.assign()` 用于将一个或多个源对象中的所有`可枚举的属性`值复制到目标对象。`Object.assign()` 只是浅拷贝，类似上文提到的 `shallowClone` 方法。

```JavaScript
var object1 = {
  a: 1,
  obj: {
    b: 'string'
  }
};

// 浅拷贝
var copy = Object.assign({}, object1);
// 改变原对象属性
object1.a = 2;
object1.obj.b = 'newString';

console.log(copy.a); // 1
console.log(copy.obj.b); // `newString`
```

#### 2. 使用 Object.getOwnPropertyNames 拷贝不可枚举的属性

`Object.getOwnPropertyNames()` 返回由对象属性组成的一个数组，包括不可枚举的属性（除了使用 Symbol 的属性）。

``` JavaScript
function shallowCopyOwnProperties( source )
{
    var target = {} ;
    var keys = Object.getOwnPropertyNames( original ) ;
    for ( var i = 0 ; i < keys.length ; i ++ ) {
        target[ keys[ i ] ] = source[ keys[ i ] ] ;
    }
    return target ;
}
```

#### 3. 使用 Object.getPrototypeOf 和 Object.getOwnPropertyDescriptor 拷贝原型与描述符
如果我们需要拷贝原对象的原型和描述符，我们可以使用 `Object.getPrototypeOf` 和 `Object.getOwnPropertyDescriptor` 方法分别获取原对象的原型和描述符，然后使用 `Object.create` 和 `Object.defineProperty` 方法，根据原型和属性的描述符创建新的对象和对象的属性。

```JavaScript
function shallowCopy( source ) {
    // 用 source 的原型创建一个对象
    var target = Object.create( Object.getPrototypeOf( source )) ;
    // 获取对象的所有属性
    var keys = Object.getOwnPropertyNames( source ) ;
    // 循环拷贝对象的所有属性
    for ( var i = 0 ; i < keys.length ; i ++ ) {
        // 用原属性的描述符创建新的属性
        Object.defineProperty( target , keys[ i ] , Object.getOwnPropertyDescriptor( source , keys[ i ])) ;
    }
    return target ;
}
```

### 数组浅拷贝
同上，数组也可以直接复制或者遍历数组的元素直接复制达到浅拷贝的目的：

```JavaScript
var array = [1, 'string', {a: 1,b: 2, obj: {c: 3}}];
// 直接复制
var array1 = array;
// 遍历直接复制
var array2 = [];
for(var key in array) {
  array2[key] = array[key];
}
// 改变原数组元素
array[1] = 'newString';
array[2].c = 4;

console.log(array1[1]); // newString
console.log(array1[2].c); // 4
console.log(array2[1]); // string
console.log(array2[2].c); // 4
```

这没有什么需要特别说明的，我们说些其他方法

#### 使用 slice 和 concat 方法
[`slice()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) 方法将一个数组被选择的部分（默认情况下是全部元素）浅拷贝到一个新数组对象，并返回这个数组对象，原始数组不会被修改。 [`concat()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat?v=a) 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

这两个方法都可以达到拷贝数组的目的，并且是浅拷贝，数组中的对象只是复制了引用：

```js
var array = [1, 'string', {a: 1,b: 2, obj: {c: 3}}];
// slice()
var array1 = array.slice();
// concat()
var array2 = array.concat();
// 改变原数组元素
array[1] = 'newString';
array[2].c = 4;

console.log(array1[1]); // string
console.log(array1[2].c); // 4
console.log(array2[1]); // string
console.log(array2[2].c); // 4
```

## 四， 实现对象和数组深拷贝
实现深拷贝的方法大致有两种：

- 利用 `JSON.stringify` 和 `JSON.parse` 方法
- 遍历对象的属性（或数组的元素），分别拷贝

下面就两种方法详细说说

#### 1. 使用 JSON.stringify 和 JSON.parse 方法
`JSON.stringify`和`JSON.parse` 是 JavaScript 内置对象 JSON 的两个方法，主要是用来将 JavaScript 对象序列化为 JSON 字符串和把 JSON 字符串解析为原生 JavaScript 值。这里被用来实现对象的拷贝也算是一种黑魔法吧：

```JavaScript
var obj = { a: 1, b: { c: 2 }};
// 深拷贝
var newObj = JSON.parse(JSON.stringify(obj));
// 改变原对象的属性
obj.b.c = 20;

console.log(obj); // { a: 1, b: { c: 20 } }
console.log(newObj); // { a: 1, b: { c: 2 } }
```

但是这种方式有一定的局限性，就是对象必须遵从JSON的格式，当遇到层级较深，且序列化对象不完全符合JSON格式时，使用JSON的方式进行深拷贝就会出现问题。

在序列化 JavaScript 对象时，所有`函数及原型成员`都会被有意忽略，不体现在结果中，也就是说这种方法不能拷贝对象中的函数。此外，值为 undefined 的任何属性也都会被跳过。结果中最终都是值为有效 JSON 数据类型的实例属性。

#### 2. 使用递归
递归是一种常见的解决这种问题的方法：我们可以定义一个函数，遍历对象的属性，当对象的属性是基本类型值得时候，直接拷贝；当属性是引用类型值的时候，再次调用这个函数进行递归拷贝。这是基本的思想，下面看具体的实现（不考虑原型，描述符，不可枚举属性等，便于理解）：

``` JavaScript
function deepClone(source) {
  // 递归终止条件
  if (!source || typeof source !== 'object') {
    return source;
  }
  var targetObj = source.constructor === Array ? [] : {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) {
      if (source[key] && typeof source[key] === 'object') {
        targetObj[key] = deepClone(source[key]);
      } else {
        targetObj[key] = source[key];
      }
    }
  }
  return targetObj;
}

var object1 = {arr: [1, 2, 3], obj: {key: 'value' }, func: function(){return 1;}};

// 深拷贝
var newObj= deepClone(object1);
// 改变原对象属性
object1.arr.push(4);

console.log(object1.arr); // [1, 2, 3, 4]
console.log(newObj.arr); // [1, 2, 3]
```

对于 Function 类型，这里是直接复制的，任然是共享一个内存地址。因为函数更多的是完成某些功能，对函数的更改可能就是直接重新赋值，一般情况下不考虑深拷贝。

上面的深拷贝只是比较简单的实现，没有考虑很复杂的情况，比如：

- 其他引用类型：Function，Date，RegExp 的拷贝
- 对象中存在循环引用(Circular references)会导致调用栈溢出
- 通过闭包作用域来实现私有成员的这类对象不能真正的被拷贝


**什么是闭包作用域**

```JavaScript
function myConstructor()
{
    var myPrivateVar = 'secret' ;
    return {
        myPublicVar: 'public!' ,
        getMyPrivateVar: function() {
            return myPrivateVar ;
        } ,
        setMyPrivateVar( value ) {
            myPrivateVar = value.toString() ;
        }
    };
}
var o = myContructor() ;
```

上面的代码中，对象 o 有三个属性，一个是字符串，另外两个是方法。方法中用到一个变量 `myPrivateVar`，存在于 `myConstructor()` 的函数作用域中，当 `myConstructor` 构造函数调用时，就创建了这个变量 `myPrivateVar`，然而这个变量并不是通过构造函数创建的对象 `o` 的属性，但是它任然可以被这两个方法使用。

因此，如果尝试深拷贝对象 `o`，那么拷贝对象 `clone` 和被拷贝对象 `original` 中的方法都是引用相同的 `myPrivateVar` 变量。

但是，由于并没有方式改变闭包的作用域，所以这种模式创建的对象不能正常深拷贝是可以接受的。

#### 3. 使用队列
递归的做法虽然简单，容易理解，但是存在一定的性能问题，对拷贝比较大的对象来说不是很好的选择。

理论上来说，递归是可以转化成循环的，我们可以尝试着将深拷贝中的递归转化成循环。我们需要遍历对象的属性，如果属性是基本类型，直接复制，如果属性是引用类型（对象或数组），需要再遍历这个对象，对他的属性进行相同的操作。那么我们需要一个容器来存放需要进行遍历的对象，每次从容器中拿出一个对象进行拷贝处理，如果处理过程中遇到新的对象，那么再把它放到这个容器中准备进行下一轮的处理，当把容器中所有的对象都处理完成后，也就完成了对象的拷贝。

思想大致是这样的，下面看具体的实现：

```js
// 利用队列的思想优化递归
function deepClone(source) {
  if (!source || typeof source !== 'object') {
    return source;
  }
  var current;
  var target = source.constructor === Array ? [] : {};
  // 用数组作为容器
  // 记录被拷贝的原对象和目标
  var cloneQueue = [{
    source,
    target
  }];
  // 先进先出，更接近于递归
  while (current = cloneQueue.shift()) {
    for (var key in current.source) {
      if (Object.prototype.hasOwnProperty.call(current.source, key)) {
        if (current.source[key] && typeof current.source[key] === 'object') {
          current.target[key] = current.source[key].constructor === Array ? [] : {};
          cloneQueue.push({
            source: current.source[key],
            target: current.target[key]
          });
        } else {
          current.target[key] = current.source[key];
        }
      }
    }
  }
  return target;
}

var object1 = {a: 1, b: {c: 2, d: 3}};
var object2 = deepClone(object1);

console.log(object2); // {a: 1, b: {c: 2, d: 3}}
```

（完）

### 参考
1. 《JavaScript 高级程序设计》
2.  [JavaScript中的浅拷贝和深拷贝](https://segmentfault.com/a/1190000008637489)
3. [探究 JS 中的浅拷贝和深拷贝](https://objcer.com/2017/02/27/Dive-into-shallow-and-deep-clone-in-JavaScript/)
4. [Understanding Object Cloning in Javascript - Part. I](http://blog.soulserv.net/understanding-object-cloning-in-javascript-part-i/)
5. [Understanding Object Cloning in Javascript - Part. II](http://blog.soulserv.net/understanding-object-cloning-in-javascript-part-ii/)